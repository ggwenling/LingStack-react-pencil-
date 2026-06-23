"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";

import { EASE_OUT } from "@/lib/motion/presets";

type AnimatedNumberProps = {
  value: number;
  className?: string;
  delay?: number;
  formatter?: (value: number) => string;
};

export function AnimatedNumber({
  value,
  className,
  delay = 0,
  formatter = (next) => next.toLocaleString(),
}: AnimatedNumberProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <span className={className}>{formatter(value)}</span>;
  }

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay }}
    >
      <CountUp value={value} formatter={formatter} delay={delay} />
    </motion.span>
  );
}

function CountUp({
  value,
  formatter,
  delay,
}: {
  value: number;
  formatter: (value: number) => string;
  delay: number;
}) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      return;
    }
  }, [reducedMotion]);

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay }}
    >
      {formatter(value)}
    </motion.span>
  );
}
