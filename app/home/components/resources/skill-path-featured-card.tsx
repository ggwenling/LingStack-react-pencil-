import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { SkillPathCard } from "@/lib/learning/resources-page-types";

type SkillPathFeaturedCardProps = {
  path: SkillPathCard;
};

export function SkillPathFeaturedCard({ path }: SkillPathFeaturedCardProps) {
  return (
    <article className="lingstack-card-v2 relative flex min-h-[320px] flex-col overflow-hidden p-6 sm:p-8 lg:min-h-[360px]">
      {path.badge ? (
        <span className="inline-flex w-fit rounded-full bg-neutral-950 px-3 py-1 text-[10px] font-semibold tracking-widest text-white uppercase">
          {path.badge}
        </span>
      ) : null}

      <div className="relative z-[1] mt-4 max-w-md flex-1">
        <h3 className="text-2xl font-semibold text-neutral-950">{path.title}</h3>
        <p className="mt-3 text-sm leading-6 text-neutral-500 sm:text-base">
          {path.description}
        </p>

        {path.stats?.length ? (
          <div className="mt-8 grid grid-cols-2 gap-6">
            {path.stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-[11px] font-semibold tracking-wide text-neutral-400 uppercase">
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-semibold text-neutral-950">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}

        <Link
          href={path.href}
          className="lingstack-btn-primary mt-8 inline-flex h-11 items-center gap-2 rounded-full px-6 text-[13px]"
        >
          开始学习
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 size-48 sm:size-56 lg:size-64"
      >
        <div className="lingstack-hero-gradient absolute inset-0 rounded-full opacity-80" />
        <div className="absolute inset-6 rounded-full border border-white/60 bg-white/30 backdrop-blur-sm" />
        <div className="absolute inset-12 rounded-full border border-neutral-200/60" />
      </div>
    </article>
  );
}
