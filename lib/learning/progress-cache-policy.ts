import type { LessonWithExercises } from "./progress-aggregator-pure";
import { parseDailyTasks, parseRoadmapSteps } from "./home-dashboard-types";

export function shouldSkipProgressCacheUpsert(
  lessonRecords: LessonWithExercises[],
  progress: {
    roadmapSteps: unknown;
    dailyTasks: unknown;
  } | null,
) {
  if (lessonRecords.length === 0 || !progress) {
    return false;
  }

  const roadmapParsed = parseRoadmapSteps(progress.roadmapSteps);
  const tasksParsed = parseDailyTasks(progress.dailyTasks);

  return (
    roadmapParsed.success &&
    tasksParsed.success &&
    roadmapParsed.data.length > 0 &&
    tasksParsed.data.length > 0
  );
}
