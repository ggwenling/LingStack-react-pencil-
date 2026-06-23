"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";

import {
  getMotionTransition,
  messageEnterTransition,
  messageEnterVariants,
} from "@/lib/motion/presets";
import { cn } from "@/lib/utils";
import { MessageActions } from "./message-actions";
import { StreamingCursor } from "./streaming-cursor";
import { getMessageText, getRenderableMarkdown } from "./utils";
import type { UIMessage } from "ai";

const MarkdownContent = dynamic(
  () =>
    import("@/app/home/components/markdown-content").then((module) => ({
      default: module.MarkdownContent,
    })),
  {
    loading: () => (
      <div className="min-h-[120px] animate-pulse rounded-lg bg-neutral-100/80" />
    ),
  },
);

type AssistantReplyBlockProps = {
  message: UIMessage;
  isStreaming?: boolean;
  canRegenerate?: boolean;
  onRegenerate?: () => void;
  showError?: boolean;
  className?: string;
};

export function AssistantReplyBlock({
  message,
  isStreaming = false,
  canRegenerate = false,
  onRegenerate,
  showError = false,
  className,
}: AssistantReplyBlockProps) {
  const reducedMotion = useReducedMotion();
  const content = getMessageText(message);
  const renderableContent = getRenderableMarkdown(content, isStreaming);
  const showActions = !isStreaming && !showError && Boolean(content);

  return (
    <motion.div
      className={cn("group w-full", className)}
      initial="hidden"
      animate="show"
      variants={messageEnterVariants}
      transition={getMotionTransition(messageEnterTransition, reducedMotion)}
      aria-live="polite"
      aria-busy={isStreaming}
    >
      <div className="w-full space-y-4">
        <div className="rounded-2xl border border-[#E7E7E4] bg-white px-5 py-4 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.08)]">
          <div className="text-[14px] font-medium leading-7 text-neutral-800 sm:text-[15px] sm:leading-8">
            {content ? (
              <MarkdownContent
                content={renderableContent}
                className="lingstack-chat-markdown text-neutral-800"
              />
            ) : isStreaming ? null : (
              <span className="text-neutral-500">暂无回复内容</span>
            )}
            {isStreaming ? <StreamingCursor /> : null}
          </div>
        </div>

        <MessageActions
          content={content}
          canRegenerate={canRegenerate}
          onRegenerate={onRegenerate}
          visible={showActions}
        />
      </div>
    </motion.div>
  );
}
