"use client";

import { Check, Copy, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import {
  chatActionReveal,
  chatActionRevealVariants,
  getMotionTransition,
} from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type MessageActionsProps = {
  content: string;
  canRegenerate?: boolean;
  onRegenerate?: () => void;
  visible?: boolean;
  className?: string;
};

export function MessageActions({
  content,
  canRegenerate = false,
  onRegenerate,
  visible = true,
  className,
}: MessageActionsProps) {
  const reducedMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  const handleCopy = async () => {
    if (!content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className={cn("flex items-center gap-3 opacity-60", className)}
          initial="hidden"
          animate="show"
          exit="hidden"
          variants={chatActionRevealVariants}
          transition={{
            ...getMotionTransition(chatActionReveal, reducedMotion),
            delay: reducedMotion ? 0 : 0.15,
          }}
        >
          <button
            type="button"
            aria-label={copied ? "已复制" : "复制回复"}
            title={copied ? "已复制" : "复制回复"}
            onClick={handleCopy}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-1 text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            <span>{copied ? "已复制" : "Copy"}</span>
          </button>
          <button
            type="button"
            aria-label="重新生成"
            title="重新生成"
            onClick={onRegenerate}
            disabled={!canRegenerate}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-1 text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
          >
            <RotateCcw className="size-3.5" />
            <span>Regenerate</span>
          </button>
          <button
            type="button"
            aria-label="有帮助"
            title="有帮助"
            onClick={() => setFeedback(feedback === "up" ? null : "up")}
            className={cn(
              "flex size-8 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition-colors hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950",
              feedback === "up" && "text-neutral-950",
            )}
          >
            <ThumbsUp className="size-3.5" />
          </button>
          <button
            type="button"
            aria-label="没有帮助"
            title="没有帮助"
            onClick={() => setFeedback(feedback === "down" ? null : "down")}
            className={cn(
              "flex size-8 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition-colors hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950",
              feedback === "down" && "text-neutral-950",
            )}
          >
            <ThumbsDown className="size-3.5" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
