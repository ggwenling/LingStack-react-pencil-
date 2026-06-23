import type { ReactNode } from "react";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type StateKind = "home" | "ai";

type LoadingStateProps = {
  kind: StateKind;
};

type ErrorStateProps = {
  kind: StateKind;
  digest?: string;
  retryAction?: ReactNode;
};

function SkeletonLine({
  className,
  delay = "0ms",
}: {
  className?: string;
  delay?: string;
}) {
  return (
    <span
      className={cn(
        "block h-3.5 animate-pulse rounded-full bg-neutral-200",
        className,
      )}
      style={{ animationDelay: delay }}
    />
  );
}

function StatusPill({
  label,
  tone = "online",
}: {
  label: string;
  tone?: "online" | "error";
}) {
  return (
    <div className="inline-flex h-8 items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 text-xs font-bold text-slate-700">
      <span
        className={cn(
          "size-2 rounded-full",
          tone === "error" ? "bg-red-600" : "bg-cyan-500",
        )}
      />
      {label}
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="w-full max-w-[1180px] space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl space-y-3">
          <SkeletonLine className="h-7 w-28 rounded-full" />
          <SkeletonLine className="h-8 w-56" delay="60ms" />
          <SkeletonLine className="h-4 w-80" delay="90ms" />
        </div>
        <div className="flex items-center gap-2.5">
          <SkeletonLine className="h-10 w-[260px] rounded-lg" delay="100ms" />
          <span className="size-10 rounded-full bg-neutral-200" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="h-[220px] rounded-[10px] border border-neutral-200 bg-white p-5">
          <SkeletonLine className="w-28" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[72px] rounded-xl border border-neutral-200 bg-neutral-50 p-3"
              >
                <SkeletonLine className="w-16" delay={`${item * 70}ms`} />
                <SkeletonLine
                  className="mt-3 w-20"
                  delay={`${item * 90}ms`}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="h-[220px] rounded-[10px] border border-neutral-200 bg-white p-5">
          <SkeletonLine className="w-24" />
          <div className="mt-4 space-y-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="flex gap-3">
                <span className="size-7 rounded-full bg-neutral-100" />
                <div className="flex-1 space-y-2">
                  <SkeletonLine className="w-3/4" delay={`${item * 80}ms`} />
                  <SkeletonLine className="w-12" delay={`${item * 100}ms`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="h-[180px] rounded-[10px] border border-neutral-200 bg-white p-5">
          <SkeletonLine className="w-20" />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[0, 1].map((item) => (
              <div
                key={item}
                className="h-[96px] rounded-xl border border-neutral-200 bg-neutral-50 p-3"
              >
                <SkeletonLine className="w-2/3" delay={`${item * 80}ms`} />
                <SkeletonLine className="mt-3 w-full" delay={`${item * 100}ms`} />
              </div>
            ))}
          </div>
        </div>
        <div className="h-[180px] rounded-[10px] border border-neutral-200 bg-white p-5">
          <SkeletonLine className="w-20" />
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((item) => (
              <SkeletonLine
                key={item}
                className="h-4 w-full"
                delay={`${item * 80}ms`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="h-[220px] rounded-[10px] border border-neutral-200 bg-white p-5"
          >
            <SkeletonLine className="w-24" delay={`${item * 60}ms`} />
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="h-[58px] rounded-xl border border-neutral-200 bg-neutral-50"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiSkeleton() {
  return (
    <div className="flex w-full max-w-[940px] flex-col gap-5">
      <div className="flex justify-center gap-2 overflow-hidden">
        <SkeletonLine className="h-8 w-36 rounded-lg" />
        <SkeletonLine className="h-8 w-48 rounded-lg" delay="80ms" />
        <SkeletonLine className="h-8 w-32 rounded-lg" delay="120ms" />
      </div>

      <div className="flex items-start gap-3">
        <div className="size-[34px] shrink-0 rounded-full bg-slate-200" />
        <div className="w-full max-w-[640px] rounded-xl border border-neutral-200 bg-white p-[18px]">
          <SkeletonLine className="w-full" />
          <SkeletonLine className="mt-3 w-4/5" delay="80ms" />
          <SkeletonLine className="mt-3 w-2/3" delay="120ms" />
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-full max-w-[470px] rounded-xl bg-neutral-100 p-[18px]">
          <SkeletonLine className="w-full bg-neutral-300" />
          <SkeletonLine className="mt-3 w-2/3 bg-neutral-300" delay="100ms" />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="size-[34px] shrink-0 rounded-full bg-slate-200" />
        <div className="w-full max-w-[710px] rounded-xl border border-neutral-200 bg-white p-[18px]">
          <SkeletonLine className="w-full" />
          <SkeletonLine className="mt-3 w-[86%]" delay="80ms" />
          <SkeletonLine className="mt-3 w-[78%]" delay="120ms" />
          <SkeletonLine className="mt-3 w-1/2" delay="160ms" />
        </div>
      </div>

      <div className="mt-3 h-[118px] rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.45)]">
        <SkeletonLine className="w-1/3" />
        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-2">
            <span className="size-8 rounded-lg bg-neutral-100" />
            <span className="size-8 rounded-lg bg-neutral-100" />
            <span className="h-8 w-28 rounded-full bg-neutral-100" />
          </div>
          <span className="h-8 w-20 rounded-full bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

export function HomeRouteLoading({ kind }: LoadingStateProps) {
  const isAi = kind === "ai";

  return (
    <section className="flex min-h-[calc(100vh-121px)] flex-col items-center bg-neutral-50 px-4 py-10 text-neutral-950 sm:px-8 lg:min-h-screen lg:px-10">
      {isAi ? (
        <div className="flex w-full max-w-[1180px] flex-col">
          <div className="flex min-h-[92px] items-center justify-between gap-6 border-b border-neutral-200 px-0 sm:px-9">
            <div>
              <h1 className="text-2xl font-extrabold leading-8 text-slate-950">
                AI 会话
              </h1>
              <p className="mt-1 text-[13px] font-medium leading-5 text-neutral-500">
                DeepSeek streaming · React / Next.js 学习助手
              </p>
            </div>
            <StatusPill label="DeepSeek connecting" />
          </div>
          <div className="flex flex-1 justify-center pt-8">
            <AiSkeleton />
          </div>
        </div>
      ) : (
        <div className="flex min-h-[720px] w-full items-start justify-center px-6 py-10 sm:px-8 lg:px-10">
          <HomeSkeleton />
        </div>
      )}
    </section>
  );
}

export function HomeRouteError({
  kind,
  digest,
  retryAction,
}: ErrorStateProps) {
  const isAi = kind === "ai";
  const Icon = isAi ? WifiOff : AlertTriangle;

  return (
    <section className="relative flex min-h-[calc(100vh-121px)] flex-col bg-neutral-50 px-4 py-8 text-neutral-950 sm:px-8 lg:min-h-screen lg:px-10">
      {isAi ? (
        <div className="mx-auto flex h-[72px] w-full max-w-[1180px] items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-extrabold leading-8 text-slate-950">
              AI 会话
            </h1>
            <p className="mt-1 text-[13px] font-medium leading-5 text-neutral-500">
              DeepSeek streaming · React / Next.js 学习助手
            </p>
          </div>
          <StatusPill label="Service interrupted" tone="error" />
        </div>
      ) : null}

      <div className="flex flex-1 items-center justify-center py-14">
        <div className="flex w-full max-w-[760px] flex-col items-center gap-5 text-center">
          <div className="flex size-[46px] items-center justify-center rounded-[10px] border border-neutral-200 bg-white shadow-[0_8px_18px_-16px_rgba(15,23,42,0.55)]">
            <Icon className="size-[22px] text-neutral-600" />
          </div>

          <div className="max-w-[560px]">
            <h1 className="text-2xl font-extrabold leading-8 text-slate-950">
              {isAi ? "会话没有正常打开" : "页面暂时加载失败"}
            </h1>
            <p className="mt-2.5 text-sm font-medium leading-6 text-neutral-500">
              可能是网络、登录状态或服务响应异常。你可以重试，或返回首页继续学习。
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-center">
            {retryAction}
            <Link
              href="/home"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-neutral-200 bg-white px-5 text-[13px] font-bold text-slate-950 transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
            >
              返回首页
            </Link>
          </div>

          <div className="mt-1 flex h-[42px] w-full max-w-[520px] items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-white px-3 text-xs">
            <span className="inline-flex items-center gap-2 font-bold text-neutral-500">
              <span className="size-1.5 rounded-full bg-red-600" />
              Error code
            </span>
            <span className="truncate font-mono font-semibold text-neutral-400">
              {digest || "Request failed"}
            </span>
          </div>
        </div>
      </div>

      <p className="pb-4 text-center text-xs font-semibold text-neutral-400">
        LingStack · 河北农业大学开发
      </p>
    </section>
  );
}

export function RetryButton({
  onClick,
  label = "重新加载",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-[13px] font-bold text-white transition-colors hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
    >
      <RefreshCw className="size-[15px]" />
      {label}
    </button>
  );
}
