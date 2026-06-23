"use server";

import { headers } from "next/headers";

import { AppError } from "@/lib/errors/app-error";
import { loginWithPassword } from "@/lib/services/auth-service";
import { loginSchema } from "@/lib/validation/auth";

export type LoginState = {
  msg: string;
  code: number;
  redirectTo?: string;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      msg: parsed.error.issues[0]?.message || "请输入邮箱和密码",
      code: 400,
    };
  }

  const requestHeaders = await headers();
  const ipAddress = requestHeaders.get("x-forwarded-for");
  const userAgent = requestHeaders.get("user-agent");

  try {
    await loginWithPassword({
      ...parsed.data,
      request: {
        ipAddress,
        userAgent,
      },
    });

    return {
      msg: "登录成功",
      code: 200,
      redirectTo: "/home",
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
