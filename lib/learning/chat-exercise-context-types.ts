export type LearningPhase = "teach" | "practice_ready" | "practice" | "review";

export type ChatExerciseContext = {
  hasActiveGate: boolean;
  lessonKey: string | null;
  lessonTitle: string | null;
  exerciseId: string | null;
  exerciseTitle: string | null;
  exerciseStatus: "ACTIVE" | "PASSED" | null;
  requirements: string[];
  passScore: number | null;
  learningPhase: LearningPhase;
  userTurnsOnLesson: number;
  lessonKeywords: string[];
  exerciseDescription: string | null;
  lastSubmission: {
    attemptNumber: number;
    score: number;
    finalPassed: boolean;
    feedback: string;
    createdAt: Date;
  } | null;
};

export const EMPTY_CHAT_EXERCISE_CONTEXT: ChatExerciseContext = {
  hasActiveGate: false,
  lessonKey: null,
  lessonTitle: null,
  exerciseId: null,
  exerciseTitle: null,
  exerciseStatus: null,
  requirements: [],
  passScore: null,
  learningPhase: "teach",
  userTurnsOnLesson: 0,
  lessonKeywords: [],
  exerciseDescription: null,
  lastSubmission: null,
};
