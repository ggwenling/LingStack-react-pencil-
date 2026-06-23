import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { HomeDashboardView } from "@/lib/learning/home-dashboard-types";
import { cn } from "@/lib/utils";

type TodayTasksProps = {
  tasks: HomeDashboardView["tasks"];
};

const statusLabels = {
  done: "已完成",
  active: "进行中",
  pending: "待办",
} as const;

const statusStyles = {
  done: "bg-emerald-50 text-emerald-700",
  active: "bg-blue-50 text-blue-700",
  pending: "bg-neutral-100 text-neutral-500",
} as const;

export function TodayTasks({ tasks }: TodayTasksProps) {
  return (
    <article className="lingstack-card-v2 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-neutral-950">每日任务</h2>
        <Link
          href="/home/ai"
          className="text-[11px] font-semibold text-neutral-400 transition-colors hover:text-neutral-950"
        >
          查看全部
          <ArrowRight className="ml-0.5 inline size-3" />
        </Link>
      </div>

      {tasks.length ? (
        <ul className="mt-4 space-y-3">
          {tasks.map((task) => {
            const content = (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[13px] font-medium leading-5",
                      task.status === "done"
                        ? "text-neutral-400 line-through"
                        : "text-neutral-900",
                    )}
                  >
                    {task.title}
                  </p>
                  {task.status === "active" ? (
                    <p className="mt-1 text-[11px] text-neutral-500">
                      点击前往 AI 练习区完成当前任务。
                    </p>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold",
                    statusStyles[task.status],
                  )}
                >
                  {statusLabels[task.status]}
                </span>
              </div>
            );

            return (
              <li
                key={task.title}
                className={cn(
                  "rounded-xl border px-3.5 py-3",
                  task.status === "active"
                    ? "border-blue-100 bg-blue-50/40"
                    : "border-[#E8E8E8] bg-[#fafafa]",
                )}
              >
                {task.status === "active" ? (
                  <Link href="/home/ai" className="block">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-[#E8E8E8] bg-[#fafafa] px-4 py-8 text-center text-sm text-neutral-500">
          开始第一个练习后，这里会展示每日任务。
        </p>
      )}
    </article>
  );
}
