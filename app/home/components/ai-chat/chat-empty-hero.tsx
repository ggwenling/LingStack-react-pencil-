"use client";

import { motion, useReducedMotion } from "motion/react";

import {
  chatEmptyHeroTransition,
  chatEmptyHeroVariants,
  getMotionTransition,
} from "@/lib/motion/presets";

export function ChatEmptyHero() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      key="hero"
      className="flex w-full flex-col items-center px-4 pb-6 sm:px-8"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={chatEmptyHeroVariants}
      transition={getMotionTransition(chatEmptyHeroTransition, reducedMotion)}
    >
      <h1 className="text-center text-4xl font-bold tracking-tight text-neutral-400 sm:text-5xl">
        LingStack
      </h1>
    </motion.div>
  );
}
