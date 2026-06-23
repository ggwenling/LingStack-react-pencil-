"use client";

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

import { useThreadSearch } from "./thread-search-context";

type ThreadSearchInputProps = {
  className?: string;
  variant?: "default" | "pill";
  placeholder?: string;
  showKbdHint?: boolean;
};

export function ThreadSearchInput({
  className,
  variant = "default",
  placeholder = "搜索会话...",
  showKbdHint = false,
}: ThreadSearchInputProps) {
  const { query, setQuery } = useThreadSearch();

  return (
    <label
      className={cn(
        "flex h-10 min-w-0 items-center gap-2 border border-neutral-200 bg-white text-[13px] font-medium text-neutral-950",
        variant === "pill"
          ? "rounded-full px-3.5"
          : "rounded-lg px-3",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-neutral-500" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-neutral-950 outline-none placeholder:text-neutral-500"
      />
      {showKbdHint ? (
        <kbd className="hidden shrink-0 rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400 lg:inline">
          ⌘K
        </kbd>
      ) : null}
    </label>
  );
}
