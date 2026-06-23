import type { RoadmapPageView } from "@/lib/learning/roadmap-page-types";

type RoadmapHeroProps = Pick<
  RoadmapPageView,
  "title" | "description" | "overallPercent" | "estimatedHoursRemaining"
>;

export function RoadmapHero({
  title,
  description,
  overallPercent,
  estimatedHoursRemaining,
}: RoadmapHeroProps) {
  return (
    <section className="mb-12 grid grid-cols-1 items-center gap-8 lg:mb-16 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-7">
        <nav
          aria-label="页面路径"
          className="mb-6 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500"
        >
          <span>学习工作区</span>
          <span className="text-neutral-300">/</span>
          <span className="font-bold text-neutral-950">全栈路线图</span>
        </nav>

        <div className="mb-6 flex items-center gap-5">
          <div
            aria-hidden
            className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#61DAFB]/10 text-2xl font-bold text-[#149ECA]"
          >
            R
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            {title}
          </h1>
        </div>

        <p className="mb-10 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
          {description}
        </p>

        <div className="flex flex-wrap items-center gap-8 sm:gap-10">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              当前进度
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-semibold tracking-tight text-neutral-950">
                {overallPercent}%
              </span>
              <div className="h-1 w-32 overflow-hidden rounded-full bg-neutral-200 self-center">
                <div
                  className="h-full rounded-full bg-neutral-950 transition-all"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="hidden h-12 w-px bg-neutral-200 sm:block" aria-hidden />

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
              预计剩余
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold tracking-tight text-neutral-950">
                {estimatedHoursRemaining}
              </span>
              <span className="text-sm font-medium text-neutral-500">小时</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center lg:col-span-5 lg:justify-end">
        <div
          aria-hidden
          className="relative aspect-square w-full max-w-[320px] lg:max-w-[420px]"
        >
          <div className="lingstack-hero-gradient absolute inset-0 rounded-[32px] opacity-80" />
          <div className="absolute inset-8 rounded-full border border-white/60 bg-white/40 backdrop-blur-sm" />
          <div className="absolute inset-16 rounded-full border border-neutral-200/80 bg-white/60" />
          <div className="absolute inset-[72px] rounded-full bg-neutral-950/5" />
        </div>
      </div>
    </section>
  );
}
