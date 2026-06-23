import {
  convertToModelMessages,
  generateObject,
  streamText,
  type UIMessage,
} from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import { getChatExerciseContext } from "@/lib/learning/chat-exercise-context";
import { recordAiTokenUsage } from "@/lib/services/ai-token-service";
import {
  buildProgressExtractionPrompt,
  buildSystemPrompt,
  DEFAULT_LEARNING_TOPIC,
  truncateChatMessages,
} from "../prompts/learning-prompts";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

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

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
});

const chatProgressSchema = z.object({
  summary: z.string(),
  weakTopics: z.array(z.string()).default([]),
});

const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const chatRequestSchema = z.object({
  threadId: z.string().min(1).optional(),
  messages: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(["user", "assistant", "system"]),
        parts: z.array(textPartSchema).default([]),
      }),
    )
    .min(1),
});

function getTextFromMessage(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

async function getOrCreateLatestThread(userId: string) {
  const latestThread = await prisma.chatThread.findFirst({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (latestThread) {
    return latestThread;
  }

  return prisma.chatThread.create({
    data: {
      userId,
      title: "React + Next.js 学习会话",
    },
  });
}

async function getAuthorizedThread(userId: string, threadId?: string) {
  if (!threadId) {
    return getOrCreateLatestThread(userId);
  }

  return prisma.chatThread.findFirst({
    where: {
      id: threadId,
      userId,
      deletedAt: null,
    },
  });
}

function createThreadTitle(content: string) {
  const compact = content.replace(/\s+/g, " ").trim();

  if (compact.length <= 24) {
    return compact;
  }

  return `${compact.slice(0, 24)}...`;
}

async function saveUserMessage(
  thread: { id: string; title: string },
  messages: UIMessage[],
) {
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");
  const content = lastUserMessage ? getTextFromMessage(lastUserMessage) : "";

  if (!content) {
    return;
  }

  const messageCount = await prisma.chatMessage.count({
    where: {
      threadId: thread.id,
    },
  });

  await prisma.chatMessage.create({
    data: {
      threadId: thread.id,
      role: "user",
      content,
    },
  });

  const shouldAutoTitle =
    messageCount === 0 && LEGACY_DEFAULT_THREAD_TITLES.includes(thread.title);

  await prisma.chatThread.update({
    where: {
      id: thread.id,
    },
    data: {
      ...(shouldAutoTitle ? { title: createThreadTitle(content) } : {}),
      updatedAt: new Date(),
    },
  });
}

async function saveAssistantMessage(threadId: string, content: string) {
  if (!content.trim()) {
    return;
  }

  await prisma.chatMessage.create({
    data: {
      threadId,
      role: "assistant",
      content,
    },
  });

  await prisma.chatThread.update({
    where: {
      id: threadId,
    },
    data: {
      updatedAt: new Date(),
    },
  });
}

async function updateLearningProgress(
  userId: string,
  thread: { id: string; module: "REACT" | "NEXT" },
) {
  const [messages, progress] = await Promise.all([
    prisma.chatMessage.findMany({
      where: {
        threadId: thread.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    }),
    prisma.learningProgress.findUnique({
      where: {
        userId,
      },
    }),
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

  await prisma.learningProgress.upsert({
    where: {
      userId,
    },
    update: {
      summary: object.summary,
      weakTopics: object.weakTopics,
    },
    create: {
      userId,
      currentTopic: progress?.currentTopic || DEFAULT_LEARNING_TOPIC,
      summary: object.summary,
      masteredTopics: progress?.masteredTopics ?? [],
      weakTopics: object.weakTopics,
      nextPlan: progress?.nextPlan ?? null,
      roadmapSteps: progress?.roadmapSteps ?? [],
      dailyTasks: progress?.dailyTasks ?? [],
    },
  });
}

function revalidateLearningSurfaces(threadId: string) {
  revalidatePath("/home");
  revalidatePath("/home/roadmap");
  revalidatePath("/home/analytics");
  revalidatePath(`/home/${threadId}/ai`);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ msg: "未登录" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return Response.json({ msg: "请求体不是合法 JSON" }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ msg: "聊天消息格式不正确" }, { status: 400 });
  }

  const { messages, threadId } = parsed.data;
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  if (!lastUserMessage || !getTextFromMessage(lastUserMessage)) {
    return Response.json({ msg: "请输入聊天内容" }, { status: 400 });
  }

  const [thread, progress, exerciseContext] = await Promise.all([
    getAuthorizedThread(user.id, threadId),
    prisma.learningProgress.findUnique({
      where: {
        userId: user.id,
      },
    }),
    getChatExerciseContext(user.id, { threadId }),
  ]);

  if (!thread) {
    return Response.json({ msg: "会话不存在" }, { status: 404 });
  }

  await saveUserMessage(thread, messages);

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
          userId: user.id,
          threadId: thread.id,
          source: "chat",
          usage,
        });
        await updateLearningProgress(user.id, thread);
        revalidateLearningSurfaces(thread.id);
      } catch (error) {
        console.error("Failed to persist chat memory", error);
      }
    },
  });
}
