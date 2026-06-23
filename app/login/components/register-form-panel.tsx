import { RegisterForm } from "./register-form";

export function RegisterFormPanel() {
  return (
    <aside className="flex min-h-screen flex-col border-t border-neutral-200 bg-white px-6 py-8 sm:px-10 sm:py-10 lg:border-t-0 lg:border-l lg:px-12 lg:py-12 xl:px-14">
      <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-[28px]">
            注册 LingStack
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            开始保存你的 React + Next.js 学习进度
          </p>
        </div>

        <RegisterForm />
      </div>

      <nav className="mx-auto mt-8 flex w-full max-w-[360px] flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
        <a href="#" className="transition-colors hover:text-neutral-700">
          Privacy Policy
        </a>
        <span className="text-neutral-300">·</span>
        <a href="#" className="transition-colors hover:text-neutral-700">
          Terms of Service
        </a>
        <span className="text-neutral-300">·</span>
        <a href="#" className="transition-colors hover:text-neutral-700">
          System Status
        </a>
      </nav>
    </aside>
  );
}
