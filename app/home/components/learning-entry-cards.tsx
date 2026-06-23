"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useFormStatus } from "react-dom";

import { createModuleLearningChat } from "@/app/home/api/actions";
import type { HomeDashboardView } from "@/lib/learning/home-dashboard-types";
import { getMotionTransition, hoverTransition } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type LearningEntryCardsProps = {
  entries: HomeDashboardView["entries"];
};

const entryTheme = {
  react: {
    badge: "React",
    badgeClass: "bg-blue-50 text-blue-600",
    progress: "bg-blue-500",
    Mascot: ReactMascot,
  },
  next: {
    badge: "Next.js",
    badgeClass: "bg-neutral-100 text-neutral-700",
    progress: "bg-neutral-900",
    Mascot: NextMascot,
  },
} as const;

export function LearningEntryCards({ entries }: LearningEntryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {entries.map((entry) => (
        <EntryCard key={entry.title} entry={entry} />
      ))}
    </div>
  );
}

function EntryCard({ entry }: { entry: HomeDashboardView["entries"][number] }) {
  const reducedMotion = useReducedMotion();
  const theme = entryTheme[entry.accent];
  const Mascot = theme.Mascot;
  const isStarted = entry.percent > 0;

  return (
    <motion.article
      className="lingstack-card-v2 flex min-h-[200px] flex-col p-5"
      whileHover={
        reducedMotion
          ? undefined
          : {
              transition: getMotionTransition(hoverTransition, reducedMotion),
            }
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold text-neutral-950">
              {entry.title}
            </h3>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                theme.badgeClass,
              )}
            >
              {theme.badge}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-5 text-neutral-500">
            {entry.description}
          </p>
        </div>
        <div className="shrink-0 opacity-90">
          <Mascot />
        </div>
      </div>

      <div className="mt-auto pt-5">
        <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
          <span>已完成 {entry.percent}%</span>
          <span>{isStarted ? "进行中" : "未开始"}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100">
          <div
            className={cn("h-full rounded-full", theme.progress)}
            style={{ width: `${entry.percent}%` }}
          />
        </div>
        <form action={createModuleLearningChat.bind(null, entry.accent)}>
          <EnterLearningButton isStarted={isStarted} />
        </form>
      </div>
    </motion.article>
  );
}

function EnterLearningButton({ isStarted }: { isStarted: boolean }) {
  const { pending } = useFormStatus();

  return (
    <motion.button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-70"
      animate={{ opacity: pending ? 0.75 : 1 }}
      transition={{ duration: 0.18 }}
    >
      {pending ? (
        <>
          <Loader2 className="size-3.5 animate-spin" />
          正在进入...
        </>
      ) : (
        <>
          {isStarted ? "继续学习" : "开始学习"}
          <ArrowRight className="size-3.5" />
        </>
      )}
    </motion.button>
  );
}

function ReactMascot() {
  return (
    <svg viewBox="0 0 88 88" className="size-12" aria-hidden>
      <ellipse
        cx="44"
        cy="44"
        rx="30"
        ry="11"
        fill="none"
        stroke="#7DD3FC"
        strokeWidth="2.5"
      />
      <ellipse
        cx="44"
        cy="44"
        rx="30"
        ry="11"
        fill="none"
        stroke="#38BDF8"
        strokeWidth="2.5"
        transform="rotate(60 44 44)"
      />
      <ellipse
        cx="44"
        cy="44"
        rx="30"
        ry="11"
        fill="none"
        stroke="#0EA5E9"
        strokeWidth="2.5"
        transform="rotate(120 44 44)"
      />
      <circle cx="44" cy="44" r="14" fill="#38BDF8" />
    </svg>
  );
}

function NextMascot() {
  return (
    <svg viewBox="0 0 88 88" className="size-12" aria-hidden>
      <path d="M44 22 L62 58 L26 58 Z" fill="#171717" />
      <circle cx="38" cy="44" r="2" fill="#FFFFFF" />
      <circle cx="50" cy="44" r="2" fill="#FFFFFF" />
    </svg>
  );
}
