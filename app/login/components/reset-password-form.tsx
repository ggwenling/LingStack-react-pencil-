"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Send } from "lucide-react";

import {
  resetPasswordWithCodeAction,
  sendPasswordResetCodeAction,
} from "@/app/login/reset-password/api/actions";
import { Button } from "@/app/login/components/ui/button";
import { Input } from "@/app/login/components/ui/input";
import { SuccessNotice } from "@/app/login/components/success-notice";

export function ResetPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sendMessage, setSendMessage] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [isSending, startSendTransition] = useTransition();

  const initialState = {
    msg: "",
    code: 0,
  };
  const [state, formAction] = useActionState(
    resetPasswordWithCodeAction,
    initialState,
  );
  const isSuccess = state.code === 200;

  useEffect(() => {
    if (!isSuccess) {
      return;
    }

    const timer = window.setTimeout(() => {
      router.push("/login");
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [isSuccess, router]);

  function handleSendCode() {
    startSendTransition(async () => {
      setSendMessage("");
      setSendStatus("idle");

      const result = await sendPasswordResetCodeAction(email);

      setSendMessage(result.msg);
      setSendStatus(result.code === 200 ? "success" : "error");
    });
  }

  return (
    <div className="mt-8 space-y-5">
      {isSuccess && (
        <SuccessNotice title="密码已更新" description={state.msg} />
      )}

      {sendStatus === "success" && sendMessage && (
        <SuccessNotice title="验证码已发送" description={sendMessage} />
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-xs font-medium text-neutral-500">
          邮箱 (Email)
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="请输入邮箱"
              required
              form="reset-password-form"
              className="h-11 rounded-md border-neutral-200 bg-white pr-3 pl-10 focus-visible:ring-neutral-900/10"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleSendCode}
            disabled={isSending || !email.trim()}
            className="h-11 w-full shrink-0 cursor-pointer rounded-md border-neutral-200 px-4 text-sm font-medium text-neutral-950 hover:bg-neutral-50 sm:w-auto"
          >
            <Send className="size-4" />
            {isSending ? "发送中..." : "发送验证码"}
          </Button>
        </div>
      </div>

      {sendStatus === "error" && sendMessage && (
        <p className="text-xs font-medium text-red-600">{sendMessage}</p>
      )}

      <form id="reset-password-form" action={formAction} className="space-y-5">
        <input type="hidden" name="email" value={email} />

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-xs font-medium text-neutral-500"
          >
            新密码 (New Password)
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="创建一个安全的密码"
              required
              minLength={6}
              className="h-11 rounded-md border-neutral-200 bg-white pr-10 pl-10 focus-visible:ring-neutral-900/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700"
              aria-label={showPassword ? "隐藏密码" : "显示密码"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-neutral-400">至少 6 个字符</p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-medium text-neutral-500"
          >
            确认新密码
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="再次输入新密码"
              required
              minLength={6}
              className="h-11 rounded-md border-neutral-200 bg-white pr-10 pl-10 focus-visible:ring-neutral-900/10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700"
              aria-label={showConfirmPassword ? "隐藏确认密码" : "显示确认密码"}
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="code" className="text-xs font-medium text-neutral-500">
            验证码 (Verification Code)
          </label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            required
            maxLength={6}
            pattern="\d{6}"
            onChange={(event) => {
              event.target.value = event.target.value.replace(/\D/g, "").slice(0, 6);
            }}
            className="h-11 rounded-md border-neutral-200 bg-white text-center font-mono text-lg tracking-[0.35em] focus-visible:ring-neutral-900/10"
          />
          <p className="text-xs text-neutral-400">
            请输入发送到您邮箱的 6 位验证码
          </p>
        </div>

        <Button
          type="submit"
          className="h-11 w-full cursor-pointer rounded-md border-neutral-950 bg-neutral-950 text-sm text-white hover:bg-neutral-800"
        >
          重置密码
        </Button>

        {state.msg && !isSuccess && (
          <p className="text-center text-xs font-medium text-red-600">
            {state.msg}
          </p>
        )}
      </form>

      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950"
      >
        <ArrowLeft className="size-4" />
        想起来密码了？返回登录
      </Link>
    </div>
  );
}
