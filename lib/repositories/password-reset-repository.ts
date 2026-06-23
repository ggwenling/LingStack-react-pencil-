import { createHash, randomBytes } from "node:crypto";

import { prisma, transaction } from "@/lib/db/prisma";

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createPasswordResetTokenValue() {
  return randomBytes(32).toString("hex");
}

export function getPasswordResetExpiresAt() {
  return new Date(Date.now() + PASSWORD_RESET_TTL_MS);
}

export async function invalidatePasswordResetTokensForUser(userId: string) {
  await prisma.passwordResetToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
}

export async function createPasswordResetToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  await invalidatePasswordResetTokensForUser(input.userId);

  return prisma.passwordResetToken.create({
    data: {
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
    },
  });
}

export function findValidPasswordResetToken(tokenHash: string) {
  return prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });
}

export async function markPasswordResetTokenUsed(id: string) {
  return prisma.passwordResetToken.update({
    where: { id },
    data: {
      usedAt: new Date(),
    },
  });
}

export async function updateUserPasswordHash(userId: string, passwordHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
    },
  });
}

export async function updateUserPasswordHashAndRevokeSessions(
  userId: string,
  passwordHash: string,
) {
  const revokedAt = new Date();

  return transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        passwordHash,
      },
    });

    await tx.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt,
      },
    });
  });
}
