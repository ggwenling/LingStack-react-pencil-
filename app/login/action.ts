"use server";

import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "node:crypto";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";

export type LoginState = {
  msg: string;
  code: number;
  redirectTo?: string;
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return {
      msg: "请输入邮箱和密码",
      code: 400,
    };
  }

  const requestHeaders = await headers();
  const ipAddress = requestHeaders.get("x-forwarded-for");
  const userAgent = requestHeaders.get("user-agent");

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user || !user.passwordHash) {
    await prisma.loginAudit.create({
      data: {
        email,
        result: "FAILED",
        ipAddress,
        userAgent,
        reason: "Invalid credentials",
      },
    });

    return {
      msg: "邮箱或密码不正确",
      code: 401,
    };
  }

  if (user.status !== "ACTIVE") {
    await prisma.loginAudit.create({
      data: {
        userId: user.id,
        email: user.email,
        result: "FAILED",
        ipAddress,
        userAgent,
        reason: "User is not active",
      },
    });

    return {
      msg: "账户当前不可用",
      code: 403,
    };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    await prisma.loginAudit.create({
      data: {
        userId: user.id,
        email: user.email,
        result: "FAILED",
        ipAddress,
        userAgent,
        reason: "Invalid password",
      },
    });

    return {
      msg: "邮箱或密码不正确",
      code: 401,
    };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.session.create({
      data: {
        userId: user.id,
        sessionTokenHash: hashToken(token),
        expiresAt,
        ipAddress,
        userAgent,
      },
    }),
    prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    }),
    prisma.loginAudit.create({
      data: {
        userId: user.id,
        email: user.email,
        result: "SUCCESS",
        ipAddress,
        userAgent,
      },
    }),
  ]);

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return {
    msg: "登录成功",
    code: 200,
    redirectTo: "/home",
  };
}
