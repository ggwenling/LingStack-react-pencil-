"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { GitBranch } from "lucide-react";

import { login } from "./action";
import { Button } from "@/components/ui/login/button";
import { Checkbox } from "@/components/ui/login/checkbox";
import { Input } from "@/components/ui/login/input";
import { SuccessNotice } from "@/components/login/success-notice";

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
    <form action={formAction} className="mt-8 space-y-4">
      {isSuccess && (
        <SuccessNotice
          title="登录成功"
          description="正在进入 LingStack 学习工作台"
        />
      )}

      <div className="grid h-10 grid-cols-2 rounded-lg border border-neutral-200 bg-neutral-100 p-1">
        <button
          type="button"
          className="cursor-pointer rounded-md bg-white text-sm font-semibold text-neutral-950 shadow-sm transition-transform hover:-translate-y-0.5"
        >
          登录
        </button>
        <Link
          href="/login/register"
          className="flex cursor-pointer items-center justify-center rounded-md text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-950"
        >
          注册
        </Link>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-semibold text-neutral-900"
        >
          邮箱
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="h-11 bg-white transition-shadow focus-visible:ring-cyan-700/20"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-neutral-900"
        >
          密码
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="输入密码"
          className="h-11 bg-white transition-shadow focus-visible:ring-cyan-700/20"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm text-neutral-500">
          <Checkbox name="remember" />
          记住我
        </label>
        <Link
          href="#"
          className="cursor-pointer text-sm font-semibold text-cyan-700 transition-colors hover:text-cyan-900"
        >
          忘记密码？
        </Link>
      </div>

      <Button
        type="submit"
        className="h-11 w-full cursor-pointer text-sm shadow-[0_14px_30px_-18px_rgba(15,23,42,0.8)] transition-transform hover:-translate-y-0.5"
      >
        登录
      </Button>

      {state.msg && !isSuccess && (
        <p className="text-center text-xs font-semibold text-red-600">
          {state.msg}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full cursor-pointer bg-white text-sm transition-transform hover:-translate-y-0.5"
      >
        <GitBranch className="size-4" />
        使用 GitHub 登录
      </Button>

      <p className="pt-2 text-center text-sm text-neutral-500">
        还没有账号？
        <Link
          href="/login/register"
          className="ml-1 cursor-pointer font-semibold text-neutral-950 transition-colors hover:text-cyan-800"
        >
          立即注册
        </Link>
      </p>
    </form>
  );
}
