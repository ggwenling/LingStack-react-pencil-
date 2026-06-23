"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { GitBranch } from "lucide-react";

import { register } from "@/app/login/register/api/actions";
import { Button } from "@/app/login/components/ui/button";
import { Checkbox } from "@/app/login/components/ui/checkbox";
import { Input } from "@/app/login/components/ui/input";
import { SuccessNotice } from "@/app/login/components/success-notice";
import { REGISTER_TERMS_TEXT } from "@/lib/login/register-content";

export function RegisterForm() {
  const router = useRouter();
  const initialState = {
    msg: "",
    code: 0,
  };
  const [state, formAction] = useActionState(register, initialState);
  const isSuccess = state.code === 200;

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.push("/login");
    }, 900);

    return () => window.clearTimeout(timer);
  }, [isSuccess, router]);

  return (
    <form className="mt-8 space-y-5" action={formAction}>
      {isSuccess && (
        <SuccessNotice
          title="注册成功"
          description="即将跳转到登录页"
        />
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-xs font-medium text-neutral-500">
          昵称 (Nickname)
        </label>
        <Input
          id="name"
          name="name"
          placeholder="输入你的学习代号"
          required
          className="h-11 rounded-md border-neutral-200 bg-white focus-visible:ring-neutral-900/10"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-medium text-neutral-500">
          邮箱 (Email)
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
          className="h-11 rounded-md border-neutral-200 bg-white focus-visible:ring-neutral-900/10"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-xs font-medium text-neutral-500"
          >
            密码
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            className="h-11 rounded-md border-neutral-200 bg-white focus-visible:ring-neutral-900/10"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-medium text-neutral-500"
          >
            确认密码
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            className="h-11 rounded-md border-neutral-200 bg-white focus-visible:ring-neutral-900/10"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-neutral-500">
        <Checkbox name="terms" className="mt-0.5" />
        <span className="flex-1">{REGISTER_TERMS_TEXT}</span>
      </label>

      <Button
        type="submit"
        className="h-11 w-full cursor-pointer rounded-md border-neutral-950 bg-neutral-950 text-sm text-white hover:bg-neutral-800"
      >
        创建账号
      </Button>

      {state.msg && !isSuccess && (
        <p className="text-center text-xs font-medium text-red-600">
          {state.msg}
        </p>
      )}

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-200" />
        </div>
        <p className="relative mx-auto w-fit bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
          Or continue with
        </p>
      </div>

      <Link
        href="/api/auth/github"
        className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-50"
      >
        <GitBranch className="size-4" />
        使用 GitHub 注册
      </Link>

      <p className="pt-1 text-center text-sm text-neutral-500">
        已有账号？
        <Link
          href="/login"
          className="ml-1 font-semibold text-neutral-950 transition-colors hover:text-neutral-700"
        >
          登录
        </Link>
      </p>
    </form>
  );
}
