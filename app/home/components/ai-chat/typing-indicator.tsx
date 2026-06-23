"use client";

import { motion, useReducedMotion } from "motion/react";

import {
  getMotionTransition,
  getStaggerDelay,
  messageEnterTransition,
  messageEnterVariants,
} from "@/lib/motion/presets";

export function TypingIndicator() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="flex justify-start"
      initial="hidden"
      animate="show"
      variants={messageEnterVariants}
      transition={getMotionTransition(messageEnterTransition, reducedMotion)}
      aria-label="正在生成回复"
      role="status"
    >
      <div className="inline-flex items-center gap-3 rounded-full border border-[#C8C4FF] bg-white px-4 py-2 shadow-sm">
        <div className="flex h-4 w-6 items-end gap-1">
          {[0, 1, 2, 3].map((index) => (
            <motion.span
              key={index}
              className="w-[3px] rounded-full bg-neutral-700"
              animate={
                reducedMotion
                  ? undefined
                  : {
                      height: ["8px", "16px", "10px", "14px"],
                      opacity: [0.55, 1, 0.55, 1],
                    }
              }
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: getStaggerDelay(index, reducedMotion),
              }}
              style={{ height: "10px" }}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-neutral-800">
          AI 正在思考中...
        </span>
      </div>
    </motion.div>
  );
}
