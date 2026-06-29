import { prisma } from "@/lib/prisma";

import {
  getCatalogTotalHours,
  ROADMAP_CATALOG,
  ROADMAP_PAGE_DESCRIPTION,
  ROADMAP_PAGE_TITLE,
  type RoadmapCatalogLesson,
} from "./roadmap-catalog";
import { getLessonProgressState } from "./exercise-service";
import {
  buildRoadmapStepsFromLessons,
  upsertLearningProgressCache,
} from "./progress-aggregator";
import { shouldSkipProgressCacheUpsert } from "./progress-cache-policy";
import { parseDailyTasks } from "./home-dashboard-types";
import type {
  RoadmapLessonStatus,
  RoadmapPageView,
  RoadmapStageView,
} from "./roadmap-page-types";
import type { LearningExercise, LessonProgress } from "@/lib/generated/prisma/client";

type LessonWithExercises = LessonProgress & {
  exercises: LearningExercise[];
};

function resolveLessonStatusesFromProgress(
  lessons: RoadmapCatalogLesson[],
  lessonProgressMap: Map<string, LessonWithExercises>,
): Array<{ title: string; hours: number; status: RoadmapLessonStatus; lessonKey: string }> {
  return lessons.map((lesson) => {
    const progress = lessonProgressMap.get(lesson.lessonKey);

    if (progress?.status === "PASSED") {
      return {
        title: lesson.title,
        hours: lesson.hours,
        status: "done",
        lessonKey: lesson.lessonKey,
      };
    }

    if (progress?.status === "ACTIVE") {
      return {
        title: lesson.title,
        hours: lesson.hours,
        status: "active",
        lessonKey: lesson.lessonKey,
      };
    }

    return {
      title: lesson.title,
      hours: lesson.hours,
      status: "pending",
      lessonKey: lesson.lessonKey,
    };
  });
}

function resolveActiveIndex(
  steps: Array<{ status: "done" | "active" | "pending" }>,
) {
  const explicitActive = steps.findIndex((step) => step.status === "active");

  if (explicitActive >= 0) {
    return explicitActive;
  }

  const firstPending = steps.findIndex((step) => step.status === "pending");

  if (firstPending >= 0) {
    return firstPending;
  }

  return Math.max(0, steps.length - 1);
}

function mapStageStatus(
  step: { status: "done" | "active" | "pending"; percent: number },
  index: number,
  activeIndex: number,
): RoadmapStageView["status"] {
  if (step.status === "done") {
    return "done";
  }

  if (step.status === "active") {
    return "active";
  }

  if (index === activeIndex) {
    return "active";
  }

  if (index < activeIndex) {
    return step.percent >= 100 ? "done" : "locked";
  }

  return "locked";
}

function buildEmptyRoadmapSteps() {
  return ROADMAP_CATALOG.map((stage, index) => ({
    title: stage.curriculumTitle,
    percent: 0,
    status: index === 1 ? ("active" as const) : ("pending" as const),
  }));
}

function computeOverallPercent(
  steps: Array<{ percent: number }>,
) {
  if (!steps.length) {
    return 0;
  }

  return Math.round(
    steps.reduce((sum, step) => sum + step.percent, 0) / steps.length,
  );
}

function computeEstimatedHoursRemaining(
  _stages: RoadmapStageView[],
  overallPercent: number,
) {
  const totalHours = getCatalogTotalHours();
  const remainingRatio = (100 - overallPercent) / 100;
  return Math.max(0, Math.round(totalHours * remainingRatio));
}

function truncateLessonTitle(title: string, maxLength = 36) {
  const compact = title.trim();

  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, maxLength)}…`;
}

export async function getRoadmapPageView(
  userId: string,
): Promise<RoadmapPageView> {
  const lessons = await getLessonProgressState(userId);

  const existingProgress = await prisma.learningProgress.findUnique({
    where: { userId },
  });

  if (!shouldSkipProgressCacheUpsert(lessons, existingProgress)) {
    await upsertLearningProgressCache(userId);
  }

  const progress = await prisma.learningProgress.findUnique({
    where: { userId },
  });

  const lessonProgressMap = new Map(
    lessons.map((lesson) => [lesson.lessonKey, lesson]),
  );

  const steps =
    lessons.length > 0
      ? buildRoadmapStepsFromLessons(lessons)
      : buildEmptyRoadmapSteps();

  const currentTopic =
    progress?.currentTopic ?? "React + Next.js 项目实战学习";

  const activeIndex = resolveActiveIndex(steps);

  const stages: RoadmapStageView[] = ROADMAP_CATALOG.map((catalog, index) => {
    const step = steps[index] ?? {
      title: catalog.curriculumTitle,
      percent: 0,
      status: "pending" as const,
    };
    const status = mapStageStatus(step, index, activeIndex);

    const base: RoadmapStageView = {
      index: index + 1,
      title: step.title,
      displayTitle: catalog.displayTitle,
      status,
      percent: step.percent,
    };

    if (status === "done" && catalog.modules) {
      return { ...base, modules: catalog.modules };
    }

    if (status === "active" && catalog.lessons) {
      return {
        ...base,
        lessons: resolveLessonStatusesFromProgress(
          catalog.lessons,
          lessonProgressMap,
        ),
      };
    }

    if (status === "locked") {
      return {
        ...base,
        unlockHint: catalog.unlockHint,
        tags: catalog.tags,
      };
    }

    return base;
  });

  const overallPercent = computeOverallPercent(steps);
  const estimatedHoursRemaining = computeEstimatedHoursRemaining(
    stages,
    overallPercent,
  );

  const activeStage = stages.find((stage) => stage.status === "active");
  const activeLesson = activeStage?.lessons?.find(
    (lesson) => lesson.status === "active",
  );
  const activeTask = parseDailyTasks(progress?.dailyTasks ?? []).data?.find(
    (task) => task.status === "active",
  );

  const lessonTitle = truncateLessonTitle(
    activeLesson?.title ??
      activeTask?.title ??
      currentTopic ??
      "开始 AI 学习会话",
  );

  const continueLabel = activeStage
    ? `继续阶段 ${String(activeStage.index).padStart(2, "0")}`
    : "开始 AI 学习";

  return {
    title: ROADMAP_PAGE_TITLE,
    description: ROADMAP_PAGE_DESCRIPTION,
    overallPercent,
    estimatedHoursRemaining,
    stages,
    continue: {
      label: continueLabel,
      lessonTitle,
      href: "/home/ai",
    },
  };
}
