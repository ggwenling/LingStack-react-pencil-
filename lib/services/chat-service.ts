import type { UIMessage } from "ai";

import { AppError } from "@/lib/errors/app-error";
import {
  countThreadMessages,
  createChatMessage,
  createThread,
  findLatestThread,
  findLatestThreadByModule,
  findRecentMessages,
  findThreadForUser,
  findThreadWithMessagesForUser,
  listSidebarThreads,
  renameThread,
  softDeleteThread,
  touchThread,
} from "@/lib/repositories/chat-repository";
import { findLearningProgress, upsertLearningProgress } from "@/lib/repositories/learning-progress-repository";
import {
  getModuleMeta,
  inferModuleFromTitle,
  toPrismaModule,
  type LearningModuleId,
} from "@/lib/learning/modules";
import { DEFAULT_LEARNING_TOPIC } from "@/app/api/chat/prompts/learning-prompts";

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

export async function getSidebarThreads(userId: string) {
  const threads = await listSidebarThreads(userId);

  return threads.map((thread) => ({
    ...thread,
    module: thread.module ?? inferModuleFromTitle(thread.title),
  }));
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

export async function saveUserMessage(
  thread: { id: string; title: string },
  messages: UIMessage[],
) {
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");
  const content = lastUserMessage ? getTextFromMessage(lastUserMessage) : "";

  if (!content) {
    throw new AppError("BAD_REQUEST", "请输入聊天内容");
  }

  const messageCount = await countThreadMessages(thread.id);

  await createChatMessage({
    threadId: thread.id,
    role: "user",
    content,
  });

  const shouldAutoTitle =
    messageCount === 0 && LEGACY_DEFAULT_THREAD_TITLES.includes(thread.title);

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
  return findLearningProgress(userId);
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
