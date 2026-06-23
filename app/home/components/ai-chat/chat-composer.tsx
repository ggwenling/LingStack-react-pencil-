"use client";

import { ArrowUp, Check, Plus, Square } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  chatComposerMorph,
  getMotionTransition,
} from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

import { ConnectionErrorToast } from "./connection-error-toast";

export type ComposerState = "idle" | "submitted" | "streaming" | "error";

export type ComposerPlacement = "hero" | "dock";

type ChatComposerProps = {
  input: string;
  composerState: ComposerState;
  placement?: ComposerPlacement;
  onInputChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onStop: () => void;
  onClearMessages: () => void;
  showErrorToast?: boolean;
  onRetry?: () => void;
  onDismissError?: () => void;
};

function ComposerWaveform({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex h-5 items-end gap-[3px]", className)}
      aria-hidden
    >
      {[0.55, 0.85, 0.45, 1, 0.65, 0.9].map((scale, index) => (
        <span
          key={index}
          className="lingstack-composer-bar w-[3px] rounded-full bg-neutral-400"
          style={{
            height: `${Math.round(scale * 18)}px`,
            animationDelay: `${index * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

function StreamingSpinner() {
  return (
    <span
      className="relative flex size-10 items-center justify-center"
      aria-label="生成中"
    >
      <span className="absolute inset-0 rounded-full border-2 border-neutral-200" />
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-neutral-950" />
      <span className="size-2 rounded-full bg-neutral-950" />
    </span>
  );
}

export function ChatComposer({
  input,
  composerState,
  placement = "dock",
  onInputChange,
  onSubmit,
  onStop,
  onClearMessages: _onClearMessages,
  showErrorToast = false,
  onRetry,
  onDismissError,
}: ChatComposerProps) {
  const reducedMotion = useReducedMotion();
  const isHero = placement === "hero";
  const isActive =
    composerState === "submitted" || composerState === "streaming";
  const isInputDisabled = isActive;
  const canSubmit = !isInputDisabled && Boolean(input.trim());
  const hasError = composerState === "error";

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "w-full shrink-0",
        isHero
          ? "pb-2"
          : "bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9] to-transparent px-4 pb-5 pt-3 sm:px-8",
      )}
    >
      <div
        className={cn(
          "relative mx-auto w-full",
          isHero ? "max-w-[720px]" : "max-w-[800px]",
        )}
      >
        <ConnectionErrorToast
          visible={showErrorToast}
          onRetry={onRetry}
          onDismiss={onDismissError}
        />

        {isActive ? (
          <div
            className={cn(
              "overflow-hidden rounded-[28px] border border-[#E7E7E4] bg-white shadow-[0_4px_32px_-8px_rgba(0,0,0,0.08)]",
              hasError && "lingstack-chat-error-input",
            )}
          >
            <div className="flex items-center gap-3 border-b border-[#E7E7E4]/40 px-4 py-2.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
                <Check className="size-3.5 text-emerald-500" />
                Search Enabled
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
                <span className="flex size-4 items-center justify-center rounded bg-neutral-950 text-[8px] font-bold text-white">
                  LF
                </span>
                LingFlow v2
              </span>
            </div>

            <div className="relative flex items-center gap-3 px-4 py-2">
              <textarea
                value={input}
                onChange={(event) => onInputChange(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isInputDisabled}
                placeholder="Ask anything..."
                rows={1}
                className="min-h-10 flex-1 resize-none bg-transparent py-2 text-sm font-medium leading-6 text-neutral-950 outline-none transition-opacity placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <AnimatePresence mode="wait" initial={false}>
                {composerState === "streaming" ? (
                  <motion.button
                    key="stop"
                    type="button"
                    aria-label="停止生成"
                    onClick={onStop}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={getMotionTransition(
                      chatComposerMorph,
                      reducedMotion,
                    )}
                    className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-neutral-950 text-white transition-colors hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
                  >
                    <Square className="size-[15px]" />
                  </motion.button>
                ) : (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={getMotionTransition(
                      chatComposerMorph,
                      reducedMotion,
                    )}
                  >
                    <StreamingSpinner />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center border-t border-[#E7E7E4]/40 px-4 pb-2.5 pt-1.5">
              <p className="text-[11px] font-medium text-neutral-400">
                Auto-saving | Streaming Mode
              </p>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "relative overflow-hidden border border-[#E7E7E4] bg-white shadow-[0_4px_32px_-8px_rgba(0,0,0,0.08)] transition-[border-color,box-shadow] focus-within:border-neutral-300 focus-within:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)]",
              isHero ? "rounded-[28px] p-3" : "rounded-[24px] p-2",
              hasError && "lingstack-chat-error-input",
            )}
          >
            <div className={cn("flex gap-2", isHero ? "items-center px-0.5" : "items-end px-1")}>
              <button
                type="button"
                aria-label="添加附件"
                title="添加附件"
                className={cn(
                  "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950",
                  !isHero && "mb-1",
                )}
              >
                <Plus className="size-5" />
              </button>

              <textarea
                value={input}
                onChange={(event) => onInputChange(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isInputDisabled}
                placeholder={isHero ? "尽管问..." : "Reply to LingStack..."}
                rows={1}
                className={cn(
                  "flex-1 resize-none bg-transparent font-medium text-neutral-950 outline-none disabled:cursor-not-allowed",
                  isHero
                    ? "h-10 min-h-10 py-0 text-[15px] leading-10 placeholder:text-neutral-400"
                    : "min-h-10 py-2.5 text-[15px] leading-6 placeholder:text-neutral-500",
                )}
              />

              <div
                className={cn(
                  "flex shrink-0 items-center gap-2",
                  !isHero && "mb-1",
                )}
              >
                <ComposerWaveform className="hidden sm:flex" />
                <AnimatePresence mode="wait" initial={false}>
                  <motion.button
                    key="send"
                    type="submit"
                    aria-label="发送"
                    disabled={!canSubmit}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: !canSubmit ? 0.45 : 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={getMotionTransition(
                      chatComposerMorph,
                      reducedMotion,
                    )}
                    className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-neutral-950 text-white transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
                  >
                    <ArrowUp className="size-[18px]" />
                  </motion.button>
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isActive && !isHero ? (
        <p className="mx-auto mt-3 max-w-[800px] text-center text-[11px] font-medium text-neutral-400">
          LingStack 会保存本次学习会话，便于后续复盘。
        </p>
      ) : null}
    </form>
  );
}
