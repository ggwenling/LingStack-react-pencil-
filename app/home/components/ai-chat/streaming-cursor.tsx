"use client";

import { motion, useReducedMotion } from "motion/react";

import { chatCursorBlink, getMotionTransition } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type StreamingCursorProps = {
  className?: string;
};

export function StreamingCursor({ className }: StreamingCursorProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <span
        aria-hidden="true"
        className={cn("lingstack-chat-cursor", className)}
      />
    );
  }

  return (
    <motion.span
      aria-hidden="true"
      className={cn("lingstack-chat-cursor", className)}
      animate={{ opacity: [1, 0, 1] }}
      transition={getMotionTransition(chatCursorBlink, reducedMotion)}
    />
  );
}
