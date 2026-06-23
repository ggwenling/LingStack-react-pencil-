import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("请输入正确的邮箱"),
  password: z.string().min(1, "请输入密码"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "请输入昵称").max(32, "昵称不能超过 32 个字符"),
    email: z.string().trim().toLowerCase().email("请输入正确的邮箱"),
    password: z.string().min(8, "密码至少 8 位").max(72, "密码不能超过 72 位"),
    confirmPassword: z.string().min(1, "请再次输入密码"),
    terms: z.literal("on", {
      error: "请先同意 LingStack 保存学习会话与学习记录",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "两次输入的密码不一致",
  });

export const sendPasswordResetCodeSchema = z.object({
  email: z.string().trim().toLowerCase().email("请输入正确的邮箱"),
});

export const resetPasswordWithCodeSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("请输入正确的邮箱"),
    code: z
      .string()
      .trim()
      .transform((value) => value.replace(/\D/g, ""))
      .pipe(z.string().regex(/^\d{6}$/, "请输入 6 位数字验证码")),
    password: z.string().min(6, "密码至少 6 位").max(72, "密码不能超过 72 位"),
    confirmPassword: z.string().min(1, "请再次输入密码"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "两次输入的密码不一致",
  });
