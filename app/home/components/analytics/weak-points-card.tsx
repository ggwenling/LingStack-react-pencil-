"use client";

import { AlertTriangle, CircleAlert, CircleDot } from "lucide-react";

import type { AnalyticsView } from "@/lib/learning/analytics";
import { cn } from "@/lib/utils";

type WeakPointsCardProps = {
  data: AnalyticsView["weakPoints"];
};

const severityConfig = {
  high: {
    icon: AlertTriangle,
    iconClassName: "text-red-500",
    dotClassName: "bg-red-500",
  },
  medium: {
    icon: CircleAlert,
    iconClassName: "text-amber-500",
    dotClassName: "bg-amber-500",
  },
  low: {
    icon: CircleDot,
    iconClassName: "text-neutral-400",
    dotClassName: "bg-neutral-400",
  },
} as const;

export function WeakPointsCard({ data }: WeakPointsCardProps) {
  return (
    <article className="lingstack-card-v2 h-full p-5 sm:p-6">
      <h2 className="text-base font-bold text-neutral-950">薄弱知识点</h2>

      <ul className="mt-4 space-y-3">
        {data.length > 0 ? (
          data.map((item) => {
            const config = severityConfig[item.severity];
            const Icon = config.icon;

            return (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-[#FAFBFF] px-3.5 py-3"
              >
                <Icon className={cn("mt-0.5 size-4 shrink-0", config.iconClassName)} />
                <span className="text-sm font-medium text-neutral-800">
                  {item.title}
                </span>
              </li>
            );
          })
        ) : (
          <li className="rounded-xl border border-dashed border-neutral-200 px-3.5 py-6 text-center text-sm text-neutral-500">
            暂无薄弱知识点，继续保持学习节奏。
          </li>
        )}
      </ul>
    </article>
  );
}
