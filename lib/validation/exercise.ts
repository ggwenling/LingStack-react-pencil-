import { z } from "zod";

export const submitExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  code: z.string().min(1).max(8192),
  threadId: z.string().min(1).optional(),
});

export const gradingCriteriaResultSchema = z.object({
  id: z.string(),
  met: z.boolean(),
  reason: z.string(),
});

export const gradingResultSchema = z.object({
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  feedback: z.string(),
  criteriaResults: z.array(gradingCriteriaResultSchema),
  nextHint: z.string().optional(),
});

export type GradingResult = z.infer<typeof gradingResultSchema>;
export type GradingCriteriaResult = z.infer<typeof gradingCriteriaResultSchema>;
