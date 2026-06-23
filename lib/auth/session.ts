import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";

import { prisma } from "@/lib/prisma";

const SESSION_DAYS = 7;

type CreateUserSessionInput = {
  userId: string;
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

const DATABASE_UNAVAILABLE_CODES = new Set([
  "ECONNREFUSED",
  "ENOTFOUND",
  "ETIMEDOUT",
  "P1000",
  "P1001",
  "P1017",
]);

export function isDatabaseUnavailable(error: unknown): boolean {
  if (error === null || typeof error !== "object") {
    return false;
  }

  if ("code" in error) {
    const code = (error as { code: unknown }).code;
    if (typeof code === "string" && DATABASE_UNAVAILABLE_CODES.has(code)) {
      return true;
    }
  }

  if ("cause" in error && isDatabaseUnavailable((error as { cause: unknown }).cause)) {
    return true;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("econnrefused") ||
      message.includes("can't reach database server") ||
      message.includes("connection terminated")
    );
  }

  return false;
}

export async function createUserSession({
  userId,
  email,
  ipAddress,
  userAgent,
}: CreateUserSessionInput) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.session.create({
      data: {
        userId,
        sessionTokenHash: hashToken(token),
        expiresAt,
        ipAddress,
        userAgent,
      },
    }),
    prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastLoginAt: new Date(),
      },
    }),
    prisma.loginAudit.create({
      data: {
        userId,
        email,
        result: "SUCCESS",
        ipAddress,
        userAgent,
      },
    }),
  ]);

  return {
    token,
    expiresAt,
  };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export const getSessionFromToken = cache(async function getSessionFromToken(
  token: string,
) {
  try {
    const session = await prisma.session.findUnique({
      where: {
        sessionTokenHash: hashToken(token),
      },
      select: {
        id: true,
        revokedAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.user.status !== "ACTIVE"
    ) {
      return null;
    }

    return session;
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return null;
    }

    throw error;
  }
});

export async function isSessionValid(token: string) {
  return (await getSessionFromToken(token)) !== null;
}

export const getCurrentUser = cache(async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  const session = await getSessionFromToken(token);
  return session?.user ?? null;
});

export const getCurrentSession = cache(async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const session = await prisma.session.findUnique({
      where: {
        sessionTokenHash: hashToken(token),
      },
      select: {
        id: true,
        revokedAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        user: {
          select: {
            status: true,
          },
        },
      },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.user.status !== "ACTIVE"
    ) {
      return null;
    }

    return {
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    };
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return null;
    }

    throw error;
  }
});

export async function revokeCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    await prisma.session.updateMany({
      where: {
        sessionTokenHash: hashToken(token),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  cookieStore.delete("token");
}
