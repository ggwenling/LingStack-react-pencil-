import { prisma } from "@/lib/prisma";
import { formatRelativeTime } from "@/lib/learning/format-relative-time";
import { getLessonProgressState } from "@/lib/learning/exercise-service";
import {
  computeKnowledgeProgress,
  estimateStudyHoursFromMessageCount,
} from "@/lib/learning/learning-metrics";
import {
  buildRoadmapMastery,
  type RoadmapMasteryItem,
} from "@/lib/learning/roadmap-progress";
import { mapWeakPoints } from "@/lib/learning/skill-tracks";
import {
  buildRoadmapStepsFromLessons,
  upsertLearningProgressCache,
} from "@/lib/learning/progress-aggregator";
import {
  countPassedLessons,
  countPassedSubmissions,
  countSubmissions,
} from "@/lib/repositories/exercise-repository";
import { getSystemTokenStats } from "@/lib/services/ai-token-service";

export type AnalyticsView = {
  token: {
    remaining: number;
    totalUsed: number;
    weeklyUsed: number;
    quota: number;
    estimatedTurnsRemaining: number;
    trend7d: Array<{ date: string; label: string; tokens: number }>;
  };
  output: {
    sessionCount: number;
    noteCount: number;
    tasksCompleted: number;
    submissionCount: number;
    passRate: number;
    lessonsCompleted: number;
    studyHours: number;
    knowledgePointsCompleted: number;
    knowledgePointsTotal: number;
  };
  mastery: RoadmapMasteryItem[];
  weakPoints: Array<{ title: string; severity: "high" | "medium" | "low" }>;
  recentActivity: Array<{
    type: "dialogue" | "note" | "task" | "exercise";
    title: string;
    timestamp: string;
    timeLabel: string;
  }>;
  weeklySuggestion: string;
};

function buildWeeklySuggestion(input: {
  nextPlan: string | null;
  weakTopics: string[];
  mastery: RoadmapMasteryItem[];
}) {
  if (input.nextPlan?.trim()) {
    return input.nextPlan.trim();
  }

  const topWeak = input.weakTopics[0];
  const topMastery = [...input.mastery].sort((a, b) => b.percent - a.percent)[0];

  if (topWeak && topMastery) {
    return `建议本周加强对${topWeak}的练习，你的 ${topMastery.skill} 掌握度已达到 ${topMastery.percent}%。`;
  }

  if (topWeak) {
    return `建议本周优先补强 ${topWeak}，可以通过 AI 会话和笔记复盘来巩固。`;
  }

  return "保持每日学习节奏，先从当前练习任务开始本周的学习。";
}

export async function getAnalyticsView(userId: string): Promise<AnalyticsView> {
  const lessonRecords = await getLessonProgressState(userId);
  await upsertLearningProgressCache(userId);

  const [
    token,
    progress,
    sessionCount,
    noteCount,
    userMessageCount,
    recentThreads,
    recentNotes,
    passedSubmissions,
    totalSubmissions,
    passedLessons,
    recentExerciseSubmissions,
  ] = await Promise.all([
    getSystemTokenStats(),
    prisma.learningProgress.findUnique({
      where: { userId },
    }),
    prisma.chatThread.count({
      where: {
        userId,
        deletedAt: null,
      },
    }),
    prisma.learningNote.count({
      where: { userId },
    }),
    prisma.chatMessage.count({
      where: {
        thread: {
          userId,
          deletedAt: null,
        },
        role: "user",
      },
    }),
    prisma.chatThread.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 3,
      select: {
        title: true,
        updatedAt: true,
      },
    }),
    prisma.learningNote.findMany({
      where: { userId },
      orderBy: {
        updatedAt: "desc",
      },
      take: 3,
      select: {
        title: true,
        updatedAt: true,
      },
    }),
    countPassedSubmissions(userId),
    countSubmissions(userId),
    countPassedLessons(userId),
    prisma.exerciseSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        score: true,
        finalPassed: true,
        createdAt: true,
        exercise: {
          select: {
            title: true,
          },
        },
      },
    }),
  ]);

  const weakTopics = progress?.weakTopics ?? [];
  const roadmapSteps = buildRoadmapStepsFromLessons(lessonRecords);
  const mastery = buildRoadmapMastery(roadmapSteps);
  const weakPoints = mapWeakPoints(weakTopics);
  const knowledgeProgress = computeKnowledgeProgress(lessonRecords);
  const passRate =
    totalSubmissions > 0
      ? Math.round((passedSubmissions / totalSubmissions) * 100)
      : 0;

  const activityCandidates: AnalyticsView["recentActivity"] = [
    ...recentThreads.map((thread) => ({
      type: "dialogue" as const,
      title: thread.title,
      timestamp: thread.updatedAt.toISOString(),
      timeLabel: formatRelativeTime(thread.updatedAt),
    })),
    ...recentNotes.map((note) => ({
      type: "note" as const,
      title: note.title,
      timestamp: note.updatedAt.toISOString(),
      timeLabel: formatRelativeTime(note.updatedAt),
    })),
    ...recentExerciseSubmissions.map((submission) => ({
      type: "exercise" as const,
      title: `${submission.exercise.title} · ${
        submission.finalPassed ? "通过" : "未通过"
      }（${submission.score} 分）`,
      timestamp: submission.createdAt.toISOString(),
      timeLabel: formatRelativeTime(submission.createdAt),
    })),
  ];

  const recentActivity = activityCandidates
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() -
        new Date(left.timestamp).getTime(),
    )
    .slice(0, 5);

  return {
    token,
    output: {
      sessionCount,
      noteCount,
      tasksCompleted: passedSubmissions,
      submissionCount: totalSubmissions,
      passRate,
      lessonsCompleted: passedLessons,
      studyHours: estimateStudyHoursFromMessageCount(userMessageCount),
      knowledgePointsCompleted: knowledgeProgress.completedCount,
      knowledgePointsTotal: knowledgeProgress.totalCount,
    },
    mastery,
    weakPoints,
    recentActivity,
    weeklySuggestion: buildWeeklySuggestion({
      nextPlan: progress?.nextPlan ?? null,
      weakTopics,
      mastery,
    }),
  };
}
