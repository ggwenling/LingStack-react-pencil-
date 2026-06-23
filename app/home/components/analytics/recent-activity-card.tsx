"use client";

import { BookOpen, CheckCircle2, Code2, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { AnalyticsView } from "@/lib/learning/analytics";
import { cn } from "@/lib/utils";

type RecentActivityCardProps = {
  data: AnalyticsView["recentActivity"];
};

const typeConfig: Record<
  AnalyticsView["recentActivity"][number]["type"],
  { label: string; icon: LucideIcon; iconClassName: string }
> = {
  dialogue: {
    label: "对话",
    icon: MessageSquare,
    iconClassName: "text-[#2170E4]",
  },
  note: {
    label: "笔记",
    icon: BookOpen,
    iconClassName: "text-[#10B981]",
  },
  task: {
    label: "任务",
    icon: CheckCircle2,
    iconClassName: "text-[#6366F1]",
  },
  exercise: {
    label: "练习",
    icon: Code2,
    iconClassName: "text-[#8B5CF6]",
  },
};

function formatActivityTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString("zh-CN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) {
    return `今天，${time}`;
  }

  if (isYesterday) {
    return `昨天，${time}`;
  }

  return `${date.getMonth() + 1}月${date.getDate()}日，${time}`;
}

export function RecentActivityCard({ data }: RecentActivityCardProps) {
  return (
    <article className="lingstack-card-v2 h-full p-5 sm:p-6">
      <h2 className="text-base font-bold text-neutral-950">最近学习活动</h2>

      <ul className="mt-4 space-y-4">
        {data.length > 0 ? (
          data.map((item) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;

            return (
              <li key={`${item.type}-${item.title}-${item.timestamp}`} className="flex gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F3F6FF]">
                  <Icon className={cn("size-4", config.iconClassName)} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold tracking-[0.08em] text-neutral-400 uppercase">
                    {config.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-neutral-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {formatActivityTimestamp(item.timestamp)}
                  </p>
                </div>
              </li>
            );
          })
        ) : (
          <li className="rounded-xl border border-dashed border-neutral-200 px-3.5 py-6 text-center text-sm text-neutral-500">
            还没有学习活动，去 AI 会话开始第一次提问吧。
          </li>
        )}
      </ul>
    </article>
  );
}
