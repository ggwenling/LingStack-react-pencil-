import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import type { HomeDashboardView } from "@/lib/learning/home-dashboard-types";
import { cn } from "@/lib/utils";

type LearningRoadmapProps = {
  steps: HomeDashboardView["roadmap"];
};

export function LearningRoadmap({ steps }: LearningRoadmapProps) {
  return (
    <article className="lingstack-card-v2 flex flex-col p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-neutral-950">
          学习路线图
        </h2>
        <Link
          href="/home/roadmap"
          className="text-[11px] font-semibold text-neutral-500 transition-colors hover:text-neutral-950"
        >
          查看完整
        </Link>
      </div>

      <ol className="mt-4 space-y-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;

          return (
            <li key={step.title} className="flex gap-3">
              <div className="flex flex-col items-center pt-0.5">
                <StepIcon status={step.status} />
                {!isLast ? (
                  <span className="my-1 h-6 w-px bg-neutral-200" aria-hidden />
                ) : null}
              </div>

              <div className={cn("min-w-0 flex-1", !isLast && "pb-3")}>
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      "text-[13px] font-medium leading-5",
                      step.status === "pending"
                        ? "text-neutral-400"
                        : "text-neutral-950",
                    )}
                  >
                    {step.title}
                  </p>
                </div>
                <p
                  className={cn(
                    "mt-0.5 text-[11px] font-medium",
                    step.status === "done"
                      ? "text-emerald-600"
                      : step.status === "active"
                        ? "text-neutral-900"
                        : "text-neutral-400",
                  )}
                >
                  {step.status === "done" ? "已完成" : `${step.percent}%`}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <Link
        href="/home/ai"
        className="mt-4 inline-flex items-center gap-1 border-t border-neutral-100 pt-4 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-950"
      >
        继续学习推进路线
        <ArrowRight className="size-3.5" />
      </Link>
    </article>
  );
}

function StepIcon({
  status,
}: {
  status: HomeDashboardView["roadmap"][number]["status"];
}) {
  if (status === "done") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  }

  if (status === "active") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-neutral-950 bg-white" />
    );
  }

  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-neutral-300 bg-white" />
  );
}
