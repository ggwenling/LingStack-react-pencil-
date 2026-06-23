"use client";

import { AssistantReplyBlock } from "./assistant-reply-block";
import { InlineMessageError } from "./inline-message-error";
import { TypingIndicator } from "./typing-indicator";
import { UserQueryBlock } from "./user-query-block";
import { getMessageText } from "./utils";
import type { ChatTurn } from "./utils";

type ChatTurnProps = {
  turn: ChatTurn;
  isLastTurn: boolean;
  status: "submitted" | "streaming" | "ready" | "error";
  streamingMessageId?: string;
  showError?: boolean;
  canRegenerate?: boolean;
  onRegenerate?: () => void;
  onRetry?: () => void;
};

export function ChatTurnView({
  turn,
  isLastTurn,
  status,
  streamingMessageId,
  showError = false,
  canRegenerate = false,
  onRegenerate,
  onRetry,
}: ChatTurnProps) {
  const userText = getMessageText(turn.user);
  const isWaitingForAssistant =
    isLastTurn && status === "submitted" && !turn.assistant;
  const isStreamingAssistant =
    isLastTurn &&
    status === "streaming" &&
    Boolean(turn.assistant) &&
    turn.assistant?.id === streamingMessageId;

  return (
    <article className="flex flex-col gap-8 sm:gap-10">
      {userText ? (
        <UserQueryBlock>{userText}</UserQueryBlock>
      ) : null}

      {isWaitingForAssistant ? <TypingIndicator /> : null}

      {turn.assistant ? (
        <AssistantReplyBlock
          message={turn.assistant}
          isStreaming={isStreamingAssistant}
          canRegenerate={canRegenerate}
          onRegenerate={onRegenerate}
          showError={showError && isLastTurn}
        />
      ) : null}

      {showError && isLastTurn ? (
        <InlineMessageError onRetry={onRetry} />
      ) : null}
    </article>
  );
}
