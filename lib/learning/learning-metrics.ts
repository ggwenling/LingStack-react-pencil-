import {
  getLessonByKey,
  getLessonsForModule,
  listAllLessons,
  MVP_STAGE_KEY,
} from "./catalog-index";
import type { HomeDashboardView } from "./home-dashboard-types";
import type { LearningModuleId } from "./modules";
import type { LessonWithExercises } from "./progress-aggregator-pure";
import type { RoadmapCatalogLesson } from "./roadmap-catalog";

const NEXT_MODULE_STAGE_KEYS = new Set([
  "routing-data-fetching",
  "advanced-optimization",
  "fullstack-project",
]);

const MODULE_ENTRIES: Array<{
  module: LearningModuleId;
  title: string;
  description: string;
}> = [
  {
    module: "react",
    title: "React 入门与进阶",
    description: "从基础 Hooks 到状态管理",
  },
  {
    module: "next",
    title: "Next.js 全栈开发",
    description: "从路由到部署，构建全栈应用",
  },
];

export function getLessonKnowledgePoints(lesson: RoadmapCatalogLesson): number {
  return Math.max(lesson.keywords.length, 1);
}

export function getCatalogKnowledgePointTotal(): number {
  return listAllLessons().reduce(
    (sum, ref) => sum + getLessonKnowledgePoints(ref.lesson),
    0,
  );
}

function getLessonPointsFromProgress(lesson: LessonWithExercises): number {
  const meta = getLessonByKey(lesson.lessonKey);

  if (!meta) {
    return 0;
  }

  const weight = getLessonKnowledgePoints(meta.lesson);

  if (lesson.status === "PASSED") {
    return weight;
  }

  if (lesson.status === "ACTIVE" && lesson.exercises.length > 0) {
    const passed = lesson.exercises.filter(
      (exercise) => exercise.status === "PASSED",
    ).length;
    const fraction = passed / lesson.exercises.length;

    return Math.round(weight * fraction * 0.5 * 10) / 10;
  }

  return 0;
}

export function computeKnowledgeProgress(lessons: LessonWithExercises[]): {
  completedCount: number;
  totalCount: number;
  overallPercent: number;
} {
  const totalCount = getCatalogKnowledgePointTotal();
  const completedCount = Math.round(
    lessons.reduce((sum, lesson) => sum + getLessonPointsFromProgress(lesson), 0) *
      10,
  ) / 10;
  const overallPercent =
    totalCount > 0
      ? Math.min(100, Math.round((completedCount / totalCount) * 100))
      : 0;

  return {
    completedCount,
    totalCount,
    overallPercent,
  };
}

function modulePercentForLessons(
  module: LearningModuleId,
  lessons: LessonWithExercises[],
): number {
  const catalogLessons = getLessonsForModule(module);
  const total = catalogLessons.length;

  if (total === 0) {
    return 0;
  }

  const passed = catalogLessons.filter((ref) => {
    const progress = lessons.find(
      (lesson) => lesson.lessonKey === ref.lesson.lessonKey,
    );

    return progress?.status === "PASSED";
  }).length;

  return Math.round((passed / total) * 100);
}

export function buildModuleEntryProgress(
  lessons: LessonWithExercises[],
): HomeDashboardView["entries"] {
  return MODULE_ENTRIES.map((entry) => ({
    title: entry.title,
    description: entry.description,
    percent: modulePercentForLessons(entry.module, lessons),
    accent: entry.module,
  }));
}

export function estimateStudyHoursFromMessageCount(count: number): number {
  return Math.round(count * 0.4 * 10) / 10;
}

export function inferModuleFromStageKey(stageKey: string): LearningModuleId {
  if (NEXT_MODULE_STAGE_KEYS.has(stageKey)) {
    return "next";
  }

  return "react";
}

export function inferActiveModuleFromLessons(
  lessons: LessonWithExercises[],
): LearningModuleId {
  const activeLesson = lessons.find((lesson) => lesson.status === "ACTIVE");

  if (activeLesson) {
    return inferModuleFromStageKey(activeLesson.stageKey);
  }

  const latestPassed = [...lessons]
    .reverse()
    .find((lesson) => lesson.status === "PASSED");

  if (latestPassed) {
    return inferModuleFromStageKey(latestPassed.stageKey);
  }

  return "react";
}

export function getActiveModuleLabel(
  lessons: LessonWithExercises[],
): string | null {
  const activeLesson = lessons.find((lesson) => lesson.status === "ACTIVE");

  if (!activeLesson) {
    return null;
  }

  const meta = getLessonByKey(activeLesson.lessonKey);

  return meta?.lesson.title ?? activeLesson.lessonKey;
}

export function pickPrimaryEntry(
  entries: HomeDashboardView["entries"],
  lessons: LessonWithExercises[],
): HomeDashboardView["entries"][number] | undefined {
  const activeModule = inferActiveModuleFromLessons(lessons);
  return entries.find((entry) => entry.accent === activeModule) ?? entries[0];
}

export function hasLessonLearningActivity(lessons: LessonWithExercises[]): boolean {
  return lessons.some(
    (lesson) => lesson.status === "ACTIVE" || lesson.status === "PASSED",
  );
}

export { MVP_STAGE_KEY, NEXT_MODULE_STAGE_KEYS };
