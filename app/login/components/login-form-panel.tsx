import { HELP_CONTACT_EMAIL } from "@/lib/help/help-content";

import { LoginForm } from "./login-form";

export function LoginFormPanel() {
  return (
    <aside className="flex min-h-screen flex-col border-t border-neutral-200 bg-white px-6 py-8 sm:px-10 sm:py-10 lg:border-t-0 lg:border-l lg:px-12 lg:py-12 xl:px-14">
      <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-[28px]">
            登录 LingStack
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            继续你的 React + Next.js 学习进度
          </p>
        </div>

        <LoginForm />
      </div>

      <footer className="mx-auto flex w-full max-w-[360px] items-center justify-between gap-4 text-[11px] text-neutral-400">
        <span>LINGSTACK © 2026 · 免费开源项目</span>
        <a
          href={`mailto:${HELP_CONTACT_EMAIL}`}
          className="shrink-0 transition-colors hover:text-neutral-700"
        >
          {HELP_CONTACT_EMAIL}
        </a>
      </footer>
    </aside>
  );
}
