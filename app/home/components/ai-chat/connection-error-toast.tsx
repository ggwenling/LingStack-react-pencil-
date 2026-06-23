"use client";

import { AlertCircle, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";

import {
  chatToastEnter,
  chatToastVariants,
  getMotionTransition,
} from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type ConnectionErrorToastProps = {
  visible: boolean;
  title?: string;
  description?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  autoDismissMs?: number;
  className?: string;
};

export function ConnectionErrorToast({
  visible,
  title = "连接已断开",
  description = "无法连接到 LingStack 服务，请检查您的网络连接",
  onRetry,
  onDismiss,
  autoDismissMs = 5000,
  className,
}: ConnectionErrorToastProps) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!visible || !onDismiss || autoDismissMs <= 0) {
      return;
    }

    const timer = window.setTimeout(onDismiss, autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [autoDismissMs, onDismiss, visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className={cn(
            "lingstack-chat-toast pointer-events-auto absolute inset-x-0 bottom-[calc(100%+12px)] mx-auto flex w-full max-w-[min(520px,92vw)] items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3.5",
            className,
          )}
          initial="hidden"
          animate="show"
          exit="exit"
          variants={chatToastVariants}
          transition={getMotionTransition(chatToastEnter, reducedMotion)}
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-rose-900">{title}</p>
            <p className="mt-0.5 text-[13px] font-medium leading-5 text-rose-700">
              {description}
            </p>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2.5 inline-flex h-8 cursor-pointer items-center rounded-lg bg-slate-950 px-3 text-xs font-bold text-white transition-colors hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
              >
                立即重试
              </button>
            ) : null}
          </div>
          {onDismiss ? (
            <button
              type="button"
              aria-label="关闭提示"
              onClick={onDismiss}
              className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-100 hover:text-rose-800"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
