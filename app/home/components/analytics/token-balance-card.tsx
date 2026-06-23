"use client";

import { Database } from "lucide-react";

import type { AnalyticsView } from "@/lib/learning/analytics";

import { AnimatedNumber } from "./animated-number";
import { AnimatedProgressBar } from "./animated-progress-bar";

type TokenBalanceCardProps = {
  data: AnalyticsView["token"];
};

export function TokenBalanceCard({ data }: TokenBalanceCardProps) {
  const remainingPercent =
    data.quota > 0 ? Math.round((data.remaining / data.quota) * 100) : 0;

  return (
    <article className="lingstack-card-v2 flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-center gap-2 text-neutral-500">
        <Database className="size-4" />
        <span className="text-xs font-bold tracking-[0.08em] uppercase">
          Token 余额
        </span>
      </div>

      <div className="mt-4 flex items-end gap-2">
        <AnimatedNumber
          value={data.remaining}
          className="text-4xl font-bold tracking-tight text-neutral-950"
        />
        <span className="pb-1 text-sm font-medium text-neutral-500">剩余</span>
      </div>

      <div className="mt-5">
        <AnimatedProgressBar percent={remainingPercent} delay={0.08} />
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-neutral-100 pt-4">
        <div>
          <dt className="text-[11px] font-medium text-neutral-500">已用总量</dt>
          <dd className="mt-1 text-sm font-bold text-neutral-950">
            <AnimatedNumber value={data.totalUsed} delay={0.12} />
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium text-neutral-500">本周消耗</dt>
          <dd className="mt-1 text-sm font-bold text-neutral-950">
            <AnimatedNumber value={data.weeklyUsed} delay={0.16} />
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium text-neutral-500">
            预计剩余对话
          </dt>
          <dd className="mt-1 text-sm font-bold text-neutral-950">
            <AnimatedNumber
              value={data.estimatedTurnsRemaining}
              delay={0.2}
              formatter={(value) => `${value.toLocaleString()} 轮`}
            />
          </dd>
        </div>
      </dl>
    </article>
  );
}
