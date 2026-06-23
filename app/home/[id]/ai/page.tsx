import type { UIMessage } from "ai";
import { notFound, redirect } from "next/navigation";

import { AiExerciseWorkspace } from "@/app/home/components/ai-exercise-workspace";
import { getCurrentUser } from "@/lib/auth/session";
import { AppError } from "@/lib/errors/app-error";
import { getThreadMessagesForPage } from "@/lib/services/chat-service";

type AiPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function toInitialMessages(
  messages: Array<{ id: string; role: string; content: string }>,
): UIMessage[] {
  return messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      id: message.id,
      role: message.role as "user" | "assistant",
      parts: [
        {
          type: "text",
          text: message.content,
        },
      ],
    }));
}

export default async function AiPage({ params }: AiPageProps) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);

  if (!user) {
    redirect("/login");
  }

  const thread = await getThreadMessagesForPage(user.id, id).catch((error) => {
    if (error instanceof AppError && error.code === "NOT_FOUND") {
      notFound();
    }

    throw error;
  });

  return (
    <AiExerciseWorkspace
      threadId={thread.id}
      title={thread.title}
      userName={user.name}
      initialMessages={toInitialMessages(thread.messages)}
    />
  );
}
