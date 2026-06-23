"use client";

import type { AnalyticsView } from "@/lib/learning/analytics";
import { cn } from "@/lib/utils";

import { AnimatedNumber } from "./animated-number";
import { AnimatedProgressBar } from "./animated-progress-bar";

type KnowledgeMasteryCardProps = {
  data: AnalyticsView["mastery"];
};

export function KnowledgeMasteryCard({ data }: KnowledgeMasteryCardProps) {
  return (
    <article className="lingstack-card-v2 h-full p-5 sm:p-6">
      <h2 className="text-base font-bold text-neutral-950">路线图阶段掌握度</h2>

      <div className="mt-5 space-y-4">
        {data.map((item, index) => {
          const isActive = item.status === "active";
          const isDone = item.status === "done";

          return (
            <div
              key={item.skill}
              className={cn(
                "rounded-xl px-1 py-0.5",
                isActive && "bg-[#F3F6FF]",
              )}
            >
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isActive ? "text-[#2170E4]" : "text-neutral-800",
                    )}
                  >
                    {item.skill}
                  </span>
                  {isActive ? (
                    <span className="shrink-0 rounded-full bg-[#2170E4] px-2 py-0.5 text-[10px] font-bold text-white">
                      当前
                    </span>
                  ) : null}
                  {isDone ? (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      已完成
                    </span>
                  ) : null}
                </div>
                <span className="shrink-0 text-sm font-bold text-neutral-950">
                  <AnimatedNumber value={item.percent} delay={0.1 + index * 0.04} />
                  %
                </span>
              </div>
              <AnimatedProgressBar
                percent={item.percent}
                delay={0.12 + index * 0.05}
                barClassName={isActive ? "bg-[#2170E4]" : isDone ? "bg-emerald-500" : undefined}
              />
            </div>
          );
        })}
      </div>
    </article>
  );
}
