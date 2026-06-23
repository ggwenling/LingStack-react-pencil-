"use server";

import { AppError } from "@/lib/errors/app-error";
import { registerWithPassword } from "@/lib/services/auth-service";
import { registerSchema } from "@/lib/validation/auth";

type RegisterState = {
  msg: string;
  code: number;
};

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    terms: formData.get("terms"),
  });

  if (!parsed.success) {
    return {
      msg: parsed.error.issues[0]?.message || "注册信息不完整",
      code: 400,
    };
  }

  const { name, email, password } = parsed.data;

  try {
    await registerWithPassword({ name, email, password });
  } catch (error) {
    if (error instanceof AppError) {
      return {
        msg: error.message,
        code: error.status,
      };
    }

    throw error;
  }

  return {
    msg: "注册成功",
    code: 200,
  };
}
