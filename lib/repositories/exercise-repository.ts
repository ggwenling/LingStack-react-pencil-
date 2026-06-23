import { Prisma } from "@/lib/generated/prisma/client";

import { prisma, type PrismaTransaction } from "@/lib/db/prisma";

export function findLessonProgresses(userId: string) {
  return prisma.lessonProgress.findMany({
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

export function findLessonProgressByKey(userId: string, lessonKey: string) {
  return prisma.lessonProgress.findUnique({
    where: {
      userId_lessonKey: {
        userId,
        lessonKey,
      },
    },
    include: {
      exercises: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export function findActiveLessonProgress(userId: string) {
  return prisma.lessonProgress.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      exercises: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export function findExerciseByIdForUser(userId: string, exerciseId: string) {
  return prisma.learningExercise.findFirst({
    where: {
      id: exerciseId,
      userId,
    },
    include: {
      lessonProgress: true,
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export function findActiveExercise(userId: string) {
  return prisma.learningExercise.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      lessonProgress: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export function countSubmissionsToday(userId: string, exerciseId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return prisma.exerciseSubmission.count({
    where: {
      userId,
      exerciseId,
      createdAt: {
        gte: startOfDay,
      },
    },
  });
}

export function countSubmissionsForExercise(exerciseId: string) {
  return prisma.exerciseSubmission.count({
    where: { exerciseId },
  });
}

export function createLessonProgress(
  tx: PrismaTransaction,
  input: {
    userId: string;
    stageKey: string;
    stageIndex: number;
    lessonKey: string;
    status: "LOCKED" | "ACTIVE" | "PASSED";
    startedAt?: Date | null;
  },
) {
  return tx.lessonProgress.create({
    data: input,
  });
}

export function createLearningExercise(
  tx: PrismaTransaction,
  input: {
    userId: string;
    lessonProgressId: string;
    stageKey: string;
    lessonKey: string;
    templateId: string;
    templateVersion: number;
    title: string;
    requirements: unknown;
    rubric: unknown;
    starterCode?: string | null;
    passScore: number;
    requiredCriteriaIds: unknown;
    status: "PENDING" | "ACTIVE" | "PASSED";
  },
) {
  return tx.learningExercise.create({
    data: {
      ...input,
      requirements: input.requirements as Prisma.InputJsonValue,
      rubric: input.rubric as Prisma.InputJsonValue,
      requiredCriteriaIds: input.requiredCriteriaIds as Prisma.InputJsonValue,
    },
  });
}

export function updateLessonProgress(
  tx: PrismaTransaction,
  id: string,
  data: Prisma.LessonProgressUpdateInput,
) {
  return tx.lessonProgress.update({
    where: { id },
    data,
  });
}

export function updateLearningExercise(
  tx: PrismaTransaction,
  id: string,
  data: Prisma.LearningExerciseUpdateInput,
) {
  return tx.learningExercise.update({
    where: { id },
    data,
  });
}

export function createExerciseSubmission(
  tx: PrismaTransaction,
  input: {
    exerciseId: string;
    userId: string;
    attemptNumber: number;
    code: string;
    staticResult: unknown;
    aiResult: unknown;
    criteriaResults: unknown;
    finalPassed: boolean;
    score: number;
    feedback: string;
    model?: string | null;
    promptVersion?: string | null;
  },
) {
  return tx.exerciseSubmission.create({
    data: {
      ...input,
      staticResult: input.staticResult as Prisma.InputJsonValue,
      aiResult: input.aiResult as Prisma.InputJsonValue,
      criteriaResults: input.criteriaResults as Prisma.InputJsonValue,
    },
  });
}

export function hasSubmissionForExercise(exerciseId: string) {
  return prisma.exerciseSubmission
    .count({
      where: { exerciseId },
    })
    .then((count) => count > 0);
}

export function findSubmissionsForExercise(
  userId: string,
  exerciseId: string,
  limit = 10,
) {
  return prisma.exerciseSubmission.findMany({
    where: {
      userId,
      exerciseId,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      attemptNumber: true,
      score: true,
      feedback: true,
      finalPassed: true,
      createdAt: true,
    },
  });
}

export function countPassedSubmissions(userId: string) {
  return prisma.exerciseSubmission.count({
    where: {
      userId,
      finalPassed: true,
    },
  });
}

export function countSubmissions(userId: string) {
  return prisma.exerciseSubmission.count({
    where: { userId },
  });
}

export function countPassedLessons(userId: string) {
  return prisma.lessonProgress.count({
    where: {
      userId,
      status: "PASSED",
    },
  });
}

export function hasLessonProgressRecords(userId: string) {
  return prisma.lessonProgress.count({
    where: { userId },
  });
}
