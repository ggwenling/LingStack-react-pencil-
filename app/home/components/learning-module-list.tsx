"use client";

import Link from "next/link";
import {
  ChevronRight,
  MessageSquareText,
  Plus,
  Trash2,
} from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import { usePathname } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";

import {
  createModuleLearningChat,
  deleteLearningChat,
} from "@/app/home/api/actions";
import { fuzzyMatchText } from "@/lib/fuzzy-match";
import {
  fromPrismaModule,
  LEARNING_MODULES,
  type LearningModuleId,
} from "@/lib/learning/modules";
import {
  getMotionTransition,
  modulePanelVariants,
  sidebarSpringTransition,
} from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

import { useThreadSearch } from "./thread-search-context";

const ACTIVE_THREAD_LAYOUT_ID = "learning-thread-active-bg";

type LearningModuleListProps = {
  threads: Array<{
    id: string;
    title: string;
    updatedAt: string | Date;
    module: "REACT" | "NEXT";
  }>;
};

function formatThreadTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getActiveModuleId(
  pathname: string,
  threads: LearningModuleListProps["threads"],
): LearningModuleId | null {
  const match = pathname.match(/^\/home\/([^/]+)\/ai$/);
  if (!match) {
    return null;
  }

  const activeThread = threads.find((thread) => thread.id === match[1]);
  return activeThread ? fromPrismaModule(activeThread.module) : null;
}

export function LearningModuleList({ threads }: LearningModuleListProps) {
  const pathname = usePathname();
  const { query } = useThreadSearch();
  const deferredQuery = useDeferredValue(query);
  const reducedMotion = useReducedMotion();
  const activeModuleId = getActiveModuleId(pathname, threads);
  const springTransition = getMotionTransition(
    sidebarSpringTransition,
    reducedMotion,
  );

  const [collapsed, setCollapsed] = useState<Record<LearningModuleId, boolean>>(
    () => ({
      react: false,
      next: false,
    }),
  );

  const threadsByModule = useMemo(
    () =>
      LEARNING_MODULES.map((module) => ({
        module,
        threads: threads
          .filter((thread) => fromPrismaModule(thread.module) === module.id)
          .filter((thread) => fuzzyMatchText(thread.title, deferredQuery)),
      })),
    [deferredQuery, threads],
  );

  function toggleModule(moduleId: LearningModuleId) {
    setCollapsed((current) => ({
      ...current,
      [moduleId]: !current[moduleId],
    }));
  }

  return (
    <LayoutGroup id="learning-module-list">
      <div className="mt-1 space-y-1">
        {threadsByModule.map(({ module, threads: moduleThreads }) => {
          const isAutoExpanded =
            activeModuleId === module.id ||
            (query.trim().length > 0 && moduleThreads.length > 0);
          const isCollapsed = isAutoExpanded ? false : collapsed[module.id];
          const panelId = `learning-module-${module.id}`;

          return (
            <section key={module.id} className="rounded-lg">
              <div className="flex items-center gap-0.5 pr-1">
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  aria-expanded={!isCollapsed}
                  aria-controls={panelId}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-neutral-50"
                >
                  <motion.span
                    animate={{ rotate: isCollapsed ? 0 : 90 }}
                    transition={springTransition}
                    className="inline-flex shrink-0"
                  >
                    <ChevronRight className="size-3.5 text-neutral-400" />
                  </motion.span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-neutral-700">
                    {module.label}
                  </span>
                  <span className="shrink-0 rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500">
                    {moduleThreads.length}
                  </span>
                </button>

                <form
                  action={createModuleLearningChat.bind(null, module.id)}
                  onClick={(event) => event.stopPropagation()}
                >
                  <button
                    type="submit"
                    aria-label={`新建${module.label}会话`}
                    title={`新建${module.label}会话`}
                    className="flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </form>
              </div>

              <AnimatePresence initial={false}>
                {!isCollapsed ? (
                  <motion.div
                    id={panelId}
                    key={`panel-${module.id}`}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={modulePanelVariants}
                    transition={springTransition}
                    className="overflow-hidden"
                  >
                    <div className="mt-0.5 space-y-1 pb-2 pl-2">
                      {moduleThreads.length ? (
                        moduleThreads.map((thread) => {
                          const href = `/home/${thread.id}/ai`;
                          const isActive = pathname === href;

                          return (
                            <div
                              key={thread.id}
                              className={cn(
                                "group relative flex min-h-9 items-center rounded-lg pr-1",
                                !isActive && "hover:bg-neutral-50",
                              )}
                            >
                              {isActive ? (
                                <motion.div
                                  layoutId={ACTIVE_THREAD_LAYOUT_ID}
                                  className="absolute inset-0 rounded-lg bg-neutral-100"
                                  transition={springTransition}
                                />
                              ) : null}

                              <motion.div
                                className="relative z-1 flex min-w-0 flex-1 items-center"
                                whileHover={
                                  reducedMotion
                                    ? undefined
                                    : {
                                        x: 2,
                                        transition: springTransition,
                                      }
                                }
                              >
                                <Link
                                  href={href}
                                  className={cn(
                                    "flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2",
                                    isActive
                                      ? "font-bold text-neutral-950"
                                      : "font-semibold text-neutral-500 hover:text-neutral-950",
                                  )}
                                >
                                  <MessageSquareText className="size-3.5 shrink-0" />
                                  <span className="min-w-0 flex-1 truncate text-[13px]">
                                    {thread.title}
                                  </span>
                                  <span className="shrink-0 text-[10px] font-bold text-neutral-400">
                                    {formatThreadTime(thread.updatedAt)}
                                  </span>
                                </Link>

                                <form
                                  action={deleteLearningChat.bind(
                                    null,
                                    thread.id,
                                  )}
                                >
                                  <button
                                    type="submit"
                                    aria-label={`删除会话 ${thread.title}`}
                                    title="删除会话"
                                    className="flex size-7 cursor-pointer items-center justify-center rounded-md text-neutral-400 opacity-0 transition hover:bg-white hover:text-rose-600 group-hover:opacity-100 focus:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </form>
                              </motion.div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="px-2.5 py-2 text-xs font-medium leading-5 text-neutral-400">
                          暂无会话
                        </p>
                      )}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </section>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
