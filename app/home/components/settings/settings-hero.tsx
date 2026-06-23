type SettingsHeroProps = {
  userName: string;
};

export function SettingsHero({ userName }: SettingsHeroProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
          个人设置
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
          管理你的账户资料、学习偏好与会话安全。
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
        <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5">
          <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
          已登录 · {userName}
        </span>
      </div>
    </header>
  );
}
