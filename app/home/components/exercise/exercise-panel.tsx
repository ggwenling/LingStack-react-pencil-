"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  XCircle,
} from "lucide-react";

import { ExerciseCodemirrorEditor } from "./exercise-codemirror-editor";
import { cn } from "@/lib/utils";

type ExerciseData = {
  exerciseId: string;
  lessonKey: string;
  lessonTitle: string;
  title: string;
  description: string;
  requirements: string[];
  starterCode: string;
  status: "PENDING" | "ACTIVE" | "PASSED";
  templateId: string;
  passScore: number;
};

type CriteriaResult = {
  id: string;
  name: string;
  met: boolean;
  reason: string;
};

type SubmitResult = {
  passed: boolean;
  score: number;
  feedback: string;
  criteria: CriteriaResult[];
  nextHint?: string;
  lessonCompleted: boolean;
  unlockedLessonKey: string | null;
  attemptNumber: number;
  chatFollowUp?: {
    messageId: string;
    content: string;
  } | null;
};

type SubmissionHistoryItem = {
  id: string;
  attemptNumber: number;
  score: number;
  feedback: string;
  finalPassed: boolean;
  createdAt: string;
};

type ExercisePanelProps = {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  className?: string;
  threadId?: string;
  onChatFollowUp?: (message: { messageId: string; content: string }) => void;
};

export function ExercisePanel({
  collapsed = false,
  onToggleCollapsed,
  className,
  threadId,
  onChatFollowUp,
}: ExercisePanelProps) {
  const router = useRouter();
  const [exercise, setExercise] = useState<ExerciseData | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [history, setHistory] = useState<SubmissionHistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const loadHistory = useCallback(async (exerciseId: string) => {
    try {
      const response = await fetch(
        `/api/learning/exercises/submissions?exerciseId=${encodeURIComponent(exerciseId)}`,
      );
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        return;
      }

      setHistory(payload.data as SubmissionHistoryItem[]);
    } catch {
      setHistory([]);
    }
  }, []);

  const loadExercise = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/learning/exercises/current");
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "加载练习失败");
      }

      const data = payload.data as ExerciseData | null;

      if (!data) {
        setExercise(null);
        setCode("");
        setHistory([]);
        return;
      }

      setExercise(data);
      setCode(data.starterCode);
      await loadHistory(data.exerciseId);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "加载练习失败",
      );
    } finally {
      setLoading(false);
    }
  }, [loadHistory]);

  useEffect(() => {
    // Initial client fetch on mount; setState runs after await, not synchronously in the effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void loadExercise();
  }, [loadExercise]);

  async function handleSubmit() {
    if (!exercise || submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/learning/exercises/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exerciseId: exercise.exerciseId,
          code,
          ...(threadId ? { threadId } : {}),
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "提交失败");
      }

      setResult(payload.data as SubmitResult);

      const followUp = (payload.data as SubmitResult).chatFollowUp;

      if (followUp) {
        onChatFollowUp?.(followUp);
      }

      router.refresh();
      await loadExercise();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "提交失败",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const showHintOnly =
    Boolean(result && !result.passed && result.attemptNumber >= 3);

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm text-neutral-500",
          className,
        )}
      >
        <LoaderCircle className="size-4 animate-spin" />
        正在加载当前练习...
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className={cn("px-4 py-3 text-sm text-neutral-500", className)}>
        当前没有可进行的练习。
      </div>
    );
  }

  return (
    <section
      className={cn("flex min-h-0 flex-col bg-white", className)}
      aria-label="练习区"
    >
      <div className="flex shrink-0 items-center gap-3 border-b border-[#E8E8E8] px-4 py-2.5 sm:px-5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
            {exercise.lessonTitle}
          </p>
          <h2 className="truncate text-sm font-semibold text-neutral-950 sm:text-base">
            {exercise.title}
          </h2>
        </div>

        <span
          className={cn(
            "hidden shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide sm:inline",
            exercise.status === "PASSED"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-neutral-100 text-neutral-700",
          )}
        >
          {exercise.status === "PASSED" ? "已通过" : "进行中"}
        </span>

        {onToggleCollapsed ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-expanded={!collapsed}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E8E8E8] px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            {collapsed ? "展开做题区" : "收起做题区"}
            {collapsed ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronUp className="size-3.5" />
            )}
          </button>
        ) : null}
      </div>

      {!collapsed ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="max-h-[28%] shrink-0 overflow-y-auto border-b border-[#E8E8E8] px-4 py-3 sm:px-5">
            <p className="text-sm text-neutral-600">{exercise.description}</p>

            <ul className="mt-3 space-y-1 text-sm text-neutral-600">
              {exercise.requirements.map((requirement) => (
                <li key={requirement}>• {requirement}</li>
              ))}
            </ul>
          </div>

          <div className="min-h-40 flex-1 px-4 py-3 sm:px-5">
            <ExerciseCodemirrorEditor fill value={code} onChange={setCode} />
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-[#E8E8E8] px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting || !code.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : null}
              提交代码
            </button>

            <span className="text-xs text-neutral-500">
              通过线 {exercise.passScore} 分 · 仅练习区提交可推进进度
            </span>
          </div>

          {history.length > 0 || error || result ? (
            <div className="max-h-[32%] shrink-0 overflow-y-auto border-t border-[#E8E8E8]">
              {history.length > 0 ? (
                <div className="px-4 py-3 sm:px-5">
                  <button
                    type="button"
                    onClick={() => setHistoryOpen((open) => !open)}
                    className="flex w-full items-center justify-between text-sm font-medium text-neutral-800"
                  >
                    提交历史（{history.length}）
                    {historyOpen ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </button>

                  {historyOpen ? (
                    <ul className="mt-3 space-y-2">
                      {history.map((item) => (
                        <li
                          key={item.id}
                          className="rounded-lg border border-[#E8E8E8] bg-[#fafafa] px-3 py-2 text-sm"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium text-neutral-900">
                              第 {item.attemptNumber} 次
                            </span>
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                item.finalPassed
                                  ? "text-emerald-600"
                                  : "text-amber-700",
                              )}
                            >
                              {item.finalPassed ? "通过" : "未通过"} ·{" "}
                              {item.score} 分
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-neutral-500">
                            {new Date(item.createdAt).toLocaleString("zh-CN")}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}

              {error ? (
                <div className="border-t border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700 sm:px-5">
                  {error}
                </div>
              ) : null}

              {result ? (
                <div
                  className={cn(
                    "border-t px-4 py-4 sm:px-5",
                    result.passed
                      ? "border-emerald-100 bg-emerald-50/60"
                      : "border-amber-100 bg-amber-50/60",
                  )}
                >
                  <div className="mb-3 flex items-center gap-2">
                    {result.passed ? (
                      <CheckCircle2 className="size-5 text-emerald-600" />
                    ) : (
                      <XCircle className="size-5 text-amber-600" />
                    )}
                    <p className="text-sm font-semibold text-neutral-950">
                      {result.passed ? "通过" : "未通过"} · {result.score} 分
                    </p>
                  </div>

                  {showHintOnly ? (
                    <p className="text-sm text-neutral-700">
                      {result.nextHint
                        ? `提示：${result.nextHint}`
                        : "多次未通过，请根据上方要求调整代码后重试。"}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-neutral-700">
                        {result.feedback}
                      </p>

                      {result.nextHint ? (
                        <p className="mt-2 text-sm text-neutral-600">
                          提示：{result.nextHint}
                        </p>
                      ) : null}

                      <ul className="mt-3 space-y-2">
                        {result.criteria.map((item) => (
                          <li
                            key={item.id}
                            className="rounded-lg border border-white/80 bg-white/70 px-3 py-2 text-sm"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium text-neutral-900">
                                {item.name}
                              </span>
                              <span
                                className={cn(
                                  "text-xs font-semibold",
                                  item.met
                                    ? "text-emerald-600"
                                    : "text-amber-700",
                                )}
                              >
                                {item.met ? "满足" : "未满足"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-neutral-600">
                              {item.reason}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {result.lessonCompleted ? (
                    <p className="mt-3 text-sm font-medium text-emerald-700">
                      本课已完成，下一课已解锁。
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
