import { unstable_cache } from "next/cache";

import { transaction } from "@/lib/db/prisma";
import {
  findActiveExercise,
  findExerciseByIdForUser,
  findLessonProgresses,
  findSubmissionsForExercise,
  hasLessonProgressRecords,
} from "@/lib/repositories/exercise-repository";
import type { LearningExercise } from "@/lib/generated/prisma/client";
import {
  learningDataCacheKey,
  readLearningDataCache,
  writeLearningDataCache,
} from "@/lib/redis/learning-data-cache";

import { lessonProgressTag } from "./cache-tags";
import { getLessonByKey } from "./catalog-index";
import { getExerciseTemplate } from "./exercise-catalog";
import {
  ensureUserProgressInitialized,
  getFirstMvpLessonKey,
} from "./progress-state-machine";
import type { ExerciseRubricItem } from "./exercise-catalog";

type LessonProgressState = Awaited<ReturnType<typeof findLessonProgresses>>;
type CachedLessonProgressState = Array<
  Omit<
    LessonProgressState[number],
    "startedAt" | "passedAt" | "createdAt" | "updatedAt" | "exercises"
  > & {
    startedAt: string | Date | null;
    passedAt: string | Date | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    exercises: Array<
      Omit<
        LessonProgressState[number]["exercises"][number],
        "createdAt" | "updatedAt"
      > & {
        createdAt: string | Date;
        updatedAt: string | Date;
      }
    >;
  }
>;

export type CurrentExerciseView = {
  exerciseId: string;
  lessonKey: string;
  lessonTitle: string;
  title: string;
  description: string;
  requirements: string[];
  starterCode: string;
  status: LearningExercise["status"];
  templateId: string;
  passScore: number;
  rubric: ExerciseRubricItem[];
};

function toExerciseView(
  exercise: LearningExercise,
  lessonTitle: string,
  description: string,
): CurrentExerciseView {
  return {
    exerciseId: exercise.id,
    lessonKey: exercise.lessonKey,
    lessonTitle,
    title: exercise.title,
    description,
    requirements: exercise.requirements as string[],
    starterCode: exercise.starterCode ?? "",
    status: exercise.status,
    templateId: exercise.templateId,
    passScore: exercise.passScore,
    rubric: exercise.rubric as ExerciseRubricItem[],
  };
}

function reviveDate(value: string | Date | null) {
  return typeof value === "string" ? new Date(value) : value;
}

function reviveLessonProgressState(
  lessons: CachedLessonProgressState,
): LessonProgressState {
  return lessons.map((lesson) => ({
    ...lesson,
    startedAt: reviveDate(lesson.startedAt),
    passedAt: reviveDate(lesson.passedAt),
    createdAt: reviveDate(lesson.createdAt),
    updatedAt: reviveDate(lesson.updatedAt),
    exercises: lesson.exercises.map((exercise) => ({
      ...exercise,
      createdAt: reviveDate(exercise.createdAt),
      updatedAt: reviveDate(exercise.updatedAt),
    })),
  }));
}

export async function getOrCreateCurrentExercise(userId: string) {
  const hasRecords = await hasLessonProgressRecords(userId);

  if (!hasRecords) {
    await transaction((tx) => ensureUserProgressInitialized(tx, userId));
  }

  let selectedExercise: LearningExercise | null = null;
  const activeFromRepo = await findActiveExercise(userId);

  if (activeFromRepo) {
    selectedExercise = activeFromRepo;
  } else {
    const lessons = await findLessonProgresses(userId);
    const activeLesson = lessons.find((lesson) => lesson.status === "ACTIVE");

    if (!activeLesson) {
      return null;
    }

    selectedExercise =
      activeLesson.exercises.find((exercise) => exercise.status === "ACTIVE") ??
      activeLesson.exercises.find((exercise) => exercise.status === "PASSED") ??
      null;
  }

  if (!selectedExercise) {
    return null;
  }

  const lessonMeta = getLessonByKey(selectedExercise.lessonKey);
  const template = getExerciseTemplate(selectedExercise.templateId);

  return toExerciseView(
    selectedExercise,
    lessonMeta?.lesson.title ?? selectedExercise.lessonKey,
    template?.description ?? selectedExercise.title,
  );
}

export async function getCurrentExerciseView(userId: string) {
  return getOrCreateCurrentExercise(userId);
}

async function loadLessonProgressState(userId: string) {
  const hasRecords = await hasLessonProgressRecords(userId);

  if (!hasRecords) {
    await transaction((tx) => ensureUserProgressInitialized(tx, userId));
  }

  const cacheKey = learningDataCacheKey("lesson-progress", userId);
  const cached =
    await readLearningDataCache<CachedLessonProgressState>(cacheKey);

  if (cached) {
    return reviveLessonProgressState(cached);
  }

  const lessons = await findLessonProgresses(userId);
  await writeLearningDataCache(cacheKey, lessons);
  return lessons;
}

export function getLessonProgressState(userId: string) {
  return unstable_cache(
    () => loadLessonProgressState(userId),
    ["lesson-progress-state", userId],
    {
      revalidate: 60,
      tags: [lessonProgressTag(userId)],
    },
  )();
}

export function getBootstrapLessonKey() {
  return getFirstMvpLessonKey();
}

export async function getExerciseSubmissionsView(
  userId: string,
  exerciseId: string,
  limit = 10,
) {
  const exercise = await findExerciseByIdForUser(userId, exerciseId);

  if (!exercise) {
    return null;
  }

  return findSubmissionsForExercise(userId, exerciseId, limit);
}
