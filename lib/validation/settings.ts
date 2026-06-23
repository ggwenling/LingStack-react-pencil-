import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "昵称不能为空")
    .max(32, "昵称不能超过 32 个字符"),
});

export const updateLearningPreferencesSchema = z.object({
  moduleFocus: z.enum(["REACT", "NEXT"]),
  responseStyle: z.enum(["CONCISE", "STANDARD", "DETAILED"]),
  progressReminders: z.boolean(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateLearningPreferencesInput = z.infer<
  typeof updateLearningPreferencesSchema
>;
