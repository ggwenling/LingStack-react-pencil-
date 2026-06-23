"use client";

import { AlertCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import {
  getMotionTransition,
  messageEnterTransition,
  messageEnterVariants,
} from "@/lib/motion/presets";

type InlineMessageErrorProps = {
  message?: string;
  onRetry?: () => void;
};

export function InlineMessageError({
  message = "无法连接网络，请检查连接后重试",
  onRetry,
}: InlineMessageErrorProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="flex items-start gap-2 py-1"
      initial="hidden"
      animate="show"
      variants={messageEnterVariants}
      transition={getMotionTransition(messageEnterTransition, reducedMotion)}
      role="alert"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
      <p className="text-[13px] font-semibold leading-6 text-rose-700">
        {message}
        {onRetry ? (
          <>
            {" "}
            <button
              type="button"
              onClick={onRetry}
              className="cursor-pointer font-extrabold underline underline-offset-2 hover:text-rose-800"
            >
              重试
            </button>
          </>
        ) : null}
      </p>
    </motion.div>
  );
}
