import {
  convertToModelMessages,
  generateObject,
  streamText,
  type UIMessage,
} from "ai";
import { unstable_cache } from "next/cache";
import { after } from "next/server";
import { z } from "zod";

import {
  buildProgressExtractionPrompt,
  buildSystemPrompt,
  DEFAULT_LEARNING_TOPIC,
  truncateChatMessages,
} from "@/app/api/chat/prompts/learning-prompts";
import { deepseek } from "@/lib/ai/deepseek-client";
import { AppError } from "@/lib/errors/app-error";
import { getChatExerciseContext } from "@/lib/learning/chat-exercise-context";
import {
  revalidateUserLearningCache,
  sidebarThreadsTag,
} from "@/lib/learning/cache-tags";
import { getCachedLearningProgress } from "@/lib/learning/cached-learning-progress";
import {
  getModuleMeta,
  inferModuleFromTitle,
  toPrismaModule,
  type LearningModuleId,
} from "@/lib/learning/modules";
import {
  createChatMessage,
  createThread,
  deleteLastAssistantMessage,
  findLatestThread,
  findLatestThreadByModule,
  findRecentMessages,
  findThreadForUser,
  findThreadWithMessagesForUser,
  hasThreadMessages,
  listSidebarThreads,
  renameThread,
  softDeleteThread,
  touchThread,
} from "@/lib/repositories/chat-repository";
import { upsertLearningProgress } from "@/lib/repositories/learning-progress-repository";
import {
  invalidateLearningDataCache,
  learningDataCacheKey,
  readLearningDataCache,
  writeLearningDataCache,
} from "@/lib/redis/learning-data-cache";
import { recordAiTokenUsage } from "@/lib/services/ai-token-service";

const DEFAULT_THREAD_TITLE = "新的学习会话";
const DEFAULT_REACT_THREAD_TITLE = "新的 React 学习会话";
const DEFAULT_NEXT_THREAD_TITLE = "新的 Next.js 学习会话";
const LEGACY_DEFAULT_THREAD_TITLES = [
  DEFAULT_THREAD_TITLE,
  "React + Next.js 学习会话",
  DEFAULT_REACT_THREAD_TITLE,
  DEFAULT_NEXT_THREAD_TITLE,
  "鏂扮殑瀛︿範浼氳瘽",
  "React + Next.js 瀛︿範浼氳瘽",
  "鏂扮殑 React 瀛︿範浼氳瘽",
  "鏂扮殑 Next.js 瀛︿範浼氳瘽",
];

const CHAT_MODEL = "deepseek-v4-flash";
const PROGRESS_MODEL = "deepseek-v4-flash";

const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(textPartSchema).default([]),
});

export const chatRequestSchema = z.object({
  threadId: z.string().min(1).optional(),
  trigger: z
    .enum(["submit-message", "regenerate-message"])
    .default("submit-message"),
  lastUserMessage: uiMessageSchema.optional(),
});

const chatProgressSchema = z.object({
  summary: z.string(),
  weakTopics: z.array(z.string()).default([]),
});

export function getTextFromMessage(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

function createThreadTitle(content: string) {
  const compact = content.replace(/\s+/g, " ").trim();
  return compact.length <= 24 ? compact : `${compact.slice(0, 24)}...`;
}

function reviveSidebarThreads(
  threads: Array<{
    id: string;
    title: string;
    updatedAt: string | Date;
    module: "REACT" | "NEXT" | null;
  }>,
) {
  return threads.map((thread) => ({
    ...thread,
    updatedAt: new Date(thread.updatedAt),
    module: thread.module ?? inferModuleFromTitle(thread.title),
  }));
}

async function loadSidebarThreads(userId: string) {
  const cacheKey = learningDataCacheKey("sidebar-threads", userId);
  const cached =
    await readLearningDataCache<
      Awaited<ReturnType<typeof listSidebarThreads>>
    >(cacheKey);

  if (cached) {
    return reviveSidebarThreads(cached);
  }

  const threads = await listSidebarThreads(userId);
  await writeLearningDataCache(cacheKey, threads);

  return threads.map((thread) => ({
    ...thread,
    module: thread.module ?? inferModuleFromTitle(thread.title),
  }));
}

export function getSidebarThreads(userId: string) {
  return unstable_cache(
    () => loadSidebarThreads(userId),
    ["sidebar-threads", userId],
    {
      revalidate: 60,
      tags: [sidebarThreadsTag(userId)],
    },
  )();
}

export async function getOrCreateLatestThread(userId: string) {
  return (
    (await findLatestThread(userId)) ??
    (await createThread({
      userId,
      title: DEFAULT_THREAD_TITLE,
    }))
  );
}

export async function getAuthorizedThread(userId: string, threadId?: string) {
  if (!threadId) {
    return getOrCreateLatestThread(userId);
  }

  return findThreadForUser(userId, threadId);
}

export async function getThreadMessagesForPage(userId: string, threadId: string) {
  const thread = await findThreadWithMessagesForUser(userId, threadId);

  if (!thread) {
    throw new AppError("NOT_FOUND", "会话不存在");
  }

  return thread;
}

export function dbMessagesToUIMessages(
  messages: Array<{ id: string; role: string; content: string }>,
): UIMessage[] {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      id: message.id,
      role: message.role as "user" | "assistant",
      parts: [
        {
          type: "text" as const,
          text: message.content,
        },
      ],
    }));
}

async function loadThreadUIMessagesForUser(userId: string, threadId: string) {
  const thread = await findThreadWithMessagesForUser(userId, threadId);

  if (!thread) {
    throw new AppError("NOT_FOUND", "会话不存在");
  }

  return dbMessagesToUIMessages(thread.messages);
}

export async function createModuleLearningThread(
  userId: string,
  module: LearningModuleId,
) {
  const meta = getModuleMeta(module);

  return createThread({
    userId,
    module: toPrismaModule(module),
    title: meta.defaultTitle,
  });
}

export async function deleteLearningThread(userId: string, threadId: string) {
  const thread = await findThreadForUser(userId, threadId);

  if (!thread) {
    throw new AppError("NOT_FOUND", "会话不存在");
  }

  await softDeleteThread(userId, threadId);

  return findLatestThreadByModule(userId, thread.module);
}

export async function renameLearningThread(
  userId: string,
  threadId: string,
  title: string,
) {
  const normalizedTitle = title.trim().replace(/\s+/g, " ").slice(0, 48);
  const nextTitle = normalizedTitle || DEFAULT_THREAD_TITLE;
  const result = await renameThread({
    userId,
    threadId,
    title: nextTitle,
  });

  if (!result.count) {
    throw new AppError("NOT_FOUND", "会话不存在");
  }

  return nextTitle;
}

export async function saveUserMessageFromText(
  thread: { id: string; title: string },
  content: string,
) {
  if (!content) {
    throw new AppError("BAD_REQUEST", "请输入聊天内容");
  }

  const isFirstMessage = !(await hasThreadMessages(thread.id));

  await createChatMessage({
    threadId: thread.id,
    role: "user",
    content,
  });

  const shouldAutoTitle =
    isFirstMessage && LEGACY_DEFAULT_THREAD_TITLES.includes(thread.title);

  await touchThread(
    thread.id,
    shouldAutoTitle ? { title: createThreadTitle(content) } : {},
  );
}

export async function saveAssistantMessage(threadId: string, content: string) {
  if (!content.trim()) {
    return null;
  }

  const message = await createChatMessage({
    threadId,
    role: "assistant",
    content,
  });

  await touchThread(threadId);

  return {
    messageId: message.id,
    content: message.content,
  };
}

export async function getProgressForPrompt(userId: string) {
  return getCachedLearningProgress(userId);
}

export async function updateLearningProgressFromObject(input: {
  userId: string;
  threadId: string;
  currentTopic: string;
  summary: string;
  masteredTopics: string[];
  weakTopics: string[];
  nextPlan: string | null;
  roadmapSteps: unknown;
  dailyTasks: unknown;
}) {
  await upsertLearningProgress({
    userId: input.userId,
    currentTopic: input.currentTopic || DEFAULT_LEARNING_TOPIC,
    summary: input.summary,
    masteredTopics: input.masteredTopics,
    weakTopics: input.weakTopics,
    nextPlan: input.nextPlan,
    roadmapSteps: input.roadmapSteps,
    dailyTasks: input.dailyTasks,
  });
}

export async function getConversationForProgress(threadId: string) {
  const messages = await findRecentMessages(threadId, 10);

  return messages
    .reverse()
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n\n");
}

async function updateLearningProgressAfterChat(
  userId: string,
  thread: { id: string; module: "REACT" | "NEXT" },
) {
  const [messages, progress] = await Promise.all([
    findRecentMessages(thread.id, 10),
    getCachedLearningProgress(userId),
  ]);

  const conversation = messages
    .reverse()
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n\n");

  if (!conversation) {
    return;
  }

  const { object, usage } = await generateObject({
    model: deepseek(PROGRESS_MODEL),
    schema: chatProgressSchema,
    system:
      "你是学习摘要记录员。根据最近对话总结用户的学习状态，只输出 summary 和 weakTopics，不要输出路线图、任务完成状态、currentTopic 或 nextPlan。",
    prompt: buildProgressExtractionPrompt(progress, thread, conversation),
  });

  await recordAiTokenUsage({
    userId,
    threadId: thread.id,
    source: "progress_extract",
    usage,
  });

  await upsertLearningProgress({
    userId,
    currentTopic: progress?.currentTopic || DEFAULT_LEARNING_TOPIC,
    summary: object.summary,
    masteredTopics: progress?.masteredTopics ?? [],
    weakTopics: object.weakTopics,
    nextPlan: progress?.nextPlan ?? null,
    roadmapSteps: progress?.roadmapSteps ?? [],
    dailyTasks: progress?.dailyTasks ?? [],
  });
}

export async function invalidateChatLearningCaches(userId: string) {
  await invalidateLearningDataCache(userId);
  revalidateUserLearningCache(userId);
}

export async function processChatRequest(
  userId: string,
  input: z.infer<typeof chatRequestSchema>,
) {
  const { threadId, trigger, lastUserMessage } = input;

  if (trigger === "submit-message") {
    if (!lastUserMessage || !getTextFromMessage(lastUserMessage)) {
      throw new AppError("BAD_REQUEST", "请输入聊天内容");
    }
  }

  const [thread, progress, exerciseContext] = await Promise.all([
    getAuthorizedThread(userId, threadId),
    getCachedLearningProgress(userId),
    getChatExerciseContext(userId, { threadId }),
  ]);

  if (!thread) {
    throw new AppError("NOT_FOUND", "会话不存在");
  }

  if (trigger === "submit-message" && lastUserMessage) {
    await saveUserMessageFromText(
      thread,
      getTextFromMessage(lastUserMessage),
    );
  } else if (trigger === "regenerate-message") {
    await deleteLastAssistantMessage(thread.id);
  }

  const messages = await loadThreadUIMessagesForUser(userId, thread.id);
  const modelMessages = truncateChatMessages(messages);

  const result = streamText({
    model: deepseek(CHAT_MODEL),
    system: buildSystemPrompt(progress, thread, exerciseContext),
    messages: await convertToModelMessages(modelMessages),
  });

  return result.toUIMessageStreamResponse({
    onFinish: async ({ responseMessage, isAborted }) => {
      if (isAborted) {
        return;
      }

      const assistantContent = getTextFromMessage(responseMessage);
      const usage = await result.totalUsage;

      try {
        await saveAssistantMessage(thread.id, assistantContent);
        await recordAiTokenUsage({
          userId,
          threadId: thread.id,
          source: "chat",
          usage,
        });

        after(async () => {
          try {
            await updateLearningProgressAfterChat(userId, thread);
            await invalidateChatLearningCaches(userId);
          } catch (error) {
            console.error("Failed to update learning progress", error);
          }
        });
      } catch (error) {
        console.error("Failed to persist chat memory", error);
      }
    },
  });
}
