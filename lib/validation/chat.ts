import { z } from "zod";

export const learningModuleIdSchema = z.enum(["react", "next"]);

export const renameThreadSchema = z.object({
  title: z.string().trim().max(48),
});
