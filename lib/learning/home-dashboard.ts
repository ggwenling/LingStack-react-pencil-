import { prisma } from "@/lib/prisma";

import {
  buildTimelineFromRoadmap,
  inferRoadmapFromTopics,
  inferTagFromTitle,
} from "./curriculum";
import { getLessonProgressState } from "./exercise-service";
import { formatRelativeTime } from "./format-relative-time";
import {
  parseDailyTasks,
  parseRoadmapSteps,
  type HomeDashboardView,
} from "./home-dashboard-types";
import {
  buildModuleEntryProgress,
  computeKnowledgeProgress,
  estimateStudyHoursFromMessageCount,
  getActiveModuleLabel,
  hasLessonLearningActivity,
  pickPrimaryEntry,
} from "./learning-metrics";
import {
  buildDailyTasksFromLessons,
  buildRoadmapStepsFromLessons,
  upsertLearningProgressCache,
} from "./progress-aggregator";
import type { LessonWithExercises } from "./progress-aggregator-pure";
import { resolveRoadmapProgress } from "./roadmap-progress";
import { calculateStreakDays } from "./study-streak";

export type HomeDashboard = {
  progress: {
    currentTopic: string;
    summary: string;
    masteredTopics: string[];
    weakTopics: string[];
    nextPlan: string | null;
  } | null;
  latestThread: {
    id: string;
    title: string;
    preview: string;
  } | null;
};

function truncatePreview(text: string, maxLength = 120) {
  const compact = text.replace(/\s+/g, " ").trim();

  if (!compact) {
    return "";
  }

  if (compact.length <= maxLength) {
    return compact;
  }

  return `${compact.slice(0, maxLength)}...`;
}

function hasMeaningfulProgress(progress: {
  summary: string;
  masteredTopics: string[];
  weakTopics: string[];
  nextPlan: string | null;
  currentTopic: string;
}) {
  const defaultTopic = "React + Next.js 项目实战学习";

  return (
    Boolean(progress.summary.trim()) ||
    progress.masteredTopics.length > 0 ||
    progress.weakTopics.length > 0 ||
    Boolean(progress.nextPlan?.trim()) ||
    progress.currentTopic !== defaultTopic
  );
}

export async function getHomeDashboard(userId: string): Promise<HomeDashboard> {
  const [progressRecord, latestThread] = await Promise.all([
    prisma.learningProgress.findUnique({
      where: { userId },
    }),
    prisma.chatThread.findFirst({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    }),
  ]);

  const progress =
    progressRecord && hasMeaningfulProgress(progressRecord)
      ? {
          currentTopic: progressRecord.currentTopic,
          summary: progressRecord.summary,
          masteredTopics: progressRecord.masteredTopics,
          weakTopics: progressRecord.weakTopics,
          nextPlan: progressRecord.nextPlan,
        }
      : null;

  const latestMessage = latestThread?.messages[0];
  const preview =
    progress?.summary.trim() ||
    (latestMessage
      ? truncatePreview(latestMessage.content)
      : "");

  const latestThreadResult = latestThread
    ? {
        id: latestThread.id,
        title: latestThread.title,
        preview,
      }
    : null;

  return {
    progress,
    latestThread: latestThreadResult,
  };
}

function getWeekAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date;
}

function getNinetyDaysAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 90);
  return date;
}

function resolveTasks(
  dailyTasks: unknown,
  lessonRecords: Awaited<ReturnType<typeof getLessonProgressState>>,
): HomeDashboardView["tasks"] {
  const parsed = parseDailyTasks(dailyTasks);

  if (parsed.success && parsed.data.length > 0) {
    return parsed.data;
  }

  return buildDailyTasksFromLessons(lessonRecords);
}

function shouldSkipProgressCacheUpsert(
  lessonRecords: LessonWithExercises[],
  progress: {
    roadmapSteps: unknown;
    dailyTasks: unknown;
  } | null,
) {
  if (lessonRecords.length === 0 || !progress) {
    return false;
  }

  const roadmapParsed = parseRoadmapSteps(progress.roadmapSteps);
  const tasksParsed = parseDailyTasks(progress.dailyTasks);

  return (
    roadmapParsed.success &&
    tasksParsed.success &&
    roadmapParsed.data.length > 0 &&
    tasksParsed.data.length > 0
  );
}

export async function getHomeDashboardView(
  userId: string,
): Promise<HomeDashboardView> {
  const weekAgo = getWeekAgo();
  const ninetyDaysAgo = getNinetyDaysAgo();

  const lessonRecords = await getLessonProgressState(userId);

  const existingProgress = await prisma.learningProgress.findUnique({
    where: { userId },
  });

  if (!shouldSkipProgressCacheUpsert(lessonRecords, existingProgress)) {
    await upsertLearningProgressCache(userId);
  }

  const [
    progress,
    recentThreads,
    threadCount,
    threadCountDelta,
    userMessageCount,
    userMessageCountDelta,
    studyDates,
  ] = await Promise.all([
    prisma.learningProgress.findUnique({
      where: { userId },
    }),
    prisma.chatThread.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        updatedAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
    }),
    prisma.chatThread.count({
      where: {
        userId,
        deletedAt: null,
      },
    }),
    prisma.chatThread.count({
      where: {
        userId,
        deletedAt: null,
        createdAt: {
          gte: weekAgo,
        },
      },
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
    prisma.chatMessage.count({
      where: {
        thread: {
          userId,
          deletedAt: null,
        },
        role: "user",
        createdAt: {
          gte: weekAgo,
        },
      },
    }),
    prisma.chatMessage.findMany({
      where: {
        thread: {
          userId,
          deletedAt: null,
        },
        role: "user",
        createdAt: {
          gte: ninetyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    }),
  ]);

  const masteredTopics = progress?.masteredTopics ?? [];
  const weakTopics = progress?.weakTopics ?? [];
  const currentTopic =
    progress?.currentTopic ?? "React + Next.js 项目实战学习";

  const roadmap =
    lessonRecords.length > 0
      ? buildRoadmapStepsFromLessons(lessonRecords)
      : progress
        ? resolveRoadmapProgress({
            roadmapSteps: progress.roadmapSteps,
            masteredTopics,
            weakTopics,
            currentTopic,
          })
        : inferRoadmapFromTopics([], [], currentTopic);

  const tasks = resolveTasks(progress?.dailyTasks, lessonRecords);

  const knowledgeProgress = computeKnowledgeProgress(lessonRecords);
  const { completedCount, totalCount, overallPercent } = knowledgeProgress;
  const passedLessonCount = lessonRecords.filter(
    (lesson) => lesson.status === "PASSED",
  ).length;
  const streakDays = calculateStreakDays(
    studyDates.map((item) => item.createdAt),
  );
  const totalHours = estimateStudyHoursFromMessageCount(userMessageCount);

  const masteredDelta = progress
    ? Math.min(passedLessonCount, threadCountDelta)
    : 0;

  const entries = buildModuleEntryProgress(lessonRecords);
  const primaryEntry = pickPrimaryEntry(entries, lessonRecords);

  return {
    overview: {
      overallPercent,
      streakDays,
      completedCount,
      totalCount,
      totalHours,
      timeline: buildTimelineFromRoadmap(
        roadmap,
        progress?.createdAt ?? null,
      ),
    },
    roadmap,
    entries,
    tasks,
    recent: recentThreads.slice(0, 3).map((thread) => ({
      title: thread.title,
      tag: inferTagFromTitle(thread.title),
      timeLabel: formatRelativeTime(thread.updatedAt),
      percent: Math.min(100, thread._count.messages * 20),
    })),
    stats: [
      { label: "会话数", value: threadCount, delta: threadCountDelta },
      {
        label: "知识点",
        value: Math.round(completedCount),
        delta: masteredDelta,
      },
      {
        label: "练习完成",
        value: passedLessonCount,
        delta: masteredDelta,
      },
      {
        label: "提问数",
        value: userMessageCount,
        delta: userMessageCountDelta,
      },
    ],
    hero: {
      hasLearningActivity: hasLessonLearningActivity(lessonRecords),
      primaryEntry,
      currentTopic,
      activeModuleLabel: getActiveModuleLabel(lessonRecords),
    },
  };
}
