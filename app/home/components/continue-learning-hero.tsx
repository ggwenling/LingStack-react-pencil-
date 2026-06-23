import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { HomeDashboardView } from "@/lib/learning/home-dashboard-types";

type ContinueLearningHeroProps = {
  hasLearningActivity: boolean;
  primaryEntry?: HomeDashboardView["entries"][number];
  overallPercent: number;
  currentTopic: string;
  activeModuleLabel: string | null;
};

export function ContinueLearningHero({
  hasLearningActivity,
  primaryEntry,
  overallPercent,
  currentTopic,
  activeModuleLabel,
}: ContinueLearningHeroProps) {
  const description =
    primaryEntry?.description ??
    (hasLearningActivity
      ? "通过个性化的 React 进阶之路继续您的旅程。基于您最近的活动，我们为您准备了最佳的下一步。"
      : "还没有学习记录。去 AI 会话开始第一次提问，LingStack 会自动整理你的学习进度。");

  const moduleLabel =
    activeModuleLabel ?? primaryEntry?.title ?? "React 进阶之路";

  return (
    <article className="lingstack-card-v2 lingstack-hero-gradient relative overflow-hidden p-6 sm:p-8">
      <div className="relative z-[1] flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h1 className="text-3xl font-semibold leading-tight text-neutral-950 sm:text-[42px]">
            今日学习
          </h1>
          <p className="mt-4 text-base leading-7 text-neutral-600 sm:text-lg">
            {description}
          </p>

          {hasLearningActivity ? (
            <p className="mt-3 text-sm font-medium text-neutral-500">
              当前课节：{moduleLabel} · {currentTopic} · 总进度 {overallPercent}%
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/home/ai"
              className="lingstack-btn-primary inline-flex h-11 items-center justify-center rounded-full px-6 text-[13px]"
            >
              {hasLearningActivity ? "继续学习" : "开始第一次 AI 学习"}
            </Link>
            <Link
              href="/home/roadmap"
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-[#E8E8E8] bg-white px-6 text-[13px] font-semibold text-neutral-950 transition-colors hover:bg-neutral-50"
            >
              查看路线图
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        <div
          aria-hidden
          className="relative mx-auto size-48 shrink-0 md:mx-0 md:size-56"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-200/40 to-violet-200/40 blur-2xl" />
          <div className="relative flex size-full items-center justify-center rounded-full border border-white/60 bg-white/40 backdrop-blur-sm">
            <div className="size-24 rounded-full border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-100" />
          </div>
        </div>
      </div>
    </article>
  );
}
