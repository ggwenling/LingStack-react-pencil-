import {
  CheckCircle2,
  CircleDashed,
  Clock,
  Flame,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import type { HomeDashboardView } from "@/lib/learning/home-dashboard-types";
import { cn } from "@/lib/utils";

type ProgressOverviewProps = {
  data: HomeDashboardView["overview"];
};

type TimelineNode = HomeDashboardView["overview"]["timeline"][number];

const statConfig: Array<{
  key: keyof Pick<
    HomeDashboardView["overview"],
    "overallPercent" | "streakDays" | "completedCount" | "totalHours"
  >;
  label: string;
  icon: LucideIcon;
  iconClassName: string;
  renderValue: (data: HomeDashboardView["overview"]) => ReactNode;
}> = [
  {
    key: "overallPercent",
    label: "总进度",
    icon: TrendingUp,
    iconClassName: "text-[#6366F1]",
    renderValue: (d) => `${d.overallPercent}%`,
  },
  {
    key: "streakDays",
    label: "学习天数",
    icon: Flame,
    iconClassName: "text-[#10B981]",
    renderValue: (d) => `${d.streakDays} 天`,
  },
  {
    key: "completedCount",
    label: "已完成",
    icon: CheckCircle2,
    iconClassName: "text-[#A855F7]",
    renderValue: (d) => (
      <>
        {d.completedCount}{" "}
        <span className="text-lg font-semibold text-neutral-500">
          / {d.totalCount}
        </span>
      </>
    ),
  },
  {
    key: "totalHours",
    label: "累计用时",
    icon: Clock,
    iconClassName: "text-neutral-400",
    renderValue: (d) => `${d.totalHours}h`,
  },
];

function getDisplayNodes(timeline: TimelineNode[]) {
  return timeline.slice(0, 4);
}

function computeFilledPercent(nodes: TimelineNode[]) {
  const nodeCount = nodes.length;

  if (nodeCount <= 1) {
    return 0;
  }

  const segmentWidth = 100 / (nodeCount - 1);
  let filledPercent = 0;

  for (let index = 1; index < nodeCount; index += 1) {
    const node = nodes[index];
    const segmentStart = (index - 1) * segmentWidth;

    if (node.percent >= 100) {
      filledPercent = index * segmentWidth;
      continue;
    }

    if (node.percent > 0) {
      filledPercent = segmentStart + (node.percent / 100) * segmentWidth;
      break;
    }

    break;
  }

  return Math.min(100, Math.max(0, filledPercent));
}

function getNodeState(node: TimelineNode, index: number) {
  if (index === 0) {
    return "start" as const;
  }

  if (node.percent >= 100) {
    return "completed" as const;
  }

  if (node.percent > 0) {
    return "active" as const;
  }

  return "pending" as const;
}

export function ProgressOverview({ data }: ProgressOverviewProps) {
  const displayNodes = getDisplayNodes(data.timeline);
  const filledPercent = computeFilledPercent(displayNodes);

  return (
    <article className="lingstack-card-v2 p-5 sm:p-6">
      <div className="mb-6 flex items-center gap-2">
        <CircleDashed className="size-5 text-neutral-500" strokeWidth={2} />
        <h2 className="text-[20px] font-semibold text-neutral-950">学习概览</h2>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
        {statConfig.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.key} className="flex flex-col gap-1">
              <span className="text-base text-neutral-500">{stat.label}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold text-neutral-950">
                  {stat.renderValue(data)}
                </span>
                <Icon
                  className={cn("size-5 shrink-0", stat.iconClassName)}
                  strokeWidth={2}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative hidden pt-6 pb-2 sm:block">
        <div
          className="absolute -translate-x-1/2 -translate-y-full"
          style={{ left: `${filledPercent}%`, top: 0 }}
        >
          <div className="relative mb-2 rounded bg-neutral-950 px-2 py-1 text-[10px] font-semibold tracking-wide text-white uppercase">
            {data.overallPercent}%
            <span
              aria-hidden
              className="absolute top-full left-1/2 size-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-neutral-950"
            />
          </div>
        </div>

        <div className="relative h-1.5 w-full rounded-full bg-[#EEEEEE]">
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-[#6366F1] transition-all"
            style={{ width: `${filledPercent}%` }}
          />

          {displayNodes.map((node, index) => {
            const state = getNodeState(node, index);
            const position =
              displayNodes.length === 1
                ? 0
                : (index / (displayNodes.length - 1)) * 100;

            return (
              <span
                key={`${node.label}-${index}`}
                aria-hidden
                className={cn(
                  "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-[#F9F9F9]",
                  state === "start" &&
                    "border border-neutral-950 bg-neutral-950",
                  state === "completed" && "bg-[#6366F1]",
                  state === "active" && "bg-[#6366F1]",
                  state === "pending" &&
                    "border border-[#E7E7E4] bg-[#EEEEEE]",
                )}
                style={{ left: `${position}%` }}
              />
            );
          })}
        </div>

        <div className="mt-4 flex justify-between gap-2 text-xs">
          {displayNodes.map((node, index) => {
            const state = getNodeState(node, index);
            const isStart = index === 0;

            return (
              <div
                key={`label-${node.label}-${index}`}
                className={cn(
                  "min-w-0 flex-1",
                  index === displayNodes.length - 1 && "text-right",
                  index > 0 &&
                    index < displayNodes.length - 1 &&
                    "text-center",
                )}
              >
                {isStart ? (
                  <span className="font-medium text-neutral-950">开始</span>
                ) : (
                  <span
                    className={cn(
                      "block leading-4",
                      state === "completed" || state === "active"
                        ? "font-medium text-[#6366F1]"
                        : "text-neutral-500",
                    )}
                  >
                    {node.label}
                    <br />
                    {node.percent}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 sm:hidden">
        {displayNodes.map((node, index) => {
          const state = getNodeState(node, index);

          return (
            <div
              key={`${node.label}-mobile-${index}`}
              className="flex items-center justify-between rounded-lg border border-[#E8E8E8] bg-[#fafafa] px-3 py-2"
            >
              <span
                className={cn(
                  "text-xs font-medium",
                  state === "completed" || state === "active"
                    ? "text-[#6366F1]"
                    : "text-neutral-800",
                )}
              >
                {index === 0 ? "开始" : node.label}
              </span>
              <span className="text-xs text-neutral-500">
                {index === 0 ? (node.date ?? "开始") : `${node.percent}%`}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
