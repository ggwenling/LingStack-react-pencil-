"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import {
  chatComposerLayoutTransition,
  getMotionTransition,
} from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

import { ChatComposer, type ComposerState } from "./ai-chat/chat-composer";
import { ChatEmptyHero } from "./ai-chat/chat-empty-hero";
import { ChatHeader } from "./ai-chat/chat-header";
import { ChatThread } from "./ai-chat/chat-thread";

type AiChatPanelProps = {
  threadId: string;
  title: string;
  userName?: string | null;
  initialMessages?: UIMessage[];
  compact?: boolean;
  onRegisterHandlers?: (handlers: AiChatPanelHandle) => void;
};

export type AiChatPanelHandle = {
  appendAssistantMessage: (message: { id: string; content: string }) => void;
};

function getComposerState(
  status: "submitted" | "streaming" | "ready" | "error",
  hasError: boolean,
): ComposerState {
  if (hasError) {
    return "error";
  }

  if (status === "submitted") {
    return "submitted";
  }

  if (status === "streaming") {
    return "streaming";
  }

  return "idle";
}

export function AiChatPanel({
  threadId,
  title: _title,
  userName,
  initialMessages = [],
  compact = false,
  onRegisterHandlers,
}: AiChatPanelProps) {
  const reducedMotion = useReducedMotion();
  const {
    messages,
    sendMessage,
    status,
    stop,
    regenerate,
    setMessages,
    error,
    clearError,
  } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages, trigger, body }) => {
        const lastUserMessage = [...messages]
          .reverse()
          .find((message) => message.role === "user");

        return {
          body: {
            ...body,
            threadId,
            trigger,
            lastUserMessage:
              trigger === "submit-message" ? lastUserMessage : undefined,
          },
        };
      },
    }),
  });

  useEffect(() => {
    if (!onRegisterHandlers) {
      return;
    }

    onRegisterHandlers({
      appendAssistantMessage: ({ id, content }) => {
        setMessages((current) => {
          if (current.some((message) => message.id === id)) {
            return current;
          }

          return [
            ...current,
            {
              id,
              role: "assistant",
              parts: [{ type: "text", text: content }],
            },
          ];
        });
      },
    });
  }, [onRegisterHandlers, setMessages]);

  const [input, setInput] = useState("");
  const [dismissedError, setDismissedError] = useState<Error | undefined>(
    undefined,
  );
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const isEmpty = messages.length === 0;
  const hasError = Boolean(error);
  const showErrorToast = hasError && error !== dismissedError;
  const composerState = getComposerState(status, hasError);
  const canEdit =
    composerState === "idle" || composerState === "error";

  const lastAssistantMessageId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")?.id;

  const handleRetry = () => {
    if (error) {
      setDismissedError(error);
    }
    clearError();

    if (lastAssistantMessageId) {
      regenerate();
      return;
    }

    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    if (lastUserMessage) {
      const text = lastUserMessage.parts
        .map((part) => (part.type === "text" ? part.text : ""))
        .join("");

      if (text) {
        void sendMessage({ text });
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = input.trim();
    if (!text || !canEdit) {
      return;
    }

    if (hasError) {
      if (error) {
        setDismissedError(error);
      }
      clearError();
    }

    setInput("");
    await sendMessage({ text });
  };

  const handleDismissError = () => {
    if (error) {
      setDismissedError(error);
    }
    clearError();
  };

  const composerLayoutTransition = getMotionTransition(
    chatComposerLayoutTransition,
    reducedMotion,
  );

  return (
    <LayoutGroup id="ai-chat">
      <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#f9f9f9]">
        <ChatHeader userName={userName} compact={compact} />

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            isEmpty && "justify-center",
          )}
        >
          <AnimatePresence mode="wait">
            {isEmpty ? <ChatEmptyHero key="hero" /> : null}
          </AnimatePresence>

          {!isEmpty ? (
            <ChatThread
              messages={messages}
              status={status}
              hasError={hasError}
              lastAssistantMessageId={lastAssistantMessageId}
              onRegenerate={() => regenerate()}
              onRetry={handleRetry}
              bottomSpacerRef={bottomRef}
              scrollContainerRef={scrollContainerRef}
            />
          ) : null}

          <motion.div
            layout
            layoutId="chat-composer-shell"
            transition={composerLayoutTransition}
            className={cn("w-full", isEmpty ? "px-4 sm:px-8" : "shrink-0")}
          >
            <ChatComposer
              input={input}
              composerState={composerState}
              placement={isEmpty ? "hero" : "dock"}
              onInputChange={setInput}
              onSubmit={handleSubmit}
              onStop={() => stop()}
              onClearMessages={() => setMessages([])}
              showErrorToast={showErrorToast}
              onRetry={handleRetry}
              onDismissError={handleDismissError}
            />
          </motion.div>
        </div>
      </div>
    </LayoutGroup>
  );
}
