export type RoadmapStageStatus = "done" | "active" | "locked";
export type RoadmapLessonStatus = "done" | "active" | "pending";

export type RoadmapPageView = {
  title: string;
  description: string;
  overallPercent: number;
  estimatedHoursRemaining: number;
  stages: RoadmapStageView[];
  continue: { label: string; lessonTitle: string; href: string };
};

export type RoadmapStageView = {
  index: number;
  title: string;
  displayTitle: string;
  status: RoadmapStageStatus;
  percent: number;
  modules?: { label: string; title: string }[];
  lessons?: { title: string; hours: number; status: RoadmapLessonStatus }[];
  unlockHint?: string;
  tags?: string[];
};
