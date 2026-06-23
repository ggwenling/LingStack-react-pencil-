import { Prisma } from "@/lib/generated/prisma/client";

import { prisma, type PrismaTransaction } from "@/lib/db/prisma";

export function findLearningProgress(userId: string) {
  return prisma.learningProgress.findUnique({
    where: { userId },
  });
}

function buildUpsertLearningProgressInput(input: {
  userId: string;
  currentTopic: string;
  summary: string;
  masteredTopics: string[];
  weakTopics: string[];
  nextPlan: string | null;
  roadmapSteps: unknown;
  dailyTasks: unknown;
}) {
  return {
    update: {
      currentTopic: input.currentTopic,
      summary: input.summary,
      masteredTopics: input.masteredTopics,
      weakTopics: input.weakTopics,
      nextPlan: input.nextPlan,
      roadmapSteps: input.roadmapSteps as Prisma.InputJsonValue,
      dailyTasks: input.dailyTasks as Prisma.InputJsonValue,
    },
    create: {
      ...input,
      roadmapSteps: input.roadmapSteps as Prisma.InputJsonValue,
      dailyTasks: input.dailyTasks as Prisma.InputJsonValue,
    },
  };
}

export function upsertLearningProgress(input: {
  userId: string;
  currentTopic: string;
  summary: string;
  masteredTopics: string[];
  weakTopics: string[];
  nextPlan: string | null;
  roadmapSteps: unknown;
  dailyTasks: unknown;
}) {
  const payload = buildUpsertLearningProgressInput(input);

  return prisma.learningProgress.upsert({
    where: {
      userId: input.userId,
    },
    ...payload,
  });
}

export function upsertLearningProgressWithTx(
  tx: PrismaTransaction,
  input: {
    userId: string;
    currentTopic: string;
    summary: string;
    masteredTopics: string[];
    weakTopics: string[];
    nextPlan: string | null;
    roadmapSteps: unknown;
    dailyTasks: unknown;
  },
) {
  const payload = buildUpsertLearningProgressInput(input);

  return tx.learningProgress.upsert({
    where: {
      userId: input.userId,
    },
    ...payload,
  });
}
