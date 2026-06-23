import { Code2, Route, Sparkles, Waves } from "lucide-react";

import { REGISTER_PREVIEW } from "@/lib/login/register-content";

export function RegisterWorkspacePreview() {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.22)]">
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl bg-neutral-50 p-4">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
            <Route className="size-3.5" />
            Current Direction
          </div>
          <div className="mt-2 flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-neutral-950">
              {REGISTER_PREVIEW.currentDirection}
            </p>
            <span className="font-mono text-[10px] text-neutral-400">
              {REGISTER_PREVIEW.version}
            </span>
          </div>
        </article>

        <article className="rounded-xl bg-neutral-50 p-4">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
            <Sparkles className="size-3.5" />
            Today&apos;s Task
          </div>
          <p className="mt-2 text-sm font-semibold text-neutral-950">
            {REGISTER_PREVIEW.todayTask}
          </p>
        </article>
      </div>

      <article className="mt-4 rounded-xl bg-neutral-50 p-4">
        <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
          <Sparkles className="size-3.5" />
          AI Assistant
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          {REGISTER_PREVIEW.aiAssistant}
        </p>
      </article>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
          <span>Progress</span>
          <span>{REGISTER_PREVIEW.progressPercent}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-neutral-950"
            style={{ width: `${REGISTER_PREVIEW.progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-4 border-t border-neutral-100 pt-4 text-[11px] font-medium text-neutral-500">
        <span className="flex items-center gap-1.5">
          <Code2 className="size-3.5" />
          Code Focus
        </span>
        <span className="flex items-center gap-1.5">
          <Waves className="size-3.5" />
          Auralis Sync
        </span>
      </div>
    </div>
  );
}
