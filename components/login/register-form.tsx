"use client";

import { register } from "@/app/login/register/actions";
import Link from "next/link";
import { useActionState } from "react";
import { GitBranch } from "lucide-react";

import { Button } from "@/components/ui/login/button";
import { Checkbox } from "@/components/ui/login/checkbox";
import { Input } from "@/components/ui/login/input";
import { SuccessNotice } from "@/components/login/success-notice";

export function RegisterForm() {
  const initialState = {
    msg: "",
    code: 0,
  };
  const [state, formAction] = useActionState(register, initialState);
  const isSuccess = state.code === 200;

  return (
    <form className="mt-5 space-y-5" action={formAction}>
      {isSuccess && (
        <SuccessNotice
          title="注册成功"
          description="正在为你创建 LingStack 学习空间"
        />
      )}

      <div className="space-y-3.5">
        <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-xs font-bold text-neutral-950"
        >
          昵称
        </label>
        <Input
          id="name"
          name="name"
          placeholder="LingStack learner"
          required
          className="h-11 rounded-lg border-neutral-200 bg-white px-3 text-sm placeholder:text-neutral-500 focus-visible:ring-cyan-700/20"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-xs font-bold text-neutral-950"
        >
          邮箱
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
          className="h-11 rounded-lg border-neutral-200 bg-white px-3 text-sm placeholder:text-neutral-500 focus-visible:ring-cyan-700/20"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-xs font-bold text-neutral-950"
        >
          密码
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="至少 8 位字符"
          required
          minLength={8}
          className="h-11 rounded-lg border-neutral-200 bg-white px-3 text-sm placeholder:text-neutral-500 focus-visible:ring-cyan-700/20"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-xs font-bold text-neutral-950"
        >
          确认密码
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="再次输入密码"
          required
          minLength={8}
          className="h-11 rounded-lg border-neutral-200 bg-white px-3 text-sm placeholder:text-neutral-500 focus-visible:ring-cyan-700/20"
        />
      </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2 text-xs font-medium leading-[1.45] text-neutral-500">
        <Checkbox name="terms" className="mt-0.5 size-4 rounded border-neutral-300" />
        <span className="flex-1">我同意 LingStack 保存我的学习会话与学习记录。</span>
      </label>

      <Button
        type="submit"
        className="h-11 w-full cursor-pointer rounded-lg bg-slate-950 text-sm font-bold text-white shadow-none transition-colors hover:bg-slate-900"
      >
        创建账号
      </Button>

      {state.msg && !isSuccess && (
        <p
          className={
            state.code === 200
              ? "text-center text-xs font-semibold text-emerald-700"
              : "text-center text-xs font-semibold text-red-600"
          }
        >
          {state.msg}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full cursor-pointer rounded-lg border-neutral-200 bg-white text-sm font-semibold text-neutral-950 shadow-none transition-colors hover:bg-neutral-50"
      >
        <GitBranch className="size-4" />
        使用 GitHub 注册
      </Button>

      <p className="text-center text-[13px] text-neutral-500">
        已有账号？
        <Link
          href="/login"
          className="ml-1 cursor-pointer font-bold text-neutral-950 transition-colors hover:text-cyan-800"
        >
          返回登录
        </Link>
      </p>
    </form>
  );
}
