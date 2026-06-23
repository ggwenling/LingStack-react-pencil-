import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  LoaderCircle,
  Lock,
  PlayCircle,
} from "lucide-react";

import type { RoadmapStageView } from "@/lib/learning/roadmap-page-types";
import { cn } from "@/lib/utils";

type RoadmapStageCardProps = {
  stage: RoadmapStageView;
};

const lockedOpacity = ["opacity-60", "opacity-50", "opacity-40"];

export function RoadmapStageCard({ stage }: RoadmapStageCardProps) {
  const isLocked = stage.status === "locked";
  const opacityClass =
    isLocked && stage.index >= 3
      ? lockedOpacity[Math.min(stage.index - 3, lockedOpacity.length - 1)]
      : isLocked
        ? "opacity-60"
        : undefined;

  const statusLabel =
    stage.status === "done"
      ? "已完成"
      : stage.status === "active"
        ? "进行中"
        : "锁定";

  const statusColor =
    stage.status === "done"
      ? "text-emerald-600"
      : stage.status === "active"
        ? "text-neutral-950"
        : "text-neutral-500";

  return (
    <article
      className={cn(
        "relative z-10 flex gap-6 sm:gap-10",
        opacityClass,
      )}
    >
      <StageIcon status={stage.status} />

      <div
        className={cn(
          "flex-1 rounded-xl border bg-white p-6 shadow-sm sm:p-8",
          stage.status === "active"
            ? "border-neutral-950/20"
            : "border-[#E8E8E8]",
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-4 sm:mb-8">
          <div>
            <span
              className={cn(
                "mb-2 block text-[11px] font-semibold uppercase tracking-widest",
                statusColor,
              )}
            >
              阶段 {String(stage.index).padStart(2, "0")} · {statusLabel}
            </span>
            <h3 className="text-lg font-semibold text-neutral-950 sm:text-xl">
              {stage.displayTitle}
            </h3>
          </div>

          {stage.status === "done" ? (
            <span className="shrink-0 rounded-full border border-emerald-500/10 bg-emerald-500/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
              {stage.percent}%
            </span>
          ) : stage.status === "active" ? (
            <span className="shrink-0 rounded-full border border-neutral-950/10 bg-neutral-950/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-950">
              {stage.percent}%
            </span>
          ) : (
            <Lock className="size-5 shrink-0 text-neutral-300" aria-hidden />
          )}
        </div>

        {stage.status === "done" && stage.modules ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            {stage.modules.map((module) => (
              <div
                key={module.title}
                className="rounded-lg border border-[#E8E8E8] bg-neutral-50/80 p-5"
              >
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                  {module.label}
                </p>
                <p className="text-sm font-medium text-neutral-950">
                  {module.title}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        {stage.status === "active" && stage.lessons ? (
          <>
            <ul className="mb-8 space-y-3">
              {stage.lessons.map((lesson) => (
                <li
                  key={lesson.title}
                  className={cn(
                    "flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors",
                    lesson.status === "active"
                      ? "border-neutral-950/20 bg-neutral-950/[0.02]"
                      : lesson.status === "done"
                        ? "border-[#E8E8E8] bg-neutral-50/50"
                        : "border-[#E8E8E8] bg-neutral-50/30 opacity-60",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {lesson.status === "done" ? (
                      <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                    ) : lesson.status === "active" ? (
                      <PlayCircle className="size-5 shrink-0 animate-pulse text-neutral-950" />
                    ) : (
                      <Circle className="size-5 shrink-0 text-neutral-400" />
                    )}
                    <span
                      className={cn(
                        "truncate text-sm",
                        lesson.status === "active"
                          ? "font-bold text-neutral-950"
                          : lesson.status === "done"
                            ? "font-medium text-neutral-950"
                            : "text-neutral-600",
                      )}
                    >
                      {lesson.title}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-[11px] font-semibold uppercase tracking-wide",
                      lesson.status === "active"
                        ? "text-neutral-950"
                        : "text-neutral-500",
                    )}
                  >
                    {lesson.status === "active" ? "学习中" : `${lesson.hours} 小时`}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/home/ai"
              className="lingstack-btn-primary inline-flex w-full items-center justify-center gap-3 rounded-lg px-10 py-3.5 text-xs font-semibold uppercase tracking-widest sm:w-auto"
            >
              去完成练习
              <ArrowRight className="size-4" />
            </Link>
          </>
        ) : null}

        {stage.status === "locked" ? (
          <>
            {stage.unlockHint ? (
              <p className="mb-6 max-w-2xl text-sm leading-relaxed text-neutral-500 sm:mb-8">
                {stage.unlockHint}
              </p>
            ) : null}
            {stage.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {stage.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-[#E8E8E8] bg-neutral-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}

function StageIcon({ status }: { status: RoadmapStageView["status"] }) {
  if (status === "done") {
    return (
      <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-[#E8E8E8] bg-white shadow-sm sm:size-20">
        <CheckCircle2 className="size-7 text-emerald-500 sm:size-8" />
      </div>
    );
  }

  if (status === "active") {
    return (
      <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-neutral-950 text-white shadow-lg shadow-black/10 sm:size-20">
        <LoaderCircle className="size-7 animate-spin sm:size-8" />
      </div>
    );
  }

  return (
    <div className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-[#E8E8E8] bg-white shadow-sm sm:size-20">
      <Lock className="size-7 text-neutral-400 sm:size-8" />
    </div>
  );
}
