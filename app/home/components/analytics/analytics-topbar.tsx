"use client";

import { Bell, Search } from "lucide-react";

type AnalyticsTopbarProps = {
  userName?: string | null;
};

export function AnalyticsTopbar({ userName }: AnalyticsTopbarProps) {
  const initial = userName?.charAt(0)?.toUpperCase() || "L";
  const displayName = userName?.trim() || "学习者";

  return (
    <header className="flex flex-col gap-4 border-b border-neutral-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-950">
          分析
        </h1>
      </div>

      <div className="flex items-center gap-2.5 sm:justify-end">
        <label className="relative min-w-0 flex-1 sm:w-[280px] sm:flex-none">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            placeholder="Search analytics..."
            className="h-10 w-full rounded-xl border border-neutral-200 bg-white pr-3 pl-10 text-sm text-neutral-700 outline-none transition focus:border-[#2170E4]/40 focus:ring-4 focus:ring-[#2170E4]/10"
          />
        </label>

        <button
          type="button"
          aria-label="通知"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-950"
        >
          <Bell className="size-4" />
        </button>

        <div className="hidden items-center gap-2 sm:flex">
          <div className="text-right">
            <p className="text-sm font-semibold text-neutral-950">{displayName}</p>
            <p className="text-[10px] font-bold tracking-[0.12em] text-[#2170E4] uppercase">
              Pro Member
            </p>
          </div>
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-bold text-white"
            aria-hidden
          >
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
