import type { RoadmapStageView } from "@/lib/learning/roadmap-page-types";

import { RoadmapStageCard } from "./roadmap-stage-card";

type RoadmapTimelineProps = {
  stages: RoadmapStageView[];
};

export function RoadmapTimeline({ stages }: RoadmapTimelineProps) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute bottom-0 left-[31px] top-0 z-0 w-px bg-neutral-200 sm:left-[39px]"
      />

      <div className="relative z-10 space-y-10 pb-24 sm:space-y-12">
        {stages.map((stage) => (
          <RoadmapStageCard key={stage.index} stage={stage} />
        ))}
      </div>
    </div>
  );
}
