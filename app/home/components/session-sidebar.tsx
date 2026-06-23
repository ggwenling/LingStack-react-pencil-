"use client";

import { Plus } from "lucide-react";

import { createLearningChat } from "@/app/home/api/actions";

import { LearningModuleList } from "./learning-module-list";
import { ThreadSearchInput } from "./thread-search-input";

type SessionSidebarProps = {
  threads: Array<{
    id: string;
    title: string;
    updatedAt: Date;
    module: "REACT" | "NEXT";
  }>;
};

export function SessionSidebar({ threads }: SessionSidebarProps) {
  return (
    <aside className="lingstack-sidebar flex w-full shrink-0 flex-col border-b p-4 lg:h-screen lg:min-h-0 lg:w-[260px] lg:overflow-hidden lg:border-r lg:border-b-0">
      <form action={createLearningChat} className="shrink-0">
        <button
          type="submit"
          className="lingstack-btn-primary flex h-10 w-full cursor-pointer items-center justify-center gap-2 text-[13px]"
        >
          <Plus className="size-4" />
          新建学习会话
        </button>
      </form>

      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden max-h-48 lg:max-h-none">
        <ThreadSearchInput className="mb-3 shrink-0" />
        <p className="shrink-0 px-2 text-[11px] font-bold tracking-wide text-neutral-500 uppercase">
          学习模块
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <LearningModuleList threads={threads} />
        </div>
      </div>
    </aside>
  );
}
