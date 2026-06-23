import { getLessonByKey } from "./catalog-index";
import type { SubmitExerciseResult } from "./exercise-submit-service";

export function buildExerciseChatFollowUp(input: {
  result: SubmitExerciseResult;
  exerciseTitle: string;
}) {
  const { result, exerciseTitle } = input;

  if (result.passed) {
    if (result.lessonCompleted && result.unlockedLessonKey) {
      const nextLesson = getLessonByKey(result.unlockedLessonKey);

      return `练习「${exerciseTitle}」已通过（${result.score} 分）。本课已完成，下一课《${
        nextLesson?.lesson.title ?? result.unlockedLessonKey
      }》已解锁，请展开做题区继续。`;
    }

    return `练习「${exerciseTitle}」已通过（${result.score} 分）。你可以继续巩固本题，或在练习区查看下一题。`;
  }

  if (result.attemptNumber >= 3 && result.nextHint) {
    return `第 ${result.attemptNumber} 次提交未通过（${result.score} 分）。提示：${result.nextHint}。请在练习区修改代码后重新提交；如需回顾概念，可以继续问我。`;
  }

  return `第 ${result.attemptNumber} 次提交未通过（${result.score} 分）。${result.feedback}。请在练习区修改代码后重新提交；如需回顾概念，可以继续问我。`;
}
