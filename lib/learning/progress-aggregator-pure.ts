import type { LearningExercise, LessonProgress } from "@/lib/generated/prisma/client";

import { getLessonByKey, listAllLessons } from "./catalog-index";
import { ROADMAP_CATALOG } from "./roadmap-catalog";
import type { HomeDashboardView } from "./home-dashboard-types";

export type LessonExercise = LearningExercise & {
  _count?: {
    submissions: number;
  };
};

export type LessonWithExercises = LessonProgress & {
  exercises: LessonExercise[];
};

function exerciseHasSubmissions(exercise: LessonExercise) {
  return (exercise._count?.submissions ?? 0) > 0;
}

function mapLessonStatusToRoadmap(
  lessonKey: string,
  lessons: LessonWithExercises[],
) {
  const lesson = lessons.find((item) => item.lessonKey === lessonKey);

  if (!lesson) {
    return { status: "pending" as const, percent: 0 };
  }

  if (lesson.status === "PASSED") {
    return { status: "done" as const, percent: 100 };
  }

  if (lesson.status === "ACTIVE") {
    const total = lesson.exercises.length || 1;
    const passed = lesson.exercises.filter(
      (exercise) => exercise.status === "PASSED",
    ).length;
    const percent = Math.round((passed / total) * 100);

    return {
      status: "active" as const,
      percent: lesson.exercises.length ? percent : 0,
    };
  }

  return { status: "pending" as const, percent: 0 };
}

function arePriorLessonStagesComplete(
  stageIndex: number,
  lessons: LessonWithExercises[],
) {
  for (let index = 0; index < stageIndex; index += 1) {
    const priorStage = ROADMAP_CATALOG[index];
    const priorLessons = priorStage.lessons ?? [];

    if (!priorLessons.length) {
      continue;
    }

    const allPassed = priorLessons.every((priorLesson) => {
      const progress = lessons.find(
        (lesson) => lesson.lessonKey === priorLesson.lessonKey,
      );

      return progress?.status === "PASSED";
    });

    if (!allPassed) {
      return false;
    }
  }

  return true;
}

function buildStageFromLessons(
  stageLessons: Array<{ lessonKey: string }>,
  lessons: LessonWithExercises[],
  curriculumTitle: string,
) {
  const lessonStatuses = stageLessons.map((lesson) =>
    mapLessonStatusToRoadmap(lesson.lessonKey, lessons),
  );

  const doneCount = lessonStatuses.filter(
    (item) => item.status === "done",
  ).length;
  const activeItem = lessonStatuses.find((item) => item.status === "active");
  const percent =
    stageLessons.length > 0
      ? Math.round((doneCount / stageLessons.length) * 100)
      : 0;

  if (doneCount === stageLessons.length) {
    return {
      title: curriculumTitle,
      percent: 100,
      status: "done" as const,
    };
  }

  if (activeItem) {
    return {
      title: curriculumTitle,
      percent,
      status: "active" as const,
    };
  }

  return {
    title: curriculumTitle,
    percent,
    status: "pending" as const,
  };
}

export function buildRoadmapStepsFromLessons(lessons: LessonWithExercises[]) {
  return ROADMAP_CATALOG.map((stage, stageIndex) => {
    const stageLessons = stage.lessons ?? [];

    if (!stageLessons.length) {
      return {
        title: stage.curriculumTitle,
        percent: 0,
        status: "pending" as const,
      };
    }

    if (!arePriorLessonStagesComplete(stageIndex, lessons)) {
      return {
        title: stage.curriculumTitle,
        percent: 0,
        status: "pending" as const,
      };
    }

    return buildStageFromLessons(
      stageLessons,
      lessons,
      stage.curriculumTitle,
    );
  });
}

export function buildDailyTasksFromLessons(
  lessons: LessonWithExercises[],
): HomeDashboardView["tasks"] {
  const tasks: HomeDashboardView["tasks"] = [];
  const allLessons = listAllLessons();

  const passedLessons = lessons.filter((lesson) => lesson.status === "PASSED");

  if (passedLessons.length > 0) {
    const latestPassed = passedLessons[passedLessons.length - 1];
    const lessonMeta = getLessonByKey(latestPassed.lessonKey);

    tasks.push({
      title: `已完成：${lessonMeta?.lesson.title ?? latestPassed.lessonKey}`,
      status: "done",
    });
  }

  const activeLesson = lessons.find((lesson) => lesson.status === "ACTIVE");
  const activeExercise = activeLesson?.exercises.find(
    (exercise) => exercise.status === "ACTIVE",
  );

  if (activeExercise && activeLesson) {
    const lessonMeta = getLessonByKey(activeLesson.lessonKey);
    const lessonTitle =
      lessonMeta?.lesson.title ?? activeLesson.lessonKey;

    tasks.push({
      title: exerciseHasSubmissions(activeExercise)
        ? `练习：${activeExercise.title}`
        : `学习：${lessonTitle}`,
      status: "active",
    });
  } else if (activeLesson) {
    const lessonMeta = getLessonByKey(activeLesson.lessonKey);

    tasks.push({
      title: `继续学习：${lessonMeta?.lesson.title ?? activeLesson.lessonKey}`,
      status: "active",
    });
  }

  const nextLocked = allLessons.find((item) => {
    const progress = lessons.find(
      (lesson) => lesson.lessonKey === item.lesson.lessonKey,
    );

    return !progress || progress.status === "LOCKED";
  });

  if (nextLocked && tasks.length < 3) {
    tasks.push({
      title: `待解锁：${nextLocked.lesson.title}`,
      status: "pending",
    });
  }

  if (!tasks.length) {
    return [
      {
        title: "开始学习：JSX 语法与渲染逻辑",
        status: "active" as const,
      },
    ];
  }

  return tasks.slice(0, 3);
}

export function buildMasteredTopicsFromLessons(lessons: LessonWithExercises[]) {
  const mastered = new Set<string>();

  for (const lesson of lessons) {
    if (lesson.status !== "PASSED") {
      continue;
    }

    const meta = getLessonByKey(lesson.lessonKey);

    if (meta) {
      mastered.add(meta.lesson.title);
    }
  }

  return Array.from(mastered);
}

export function getLessonProgressMap(lessons: LessonWithExercises[]) {
  return new Map(lessons.map((lesson) => [lesson.lessonKey, lesson]));
}
