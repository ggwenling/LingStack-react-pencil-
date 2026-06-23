import type { LearningPhase } from "./chat-exercise-context-types";

export const MIN_TEACH_TURNS = 2;

export function resolveLearningPhase(input: {
  userTurns: number;
  exerciseStatus: "ACTIVE" | "PASSED" | null;
  hasSubmission: boolean;
}): LearningPhase {
  if (input.exerciseStatus === "PASSED") {
    return "review";
  }

  if (input.hasSubmission) {
    return "practice";
  }

  if (input.userTurns >= MIN_TEACH_TURNS) {
    return "practice_ready";
  }

  return "teach";
}

export function getLearningPhaseLabel(phase: LearningPhase) {
  switch (phase) {
    case "teach":
      return "讲课阶段（先讲概念，不催提交）";
    case "practice_ready":
      return "可练习阶段（已讲过核心点，可引导做题区）";
    case "practice":
      return "练习阶段（已有提交，结合判题反馈辅导）";
    case "review":
      return "复习阶段（本题已通过，可巩固或进入下一课）";
  }
}
