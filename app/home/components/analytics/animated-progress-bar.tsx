"use client";

import { motion, useReducedMotion } from "motion/react";

import { EASE_OUT } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type AnimatedProgressBarProps = {
  percent: number;
  className?: string;
  barClassName?: string;
  delay?: number;
};

export function AnimatedProgressBar({
  percent,
  className,
  barClassName,
  delay = 0,
}: AnimatedProgressBarProps) {
  const reducedMotion = useReducedMotion();
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className={cn(
        "h-2 overflow-hidden rounded-full bg-[#E8EEFF]",
        className,
      )}
    >
      <motion.div
        className={cn("h-full rounded-full bg-[#2170E4]", barClassName)}
        initial={{ width: reducedMotion ? `${clamped}%` : "0%" }}
        animate={{ width: `${clamped}%` }}
        transition={{
          duration: reducedMotion ? 0 : 0.65,
          ease: EASE_OUT,
          delay: reducedMotion ? 0 : delay,
        }}
      />
    </div>
  );
}
