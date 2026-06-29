import { transaction } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors/app-error";
import {
  countSubmissionsForExercise,
  createExerciseSubmission,
  findExerciseByIdForUser,
} from "@/lib/repositories/exercise-repository";
import { findThreadForUser } from "@/lib/repositories/chat-repository";
import { recordAiTokenUsage } from "@/lib/services/ai-token-service";
import { saveAssistantMessage } from "@/lib/services/chat-service";

import { buildExerciseChatFollowUp } from "./exercise-chat-followup";

import { getExerciseTemplate, type ExerciseTemplate } from "./exercise-catalog";
import { assertExerciseRateLimit } from "./exercise-rate-limit";
import {
  acquireExerciseSubmitLock,
  releaseExerciseSubmitLock,
} from "./exercise-submit-lock";
import { gradeSubmission } from "./grading-service";
import { upsertLearningProgressCache } from "./progress-aggregator";
import {
  assertExerciseSubmittable,
  onExercisePassed,
} from "./progress-state-machine";

export type SubmitExerciseResult = {
  passed: boolean;
  score: number;
  feedback: string;
  criteria: Array<{
    id: string;
    name: string;
    met: boolean;
    reason: string;
  }>;
  nextHint?: string;
  lessonCompleted: boolean;
  unlockedLessonKey: string | null;
  attemptNumber: number;
  chatFollowUp: {
    messageId: string;
    content: string;
  } | null;
};

function exerciseToTemplate(exercise: {
  templateId: string;
  title: string;
  requirements: unknown;
  rubric: unknown;
  passScore: number;
  requiredCriteriaIds: unknown;
  starterCode: string | null;
}): ExerciseTemplate {
  const catalogTemplate = getExerciseTemplate(exercise.templateId);

  return {
    id: exercise.templateId,
    lessonKey: catalogTemplate?.lessonKey ?? "",
    version: catalogTemplate?.version ?? 1,
    title: exercise.title,
    description: catalogTemplate?.description ?? exercise.title,
    starterCode: exercise.starterCode ?? catalogTemplate?.starterCode ?? "",
    requirements: exercise.requirements as string[],
    rubric: exercise.rubric as ExerciseTemplate["rubric"],
    passScore: exercise.passScore,
    requiredCriteriaIds: exercise.requiredCriteriaIds as string[],
  };
}

export async function submitExerciseForUser(
  userId: string,
  exerciseId: string,
  code: string,
  threadId?: string,
): Promise<SubmitExerciseResult> {
  const lockAcquired = await acquireExerciseSubmitLock(userId, exerciseId);

  if (!lockAcquired) {
    throw new AppError("CONFLICT", "正在判题，请稍后");
  }

  try {
    const exercise = await findExerciseByIdForUser(userId, exerciseId);

    if (!exercise?.lessonProgress) {
      throw new AppError("NOT_FOUND", "练习不存在");
    }

    await assertExerciseRateLimit(userId, exerciseId, exercise);

    assertExerciseSubmittable({
      exercise,
      lesson: exercise.lessonProgress,
      userId,
    });

    const template = exerciseToTemplate(exercise);
    const grade = await gradeSubmission(code, template);
    const attemptNumber =
      (await countSubmissionsForExercise(exerciseId)) + 1;

    let lessonCompleted = false;
    let unlockedLessonKey: string | null = null;

    await transaction(async (tx) => {
      await createExerciseSubmission(tx, {
        exerciseId,
        userId,
        attemptNumber,
        code,
        staticResult: grade.staticResult,
        aiResult: grade.aiResult,
        criteriaResults: grade.criteriaResults,
        finalPassed: grade.passed,
        score: grade.score,
        feedback: grade.feedback,
        model: grade.model,
        promptVersion: grade.promptVersion,
      });

      if (grade.passed && exercise.status !== "PASSED") {
        const result = await onExercisePassed(
          tx,
          userId,
          exercise.lessonKey,
          exercise.id,
        );
        lessonCompleted = result.lessonCompleted;
        unlockedLessonKey = result.unlockedLessonKey;
      }

      await upsertLearningProgressCache(userId, tx);
    });

    await recordAiTokenUsage({
      userId,
      source: "exercise_grade",
      usage: grade.usage,
    });

    const result: SubmitExerciseResult = {
      passed: grade.passed,
      score: grade.score,
      feedback: grade.feedback,
      criteria: grade.criteriaResults.map((item) => ({
        id: item.id,
        name: item.label,
        met: item.met,
        reason: item.reason,
      })),
      nextHint: grade.nextHint,
      lessonCompleted,
      unlockedLessonKey,
      attemptNumber,
      chatFollowUp: null,
    };

    if (threadId) {
      const thread = await findThreadForUser(userId, threadId);

      if (thread) {
        const followUpContent = buildExerciseChatFollowUp({
          exerciseTitle: exercise.title,
          result,
        });
        const savedMessage = await saveAssistantMessage(
          threadId,
          followUpContent,
        );

        if (savedMessage) {
          result.chatFollowUp = savedMessage;
        }
      }
    }

    return result;
  } finally {
    await releaseExerciseSubmitLock(userId, exerciseId);
  }
}
