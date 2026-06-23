import { Sparkles } from "lucide-react";

export function SettingsFeaturePreview() {
  return (
    <section className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-neutral-950">功能预告</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            头像上传、多设备会话管理与更细粒度的 AI
            偏好同步正在规划中，后续会在此页面逐步开放。
          </p>
        </div>
      </div>
    </section>
  );
}
