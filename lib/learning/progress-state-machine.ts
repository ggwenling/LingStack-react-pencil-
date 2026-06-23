import { AppError } from "@/lib/errors/app-error";
import type { PrismaTransaction } from "@/lib/db/prisma";
import {
  createLearningExercise,
  createLessonProgress,
  updateLearningExercise,
  updateLessonProgress,
} from "@/lib/repositories/exercise-repository";
import type {
  ExerciseStatus,
  LessonStatus,
  LearningExercise,
  LessonProgress,
} from "@/lib/generated/prisma/client";

import {
  getFirstLessonOfStage,
  getLessonByKey,
  getNextLesson,
  listMvpLessons,
  MVP_STAGE_KEY,
} from "./catalog-index";
import { getExerciseTemplate } from "./exercise-catalog";

type LessonWithExercises = LessonProgress & {
  exercises: LearningExercise[];
};

export function assertExerciseSubmittable(input: {
  exercise: LearningExercise;
  lesson: LessonProgress;
  userId: string;
}) {
  if (input.exercise.userId !== input.userId) {
    throw new AppError("FORBIDDEN", "无权提交该练习");
  }

  if (input.lesson.userId !== input.userId) {
    throw new AppError("FORBIDDEN", "无权提交该练习");
  }

  if (input.lesson.status !== "ACTIVE") {
    throw new AppError("BAD_REQUEST", "当前课节未激活，无法提交");
  }

  if (
    input.exercise.status !== "ACTIVE" &&
    input.exercise.status !== "PASSED"
  ) {
    throw new AppError("BAD_REQUEST", "当前练习不可提交");
  }
}

export async function ensureUserProgressInitialized(
  tx: PrismaTransaction,
  userId: string,
) {
  const mvpLessons = listMvpLessons();

  for (const lessonRef of mvpLessons) {
    const existing = await tx.lessonProgress.findUnique({
      where: {
        userId_lessonKey: {
          userId,
          lessonKey: lessonRef.lesson.lessonKey,
        },
      },
    });

    if (existing) {
      continue;
    }

    const isFirstLesson = lessonRef.lessonIndex === 0;
    const status: LessonStatus = isFirstLesson ? "ACTIVE" : "LOCKED";

    const lessonProgress = await createLessonProgress(tx, {
      userId,
      stageKey: lessonRef.stageKey,
      stageIndex: lessonRef.stageIndex,
      lessonKey: lessonRef.lesson.lessonKey,
      status,
      startedAt: isFirstLesson ? new Date() : null,
    });

    if (isFirstLesson) {
      const templateId = lessonRef.lesson.exerciseTemplateIds[0];
      const template = templateId ? getExerciseTemplate(templateId) : null;

      if (template) {
        const exercise = await instantiateExerciseFromTemplate(
          tx,
          userId,
          lessonProgress.id,
          lessonRef.stageKey,
          lessonRef.lesson.lessonKey,
          template.id,
          "ACTIVE",
        );

        await updateLessonProgress(tx, lessonProgress.id, {
          activeExerciseId: exercise.id,
        });
      }
    }
  }
}

export async function instantiateExerciseFromTemplate(
  tx: PrismaTransaction,
  userId: string,
  lessonProgressId: string,
  stageKey: string,
  lessonKey: string,
  templateId: string,
  status: ExerciseStatus,
) {
  const template = getExerciseTemplate(templateId);

  if (!template) {
    throw new AppError("NOT_FOUND", "练习模板不存在");
  }

  return createLearningExercise(tx, {
    userId,
    lessonProgressId,
    stageKey,
    lessonKey,
    templateId: template.id,
    templateVersion: template.version,
    title: template.title,
    requirements: template.requirements,
    rubric: template.rubric,
    starterCode: template.starterCode,
    passScore: template.passScore,
    requiredCriteriaIds: template.requiredCriteriaIds,
    status,
  });
}

export async function activateLesson(
  tx: PrismaTransaction,
  userId: string,
  lessonKey: string,
) {
  const lessonRef = getLessonByKey(lessonKey);

  if (!lessonRef) {
    return null;
  }

  let lessonProgress = await tx.lessonProgress.findUnique({
    where: {
      userId_lessonKey: {
        userId,
        lessonKey,
      },
    },
    include: { exercises: true },
  });

  if (!lessonProgress) {
    const created = await createLessonProgress(tx, {
      userId,
      stageKey: lessonRef.stageKey,
      stageIndex: lessonRef.stageIndex,
      lessonKey,
      status: "ACTIVE",
      startedAt: new Date(),
    });

    lessonProgress = {
      ...created,
      exercises: [],
    };
  } else {
    lessonProgress = await tx.lessonProgress.update({
      where: { id: lessonProgress.id },
      data: {
        status: "ACTIVE",
        startedAt: lessonProgress.startedAt ?? new Date(),
      },
      include: { exercises: true },
    });
  }

  const templateId = lessonRef.lesson.exerciseTemplateIds[0];
  let activeExercise = lessonProgress.exercises.find(
    (exercise) => exercise.status === "ACTIVE",
  );

  if (!activeExercise && templateId) {
    activeExercise = await instantiateExerciseFromTemplate(
      tx,
      userId,
      lessonProgress.id,
      lessonRef.stageKey,
      lessonKey,
      templateId,
      "ACTIVE",
    );
  }

  if (activeExercise) {
    await updateLessonProgress(tx, lessonProgress.id, {
      activeExerciseId: activeExercise.id,
    });
  }

  return lessonProgress;
}

export async function onExercisePassed(
  tx: PrismaTransaction,
  userId: string,
  lessonKey: string,
  exerciseId: string,
) {
  const lesson = await tx.lessonProgress.findUnique({
    where: {
      userId_lessonKey: {
        userId,
        lessonKey,
      },
    },
    include: {
      exercises: true,
    },
  });

  if (!lesson) {
    throw new AppError("NOT_FOUND", "课节进度不存在");
  }

  const exercise = lesson.exercises.find((item) => item.id === exerciseId);

  if (!exercise) {
    throw new AppError("NOT_FOUND", "练习不存在");
  }

  if (exercise.status !== "PASSED") {
    await updateLearningExercise(tx, exercise.id, {
      status: "PASSED",
      passedAt: new Date(),
    });
  }

  const refreshedExercises = await tx.learningExercise.findMany({
    where: { lessonProgressId: lesson.id },
  });

  const allPassed = refreshedExercises.every(
    (item) => item.status === "PASSED",
  );

  if (!allPassed) {
    return {
      lessonCompleted: false,
      unlockedLessonKey: null as string | null,
    };
  }

  await updateLessonProgress(tx, lesson.id, {
    status: "PASSED",
    passedAt: new Date(),
    activeExerciseId: null,
  });

  const nextLesson = getNextLesson(lessonKey);
  let unlockedLessonKey: string | null = null;

  if (nextLesson) {
    await activateLesson(tx, userId, nextLesson.lesson.lessonKey);
    unlockedLessonKey = nextLesson.lesson.lessonKey;
  }

  return {
    lessonCompleted: true,
    unlockedLessonKey,
  };
}

export function isLessonSubmittable(lesson: LessonWithExercises | null) {
  return lesson?.status === "ACTIVE";
}

export function getFirstMvpLessonKey() {
  return getFirstLessonOfStage(MVP_STAGE_KEY)?.lesson.lessonKey ?? null;
}
