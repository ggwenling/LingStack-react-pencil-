"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type RegisterState = {
  msg: string;
  code: number;
};

export async function register(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    return {
      msg: "这个账户已经被创建了",
      code: 409,
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      status: "ACTIVE",
    },
  });

  return {
    msg: "注册成功",
    code: 200,
  };
}
