import { countUserMessagesSince } from "@/lib/repositories/chat-repository";
import {
  findLessonProgressByKey,
  findSubmissionsForExercise,
} from "@/lib/repositories/exercise-repository";

import { getLessonByKey } from "./catalog-index";
import {
  EMPTY_CHAT_EXERCISE_CONTEXT,
  type ChatExerciseContext,
} from "./chat-exercise-context-types";
import { getExerciseTemplate } from "./exercise-catalog";
import { getCurrentExerciseView } from "./exercise-service";
import { resolveLearningPhase } from "./learning-phase";

export type { ChatExerciseContext, LearningPhase } from "./chat-exercise-context-types";
export { EMPTY_CHAT_EXERCISE_CONTEXT } from "./chat-exercise-context-types";

export async function getChatExerciseContext(
  userId: string,
  options?: { threadId?: string },
): Promise<ChatExerciseContext> {
  const exercise = await getCurrentExerciseView(userId);

  if (!exercise) {
    return EMPTY_CHAT_EXERCISE_CONTEXT;
  }

  const [submissions, lessonProgress] = await Promise.all([
    findSubmissionsForExercise(userId, exercise.exerciseId, 1),
    findLessonProgressByKey(userId, exercise.lessonKey),
  ]);
  const lastSubmission = submissions[0];
  const lessonMeta = getLessonByKey(exercise.lessonKey);
  const template = getExerciseTemplate(exercise.templateId);

  let userTurnsOnLesson = 0;

  if (options?.threadId && lessonProgress?.startedAt) {
    userTurnsOnLesson = await countUserMessagesSince(
      options.threadId,
      lessonProgress.startedAt,
    );
  }

  const exerciseStatus =
    exercise.status === "PASSED" || exercise.status === "ACTIVE"
      ? exercise.status
      : null;

  return {
    hasActiveGate: true,
    lessonKey: exercise.lessonKey,
    lessonTitle: exercise.lessonTitle,
    exerciseId: exercise.exerciseId,
    exerciseTitle: exercise.title,
    exerciseStatus,
    requirements: exercise.requirements,
    passScore: exercise.passScore,
    learningPhase: resolveLearningPhase({
      userTurns: userTurnsOnLesson,
      exerciseStatus,
      hasSubmission: Boolean(lastSubmission),
    }),
    userTurnsOnLesson,
    lessonKeywords: lessonMeta?.lesson.keywords ?? [],
    exerciseDescription: template?.description ?? exercise.description,
    lastSubmission: lastSubmission
      ? {
          attemptNumber: lastSubmission.attemptNumber,
          score: lastSubmission.score,
          finalPassed: lastSubmission.finalPassed,
          feedback: lastSubmission.feedback,
          createdAt: lastSubmission.createdAt,
        }
      : null,
  };
}
