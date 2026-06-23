import { LogOut, Shield } from "lucide-react";

import { logout } from "@/app/home/settings/api/actions";

type SettingsSecurityCardProps = {
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: Date;
};

function formatSessionLabel(userAgent: string | null) {
  if (!userAgent) {
    return "当前浏览器会话";
  }

  if (userAgent.includes("Windows")) {
    return "Windows 设备";
  }

  if (userAgent.includes("Mac")) {
    return "macOS 设备";
  }

  if (userAgent.includes("Linux")) {
    return "Linux 设备";
  }

  return "当前浏览器会话";
}

export function SettingsSecurityCard({
  userAgent,
  ipAddress,
  createdAt,
}: SettingsSecurityCardProps) {
  return (
    <section className="lingstack-card-v2 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
          <Shield className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-neutral-950">登录与安全</h2>
          <p className="mt-3 text-sm text-neutral-600">
            {formatSessionLabel(userAgent)}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            {ipAddress ? `IP · ${ipAddress}` : "IP · 未记录"}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            登录于 {createdAt.toLocaleString("zh-CN")}
          </p>

          <form action={logout} className="mt-5">
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
            >
              <LogOut className="size-4" />
              退出登录
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
