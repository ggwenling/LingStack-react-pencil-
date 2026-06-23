import type { PrismaTransaction } from "@/lib/db/prisma";
import {
  findLearningProgress,
  upsertLearningProgress,
  upsertLearningProgressWithTx,
} from "@/lib/repositories/learning-progress-repository";
import { findLessonProgresses } from "@/lib/repositories/exercise-repository";

import { getLessonByKey } from "./catalog-index";
import {
  buildDailyTasksFromLessons,
  buildMasteredTopicsFromLessons,
  buildRoadmapStepsFromLessons,
  type LessonWithExercises,
} from "./progress-aggregator-pure";

export {
  buildDailyTasksFromLessons,
  buildMasteredTopicsFromLessons,
  buildRoadmapStepsFromLessons,
  getLessonProgressMap,
} from "./progress-aggregator-pure";
export type { LessonWithExercises } from "./progress-aggregator-pure";

async function loadLessonProgresses(
  userId: string,
  tx?: PrismaTransaction,
): Promise<LessonWithExercises[]> {
  if (tx) {
    return tx.lessonProgress.findMany({
      where: { userId },
      include: {
        exercises: {
          orderBy: { createdAt: "asc" },
          include: {
            _count: {
              select: {
                submissions: true,
              },
            },
          },
        },
      },
      orderBy: [{ stageIndex: "asc" }, { createdAt: "asc" }],
    });
  }

  return findLessonProgresses(userId);
}

function buildCachePayload(
  userId: string,
  lessons: LessonWithExercises[],
  existing: Awaited<ReturnType<typeof findLearningProgress>>,
) {
  const roadmapSteps = buildRoadmapStepsFromLessons(lessons);
  const dailyTasks = buildDailyTasksFromLessons(lessons);
  const masteredTopics = buildMasteredTopicsFromLessons(lessons);
  const activeLesson = lessons.find((lesson) => lesson.status === "ACTIVE");
  const activeExercise = activeLesson?.exercises.find(
    (exercise) => exercise.status === "ACTIVE",
  );
  const lessonMeta = activeLesson
    ? getLessonByKey(activeLesson.lessonKey)
    : null;
  const lessonTitle =
    lessonMeta?.lesson.title ?? activeLesson?.lessonKey ?? null;
  const hasSubmission = activeExercise
    ? (activeExercise._count?.submissions ?? 0) > 0
    : false;

  const currentTopic = activeExercise
    ? hasSubmission || activeExercise.status === "PASSED"
      ? `练习：${activeExercise.title}`
      : lessonTitle
        ? `学习：${lessonTitle}`
        : `练习：${activeExercise.title}`
    : activeLesson && lessonTitle
      ? `学习：${lessonTitle}`
      : existing?.currentTopic ?? "React + Next.js 项目实战学习";

  return {
    userId,
    currentTopic,
    summary: existing?.summary ?? "",
    masteredTopics,
    weakTopics: existing?.weakTopics ?? [],
    nextPlan: activeExercise
      ? hasSubmission || activeExercise.status === "PASSED"
        ? `完成练习「${activeExercise.title}」后解锁下一课`
        : lessonTitle
          ? `先理解「${lessonTitle}」，再在练习区完成「${activeExercise.title}」`
          : `完成练习「${activeExercise.title}」后解锁下一课`
      : existing?.nextPlan ?? null,
    roadmapSteps,
    dailyTasks,
  };
}

export async function upsertLearningProgressCache(
  userId: string,
  tx?: PrismaTransaction,
) {
  const [lessons, existing] = await Promise.all([
    loadLessonProgresses(userId, tx),
    tx ? tx.learningProgress.findUnique({ where: { userId } }) : findLearningProgress(userId),
  ]);

  const payload = buildCachePayload(userId, lessons, existing);

  if (tx) {
    return upsertLearningProgressWithTx(tx, payload);
  }

  return upsertLearningProgress(payload);
}
