"use client";

import type { UIMessage } from "ai";
import { useLayoutEffect, useRef } from "react";

import { ChatTurnView } from "./chat-turn";
import { groupMessagesIntoTurns } from "./utils";

type ChatThreadProps = {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  hasError?: boolean;
  lastAssistantMessageId?: string;
  onRegenerate?: () => void;
  onRetry?: () => void;
  bottomSpacerRef?: React.RefObject<HTMLDivElement | null>;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
};

export function ChatThread({
  messages,
  status,
  hasError = false,
  lastAssistantMessageId,
  onRegenerate,
  onRetry,
  bottomSpacerRef,
  scrollContainerRef,
}: ChatThreadProps) {
  const turns = groupMessagesIntoTurns(messages);
  const rafRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef?.current;

    if (!scrollContainer) {
      return;
    }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
      rafRef.current = null;
    });

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [messages, status, scrollContainerRef]);

  return (
    <div
      ref={scrollContainerRef}
      className="lingstack-chat-scroll min-h-0 flex-1 overflow-y-auto px-4 py-8 sm:px-8"
    >
      <div className="mx-auto flex min-h-full w-full max-w-[800px] flex-col gap-8 sm:gap-10">
        {turns.map((turn, index) => {
          const isLastTurn = index === turns.length - 1;
          const canRegenerateMessage =
            Boolean(turn.assistant) &&
            turn.assistant?.id === lastAssistantMessageId &&
            status === "ready";

          return (
            <ChatTurnView
              key={turn.id}
              turn={turn}
              isLastTurn={isLastTurn}
              status={status}
              streamingMessageId={lastAssistantMessageId}
              showError={hasError && isLastTurn}
              canRegenerate={canRegenerateMessage}
              onRegenerate={onRegenerate}
              onRetry={onRetry}
            />
          );
        })}

        <div
          ref={bottomSpacerRef}
          className="h-6 shrink-0"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
