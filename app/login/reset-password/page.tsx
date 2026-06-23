import { Shield } from "lucide-react";

import { ResetPasswordForm } from "@/app/login/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-950">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-6 py-8 sm:px-8 sm:py-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400">
            <Shield className="size-3.5" />
            Security Protocol
          </div>
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            System Secure
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            重置密码
          </h1>
          <p className="mt-4 text-sm leading-7 text-neutral-500">
            请输入您的注册邮箱，我们将向您发送 6
            位验证码以验证身份并重置密码。
          </p>

          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}
