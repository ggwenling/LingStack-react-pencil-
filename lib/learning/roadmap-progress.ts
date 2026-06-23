import { inferRoadmapFromTopics } from "./curriculum";
import { parseRoadmapSteps, type RoadmapStatus } from "./home-dashboard-types";

export function resolveRoadmapProgress(progress: {
  roadmapSteps: unknown;
  masteredTopics: string[];
  weakTopics: string[];
  currentTopic: string;
}) {
  const parsed = parseRoadmapSteps(progress.roadmapSteps);

  if (parsed.success && parsed.data.length > 0) {
    return parsed.data;
  }

  return inferRoadmapFromTopics(
    progress.masteredTopics,
    progress.weakTopics,
    progress.currentTopic,
  );
}

export type RoadmapMasteryItem = {
  skill: string;
  percent: number;
  status: RoadmapStatus;
};

export function buildRoadmapMastery(
  roadmap: Array<{ title: string; percent: number; status: RoadmapStatus }>,
): RoadmapMasteryItem[] {
  return roadmap.map((step) => ({
    skill: step.title,
    percent: step.percent,
    status: step.status,
  }));
}
