import type { UIMessage } from "ai";

export function getMessageText(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
}

export function getRenderableMarkdown(content: string, isStreaming: boolean) {
  if (!isStreaming || !content) {
    return content;
  }

  const fenceCount = (content.match(/```/g) || []).length;

  if (fenceCount % 2 === 1) {
    return `${content}\n\`\`\``;
  }

  return content;
}

export type ChatTurn = {
  id: string;
  user: UIMessage;
  assistant?: UIMessage;
};

export function groupMessagesIntoTurns(messages: UIMessage[]): ChatTurn[] {
  const turns: ChatTurn[] = [];

  for (const message of messages) {
    if (message.role === "user") {
      turns.push({ id: message.id, user: message });
      continue;
    }

    const lastTurn = turns[turns.length - 1];

    if (lastTurn && !lastTurn.assistant) {
      lastTurn.assistant = message;
      continue;
    }

    turns.push({
      id: message.id,
      user: {
        id: `${message.id}-synthetic-user`,
        role: "user",
        parts: [{ type: "text", text: "" }],
      },
      assistant: message,
    });
  }

  return turns;
}
