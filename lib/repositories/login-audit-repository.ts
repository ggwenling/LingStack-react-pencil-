import { prisma } from "@/lib/db/prisma";

export function createLoginAudit(input: {
  email: string;
  result: "SUCCESS" | "FAILED";
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  reason?: string | null;
}) {
  return prisma.loginAudit.create({
    data: {
      email: input.email,
      result: input.result,
      userId: input.userId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      reason: input.reason,
    },
  });
}
