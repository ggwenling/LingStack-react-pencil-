import { z } from "zod";

export type RoadmapStatus = "done" | "active" | "pending";

export type TaskStatus = "done" | "active" | "pending";

export type LearningEntryAccent = "react" | "next";

export type HomeDashboardView = {
  overview: {
    overallPercent: number;
    streakDays: number;
    completedCount: number;
    totalCount: number;
    totalHours: number;
    timeline: Array<{ label: string; percent: number; date?: string }>;
  };
  roadmap: Array<{
    title: string;
    percent: number;
    status: RoadmapStatus;
  }>;
  entries: Array<{
    title: string;
    description: string;
    percent: number;
    accent: LearningEntryAccent;
  }>;
  tasks: Array<{ title: string; status: TaskStatus }>;
  recent: Array<{
    title: string;
    tag: string;
    timeLabel: string;
    percent: number;
  }>;
  stats: Array<{ label: string; value: number; delta: number }>;
  hero: {
    hasLearningActivity: boolean;
    primaryEntry?: {
      title: string;
      description: string;
      percent: number;
      accent: LearningEntryAccent;
    };
    currentTopic: string;
    activeModuleLabel: string | null;
  };
};

export const roadmapStepSchema = z.object({
  title: z.string(),
  percent: z.number().min(0).max(100),
  status: z.enum(["done", "active", "pending"]),
});

export const dailyTaskSchema = z.object({
  title: z.string(),
  status: z.enum(["done", "active", "pending"]),
});

export const roadmapStepsSchema = z.array(roadmapStepSchema);
export const dailyTasksSchema = z.array(dailyTaskSchema);

export function parseRoadmapSteps(value: unknown) {
  return roadmapStepsSchema.safeParse(value);
}

export function parseDailyTasks(value: unknown) {
  return dailyTasksSchema.safeParse(value);
}
