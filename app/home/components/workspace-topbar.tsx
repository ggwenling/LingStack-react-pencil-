"use client";

import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThreadSearchInput } from "./thread-search-input";

type WorkspaceTopbarProps = {
  userName?: string | null;
  breadcrumb?: string;
};

const breadcrumbByPath: Record<string, string> = {
  "/home": "仪表盘",
  "/home/roadmap": "全栈路线图",
  "/home/notes": "学习笔记",
  "/home/resources": "资源库",
  "/home/resources/documents": "学习文档",
  "/home/analytics": "分析",
  "/home/help": "帮助",
  "/home/settings": "个人设置",
};

function resolveBreadcrumb(pathname: string, override?: string) {
  if (override) {
    return override;
  }

  return breadcrumbByPath[pathname] ?? "工作区";
}

export function WorkspaceTopbar({
  userName,
  breadcrumb,
}: WorkspaceTopbarProps) {
  const pathname = usePathname();
  const pageLabel = resolveBreadcrumb(pathname, breadcrumb);
  const initial = userName?.charAt(0)?.toUpperCase() || "L";

  return (
    <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-neutral-200/80 bg-[#f9f9f9]/80 pb-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <nav
        aria-label="面包屑"
        className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-neutral-500"
      >
        <Link href="/home" className="transition-colors hover:text-neutral-950">
          工作区
        </Link>
        <ChevronRight className="size-3.5 shrink-0 text-neutral-300" />
        <span className="truncate font-semibold text-neutral-950">
          {pageLabel}
        </span>
      </nav>

      <div className="flex items-center gap-2.5 sm:justify-end">
        <ThreadSearchInput
          variant="pill"
          className="min-w-0 flex-1 sm:w-[256px] sm:flex-none"
        />
        <button
          type="button"
          aria-label="通知"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-950"
        >
          <Bell className="size-4" />
        </button>
        <Link
          href="/home/settings"
          aria-label="个人设置"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          {initial}
        </Link>
      </div>
    </header>
  );
}
