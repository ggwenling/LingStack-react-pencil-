"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

import { DefaultAvatar } from "@/app/home/components/default-avatar";
import { ThreadSearchInput } from "@/app/home/components/thread-search-input";
import { cn } from "@/lib/utils";

type ChatHeaderProps = {
  userName?: string | null;
  className?: string;
  compact?: boolean;
};

export function ChatHeader({ userName, className, compact = false }: ChatHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-[#E8E8E8] bg-[#f9f9f9] px-4 sm:px-8",
        compact ? "h-12" : "h-16",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-6 sm:gap-8">
        <span className="truncate text-base font-bold tracking-tight text-neutral-950 sm:text-lg">
          LingStack AI
        </span>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {!compact ? (
          <ThreadSearchInput
            variant="pill"
            placeholder="Search workspaces..."
            showKbdHint
            className="hidden h-9 min-w-0 max-w-[220px] border-none bg-[#eeeeee] sm:flex lg:max-w-[256px]"
          />
        ) : null}
        <button
          type="button"
          aria-label="通知"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-200/60 hover:text-neutral-950"
        >
          <Bell className="size-[18px]" />
        </button>
        <Link
          href="/home/settings"
          aria-label="个人设置"
          className="transition-opacity hover:opacity-90"
        >
          <DefaultAvatar name={userName} size="sm" />
        </Link>
      </div>
    </header>
  );
}
