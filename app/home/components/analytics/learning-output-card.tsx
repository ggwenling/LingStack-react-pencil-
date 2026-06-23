"use client";

import { BookOpen, CheckCircle2, Clock3, Code2, MessageSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { AnalyticsView } from "@/lib/learning/analytics";

import { AnimatedNumber } from "./animated-number";

type LearningOutputCardProps = {
  data: AnalyticsView["output"];
};

const metrics: Array<{
  key: keyof AnalyticsView["output"];
  label: string;
  icon: LucideIcon;
  iconClassName: string;
  format?: (value: number) => string;
}> = [
  {
    key: "tasksCompleted",
    label: "练习通过数",
    icon: CheckCircle2,
    iconClassName: "text-[#6366F1]",
  },
  {
    key: "submissionCount",
    label: "提交次数",
    icon: Code2,
    iconClassName: "text-[#2170E4]",
  },
  {
    key: "passRate",
    label: "通过率",
    icon: BookOpen,
    iconClassName: "text-[#10B981]",
    format: (value) => `${value}%`,
  },
  {
    key: "lessonsCompleted",
    label: "完成课节",
    icon: MessageSquare,
    iconClassName: "text-[#6366F1]",
  },
  {
    key: "sessionCount",
    label: "AI 会话数",
    icon: MessageSquare,
    iconClassName: "text-[#2170E4]",
  },
  {
    key: "studyHours",
    label: "学习时长",
    icon: Clock3,
    iconClassName: "text-neutral-500",
    format: (value) => `${value}h`,
  },
];

export function LearningOutputCard({ data }: LearningOutputCardProps) {
  return (
    <article className="lingstack-card-v2 h-full p-5 sm:p-6">
      <h2 className="text-base font-bold text-neutral-950">学习产出</h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const value = data[metric.key];

          return (
            <div
              key={metric.key}
              className="rounded-xl border border-neutral-100 bg-[#FAFBFF] px-4 py-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-neutral-500">
                  {metric.label}
                </p>
                <Icon className={`size-4 ${metric.iconClassName}`} />
              </div>
              <p className="mt-2 text-2xl font-bold text-neutral-950">
                <AnimatedNumber
                  value={value}
                  delay={0.08 + index * 0.05}
                  formatter={metric.format ?? ((next) => next.toLocaleString())}
                />
              </p>
            </div>
          );
        })}
      </div>
    </article>
  );
}
