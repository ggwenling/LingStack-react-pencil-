"use client";

import { motion, useReducedMotion } from "motion/react";

import {
  getMotionTransition,
  messageEnterTransition,
  messageEnterVariants,
} from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type UserQueryBlockProps = {
  children: React.ReactNode;
  className?: string;
};

export function UserQueryBlock({ children, className }: UserQueryBlockProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("flex w-full justify-end", className)}
      initial="hidden"
      animate="show"
      variants={messageEnterVariants}
      transition={getMotionTransition(messageEnterTransition, reducedMotion)}
    >
      <div className="max-w-[85%] rounded-2xl bg-neutral-950 px-5 py-3 shadow-sm sm:max-w-[75%]">
        <p className="text-left text-[15px] font-medium leading-relaxed text-white">
          {children}
        </p>
      </div>
    </motion.div>
  );
}
