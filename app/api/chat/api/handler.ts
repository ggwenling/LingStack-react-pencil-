import {
  convertToModelMessages,
  generateObject,
  streamText,
} from "ai";
import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  buildProgressExtractionPrompt,
  buildSystemPrompt,
  DEFAULT_LEARNING_TOPIC,
  truncateChatMessages,
} from "../prompts/learning-prompts";
import { deepseek } from "@/lib/ai/deepseek-client";
import { getCurrentUser } from "@/lib/auth/session";
import { getChatExerciseContext } from "@/lib/learning/chat-exercise-context";
import {
  findLearningProgress,
  upsertLearningProgress,
} from "@/lib/repositories/learning-progress-repository";
import { findRecentMessages } from "@/lib/repositories/chat-repository";
import { recordAiTokenUsage } from "@/lib/services/ai-token-service";
import {
  getAuthorizedThread,
  getTextFromMessage,
  saveAssistantMessage,
  saveUserMessage,
} from "@/lib/services/chat-service";

export const maxDuration = 60;

const CHAT_MODEL = "deepseek-v4-flash";
const PROGRESS_MODEL = "deepseek-v4-flash";

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

async function updateLearningProgress(
  userId: string,
  thread: { id: string; module: "REACT" | "NEXT" },
) {
  const [messages, progress] = await Promise.all([
    findRecentMessages(thread.id, 10),
    findLearningProgress(userId),
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
    findLearningProgress(user.id),
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

        after(async () => {
          try {
            await updateLearningProgress(user.id, thread);
            revalidateLearningSurfaces(thread.id);
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
