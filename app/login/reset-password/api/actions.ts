"use server";

import { headers } from "next/headers";

import { AppError } from "@/lib/errors/app-error";
import {
  PASSWORD_RESET_CODE_SENT_MESSAGE,
  resetPasswordWithCode,
  sendPasswordResetCode,
} from "@/lib/services/auth-service";
import {
  resetPasswordWithCodeSchema,
  sendPasswordResetCodeSchema,
} from "@/lib/validation/auth";

export type SendPasswordResetCodeState = {
  msg: string;
  code: number;
};

export type ResetPasswordState = {
  msg: string;
  code: number;
};

export async function sendPasswordResetCodeAction(
  email: string,
): Promise<SendPasswordResetCodeState> {
  const parsed = sendPasswordResetCodeSchema.safeParse({ email });

  if (!parsed.success) {
    return {
      msg: parsed.error.issues[0]?.message || "请输入正确的邮箱",
      code: 400,
    };
  }

  try {
    await sendPasswordResetCode(parsed.data.email);

    return {
      msg: PASSWORD_RESET_CODE_SENT_MESSAGE,
      code: 200,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        msg: error.message,
        code: error.status,
      };
    }

    throw error;
  }
}

export async function resetPasswordWithCodeAction(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const parsed = resetPasswordWithCodeSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      msg: parsed.error.issues[0]?.message || "请检查表单输入",
      code: 400,
    };
  }

  try {
    const requestHeaders = await headers();
    const ipAddress = requestHeaders.get("x-forwarded-for");

    await resetPasswordWithCode({
      email: parsed.data.email,
      code: parsed.data.code,
      password: parsed.data.password,
      request: {
        ipAddress,
      },
    });

    return {
      msg: "密码已更新，请使用新密码登录",
      code: 200,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        msg: error.message,
        code: error.status,
      };
    }

    throw error;
  }
}
