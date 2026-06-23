import Link from "next/link";
import { Sparkles } from "lucide-react";

import type { RoadmapPageView } from "@/lib/learning/roadmap-page-types";

type RoadmapFloatingCtaProps = {
  continueInfo: RoadmapPageView["continue"];
};

export function RoadmapFloatingCta({ continueInfo }: RoadmapFloatingCtaProps) {
  return (
    <div className="fixed bottom-20 right-4 z-40 lg:bottom-10 lg:right-10">
      <Link
        href={continueInfo.href}
        className="group flex items-center gap-4 rounded-xl bg-neutral-950 py-4 pl-5 pr-6 text-white shadow-2xl transition-transform hover:-translate-y-0.5 sm:pl-6 sm:pr-8"
      >
        <div className="flex size-10 items-center justify-center rounded-lg bg-white/10 transition-transform group-hover:rotate-12">
          <Sparkles className="size-5" />
        </div>
        <div className="min-w-0 text-left">
          <p className="text-[9px] font-semibold uppercase tracking-widest opacity-60">
            {continueInfo.label}
          </p>
          <p className="truncate text-sm font-bold leading-tight">
            {continueInfo.lessonTitle}
          </p>
        </div>
      </Link>
    </div>
  );
}
