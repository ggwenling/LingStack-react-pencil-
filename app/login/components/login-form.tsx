"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { GitBranch } from "lucide-react";

import { login } from "../api/actions";
import { Button } from "@/app/login/components/ui/button";
import { Checkbox } from "@/app/login/components/ui/checkbox";
import { Input } from "@/app/login/components/ui/input";
import { SuccessNotice } from "@/app/login/components/success-notice";

export function LoginForm() {
  const router = useRouter();
  const initialState = {
    msg: "",
    code: 0,
    redirectTo: "",
  };
  const [state, formAction] = useActionState(login, initialState);
  const isSuccess = state.code === 200;

  useEffect(() => {
    if (!isSuccess || !state.redirectTo) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.push(state.redirectTo || "/");
    }, 900);

    return () => window.clearTimeout(timer);
  }, [isSuccess, router, state.redirectTo]);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {isSuccess && (
        <SuccessNotice
          title="登录成功"
          description="正在进入 LingStack 学习工作台"
        />
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-medium text-neutral-500">
          邮箱地址
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="user@example.com"
          className="h-11 rounded-md border-neutral-200 bg-white focus-visible:ring-neutral-900/10"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="password"
            className="text-xs font-medium text-neutral-500"
          >
            登录密码
          </label>
          <Link
            href="/login/reset-password"
            className="text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900"
          >
            忘记密码?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          className="h-11 rounded-md border-neutral-200 bg-white focus-visible:ring-neutral-900/10"
        />
      </div>

      <label className="flex items-center gap-2.5 text-sm text-neutral-600">
        <Checkbox name="remember" />
        记住我
      </label>

      <Button
        type="submit"
        className="h-11 w-full cursor-pointer rounded-md border-neutral-950 bg-neutral-950 text-sm text-white hover:bg-neutral-800"
      >
        登录
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
        使用 GitHub 登录
      </Link>

      <p className="pt-1 text-center text-sm text-neutral-500">
        没有账号？
        <Link
          href="/login/register"
          className="ml-1 font-semibold text-neutral-950 transition-colors hover:text-neutral-700"
        >
          立即注册
        </Link>
      </p>
    </form>
  );
}
