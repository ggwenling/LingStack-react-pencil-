export type ExerciseSubmissionHistoryItem = {
  id: string;
  attemptNumber: number;
  score: number;
  feedback: string;
  finalPassed: boolean;
  createdAt: string;
};

export function serializeExerciseSubmissions(
  submissions: Array<{
    id: string;
    attemptNumber: number;
    score: number;
    feedback: string;
    finalPassed: boolean;
    createdAt: Date;
  }>,
): ExerciseSubmissionHistoryItem[] {
  return submissions.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));
}
