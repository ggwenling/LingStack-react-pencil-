import type { Transition, Variants } from "motion/react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const pageEnterTransition: Transition = {
  duration: 0.22,
  ease: EASE_OUT,
};

export const staggerStepMs = 55;

export const messageEnterTransition: Transition = {
  duration: 0.24,
  ease: EASE_OUT,
};

export const hoverTransition: Transition = {
  duration: 0.18,
  ease: EASE_OUT,
};

export const collapseTransition: Transition = {
  duration: 0.2,
  ease: EASE_OUT,
};

export const sidebarSpringTransition: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.8,
};

export const pageEnterVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export const messageEnterVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export const collapseVariants: Variants = {
  hidden: { opacity: 0, y: -4 },
  show: { opacity: 1, y: 0 },
};

export const modulePanelVariants: Variants = {
  hidden: { opacity: 0, y: -4, height: 0 },
  show: { opacity: 1, y: 0, height: "auto" },
};

export function getStaggerDelay(index: number, reducedMotion: boolean | null) {
  if (reducedMotion) {
    return 0;
  }

  return (index * staggerStepMs) / 1000;
}

export const chatCursorBlink: Transition = {
  duration: 1,
  repeat: Infinity,
  ease: "linear",
};

export const chatActionReveal: Transition = {
  duration: 0.2,
  ease: EASE_OUT,
};

export const chatToastEnter: Transition = {
  duration: 0.28,
  ease: EASE_OUT,
};

export const chatComposerMorph: Transition = {
  duration: 0.18,
  ease: EASE_OUT,
};

export const chatComposerLayoutTransition: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 34,
  mass: 0.85,
};

export const chatEmptyHeroTransition: Transition = {
  duration: 0.28,
  ease: EASE_OUT,
};

export const chatEmptyHeroVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export const chatActionRevealVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
};

export const chatToastVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.98 },
};

export function getMotionTransition(
  transition: Transition,
  reducedMotion: boolean | null,
): Transition {
  if (reducedMotion) {
    return { duration: 0 };
  }

  return transition;
}
