"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import {
  getMotionTransition,
  getStaggerDelay,
  hoverTransition,
  pageEnterTransition,
  pageEnterVariants,
  staggerItemVariants,
} from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type FadeSlideInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function FadeSlideIn({
  children,
  className,
  delay = 0,
}: FadeSlideInProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={pageEnterVariants}
      transition={{
        ...getMotionTransition(pageEnterTransition, reducedMotion),
        delay: reducedMotion ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  index: number;
};

export function StaggerItem({ children, className, index }: StaggerItemProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={staggerItemVariants}
      transition={{
        ...getMotionTransition(pageEnterTransition, reducedMotion),
        delay: getStaggerDelay(index, reducedMotion),
      }}
    >
      {children}
    </motion.div>
  );
}

type HoverLiftProps = {
  children: ReactNode;
  className?: string;
};

export function HoverLift({ children, className }: HoverLiftProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("will-change-transform", className)}
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: -2,
              transition: getMotionTransition(hoverTransition, reducedMotion),
            }
      }
    >
      {children}
    </motion.div>
  );
}
