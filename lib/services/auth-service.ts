import bcrypt from "bcryptjs";

import {
  createUserSession,
  isDatabaseUnavailable,
  setSessionCookie,
} from "@/lib/auth/session";
import { AppError } from "@/lib/errors/app-error";
import { sendPasswordResetCodeEmail } from "@/lib/mail/send-password-reset-email";
import { createLoginAudit } from "@/lib/repositories/login-audit-repository";
import { updateUserPasswordHashAndRevokeSessions } from "@/lib/repositories/password-reset-repository";
import { createPasswordUser, findUserByEmail } from "@/lib/repositories/user-repository";
import {
  assertPasswordResetCooldown,
  clearPasswordResetAttemptLimits,
  deletePasswordResetCode,
  generatePasswordResetCode,
  setPasswordResetCode,
  setPasswordResetCooldown,
  verifyPasswordResetCode,
} from "@/lib/redis/password-reset-code-store";

export const PASSWORD_RESET_CODE_SENT_MESSAGE =
  "若该邮箱已注册，验证码已发送，请查收邮件";

export type RequestMeta = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function loginWithPassword(input: {
  email: string;
  password: string;
  request: RequestMeta;
}) {
  try {
    const user = await findUserByEmail(input.email);

    if (!user || !user.passwordHash) {
      await createLoginAudit({
        email: input.email,
        result: "FAILED",
        ipAddress: input.request.ipAddress,
        userAgent: input.request.userAgent,
        reason: "Invalid credentials",
      });
      throw new AppError("UNAUTHORIZED", "邮箱或密码不正确");
    }

    if (user.status !== "ACTIVE") {
      await createLoginAudit({
        userId: user.id,
        email: user.email,
        result: "FAILED",
        ipAddress: input.request.ipAddress,
        userAgent: input.request.userAgent,
        reason: "User is not active",
      });
      throw new AppError("FORBIDDEN", "账户当前不可用");
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      await createLoginAudit({
        userId: user.id,
        email: user.email,
        result: "FAILED",
        ipAddress: input.request.ipAddress,
        userAgent: input.request.userAgent,
        reason: "Invalid password",
      });
      throw new AppError("UNAUTHORIZED", "邮箱或密码不正确");
    }

    const session = await createUserSession({
      userId: user.id,
      email: user.email,
      ipAddress: input.request.ipAddress,
      userAgent: input.request.userAgent,
    });
    await setSessionCookie(session.token, session.expiresAt);
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      throw new AppError("DATABASE_UNAVAILABLE", "数据库暂时不可用，请稍后再试");
    }

    throw error;
  }
}

export async function registerWithPassword(input: {
  name: string;
  email: string;
  password: string;
}) {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new AppError("CONFLICT", "这个账户已经被创建了");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  await createPasswordUser({
    name: input.name,
    email: input.email,
    passwordHash,
  });
}

export async function sendPasswordResetCode(email: string) {
  try {
    await assertPasswordResetCooldown(email);

    const user = await findUserByEmail(email);

    if (!user || !user.passwordHash) {
      await setPasswordResetCooldown(email);
      return;
    }

    const plainCode = generatePasswordResetCode();
    const requestedAt = new Date();

    await setPasswordResetCode({
      email: user.email,
      userId: user.id,
      plainCode,
    });

    await sendPasswordResetCodeEmail({
      email: user.email,
      code: plainCode,
      requestedAt,
    });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      throw new AppError("DATABASE_UNAVAILABLE", "数据库暂时不可用，请稍后再试");
    }

    throw error;
  }
}

export async function resetPasswordWithCode(input: {
  email: string;
  code: string;
  password: string;
  request?: RequestMeta;
}) {
  try {
    const userId = await verifyPasswordResetCode({
      email: input.email,
      plainCode: input.code,
      ipAddress: input.request?.ipAddress,
    });

    const user = await findUserByEmail(input.email);

    if (!user || user.id !== userId || !user.passwordHash) {
      throw new AppError("BAD_REQUEST", "账户状态异常，请重新发送验证码");
    }

    if (user.status !== "ACTIVE") {
      throw new AppError("FORBIDDEN", "账户当前不可用");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    await updateUserPasswordHashAndRevokeSessions(userId, passwordHash);
    await deletePasswordResetCode(input.email);
    await clearPasswordResetAttemptLimits({
      email: input.email,
      ipAddress: input.request?.ipAddress,
    });
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      throw new AppError("DATABASE_UNAVAILABLE", "数据库暂时不可用，请稍后再试");
    }

    throw error;
  }
}
