"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePageUser } from "@/lib/auth/require-user";
import { AppError } from "@/lib/errors/app-error";
import {
  createModuleLearningThread,
  deleteLearningThread,
  renameLearningThread,
} from "@/lib/services/chat-service";
import { learningModuleIdSchema, renameThreadSchema } from "@/lib/validation/chat";
import type { LearningModuleId } from "@/lib/learning/modules";

export async function createModuleLearningChat(module: LearningModuleId) {
  const user = await requirePageUser();
  const parsedModule = learningModuleIdSchema.parse(module);
  const thread = await createModuleLearningThread(user.id, parsedModule);

  revalidatePath("/home", "layout");
  redirect(`/home/${thread.id}/ai`);
}

export async function createLearningChat() {
  return createModuleLearningChat("react");
}

export async function deleteLearningChat(threadId: string) {
  const user = await requirePageUser();

  try {
    const latestThread = await deleteLearningThread(user.id, threadId);

    revalidatePath("/home", "layout");
    redirect(latestThread ? `/home/${latestThread.id}/ai` : "/home");
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") {
      redirect("/home");
    }

    throw error;
  }
}

export async function renameLearningChat(threadId: string, title: string) {
  const user = await requirePageUser();
  const parsed = renameThreadSchema.safeParse({ title });

  if (!parsed.success) {
    return null;
  }

  try {
    const nextTitle = await renameLearningThread(
      user.id,
      threadId,
      parsed.data.title,
    );

    revalidatePath("/home", "layout");
    revalidatePath(`/home/${threadId}/ai`);

    return nextTitle;
  } catch (error) {
    if (error instanceof AppError && error.code === "NOT_FOUND") {
      return null;
    }

    throw error;
  }
}
