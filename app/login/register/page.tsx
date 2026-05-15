import { Bot, Dot, Send, Sparkles } from "lucide-react";

import { RegisterForm } from "@/components/login/register-form";

const previewItems = [
  {
    title: "AI 流式会话",
    description: "围绕 React / Next.js 继续追问。",
  },
  {
    title: "学习记录",
    description: "保存会话和今日学习进度。",
  },
  {
    title: "少量目标",
    description: "只聚焦当前的一个练习。",
  },
];

const learningStats = [
  { label: "今日学习", value: "42 min" },
  { label: "下一步", value: "Prisma 写入" },
];

export default function RegisterPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-neutral-50 text-neutral-950">
      <section className="flex min-h-screen flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,580px)]">
        <section className="relative order-2 flex flex-col overflow-hidden bg-slate-50 px-6 py-8 sm:px-10 lg:order-1 lg:min-h-screen lg:px-16 lg:py-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:52px_52px] opacity-40"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-28 top-32 size-80 rounded-full bg-cyan-200/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 size-96 rounded-full bg-slate-300/50 blur-3xl"
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                  <div className="flex size-[38px] items-center justify-center rounded-[9px] bg-slate-950 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.8)]">
                    <Sparkles className="size-5 text-cyan-300" />
                  </div>
                  <p className="text-lg font-bold tracking-normal">
                    LingStack
                  </p>
                </div>

              <div className="hidden items-center gap-[7px] rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-500 shadow-sm sm:flex">
                <Dot className="size-4 fill-neutral-600 text-neutral-600" />
                MVP Learning Tool
              </div>
            </div>

            <div className="mt-12 w-full max-w-4xl lg:mt-12">
              <h1 className="max-w-4xl text-[38px] font-bold leading-[1.12] tracking-normal text-neutral-950">
                创建你的 AI 学习工作台
              </h1>
              <p className="mt-4 max-w-3xl text-[15px] leading-[1.55] text-neutral-500">
                先从最小可用版本开始：登录、AI 流式对话、会话保存、学习记录。
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-6 w-full rounded-xl border border-neutral-200 bg-white p-[18px] shadow-[0_18px_42px_-30px_rgba(15,23,42,0.14)]">
            <p className="text-sm font-bold">注册后你可以先做这些</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {previewItems.map((item) => (
                <div
                  key={item.title}
                  className="min-h-[92px] rounded-[9px] border border-neutral-200 bg-neutral-50 p-3.5"
                >
                  <p className="text-sm font-bold">{item.title}</p>
                  <p className="mt-1.5 text-xs leading-5 text-neutral-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-6 w-full rounded-[14px] border border-neutral-200 bg-white p-4 shadow-[0_20px_46px_-30px_rgba(15,23,42,0.14)]">
            <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                <span className="flex size-7 items-center justify-center rounded-md bg-slate-950 text-cyan-300">
                  <Bot className="size-4" />
                </span>
                LingStack 学习工作台
              </div>
              <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                <span className="size-1.5 animate-pulse rounded-full bg-cyan-600" />
                DeepSeek Streaming
              </div>
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(180px,240px)]">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-base font-semibold text-neutral-950">
                  Server Action 和 API Route 有什么区别？
                </p>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  Server Action 更适合页面内部 mutation；API Route 更适合 HTTP 边界和补充调用。
                </p>
                <div className="mt-4 rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-100">
                  <p className="text-slate-500">{"// app/actions.ts"}</p>
                  <p>
                    <span className="text-cyan-300">&apos;use server&apos;</span>
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  <span className="flex-1">
                    继续追问 React / Next.js 问题...
                  </span>
                  <Send className="size-4 text-neutral-400" />
                </div>
              </div>

              <aside className="grid gap-3">
                {learningStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border border-neutral-200 bg-white p-4"
                  >
                    <p className="text-xs text-neutral-500">{stat.label}</p>
                    <p className="mt-1 text-xl font-semibold text-neutral-950">
                      {stat.value}
                    </p>
                  </div>
                ))}
                <div className="rounded-lg border border-neutral-200 bg-neutral-100 p-4">
                  <p className="text-xs text-neutral-500">MVP 优先</p>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">
                    先做 AI 对话、会话保存、学习记录。
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <aside className="order-1 flex flex-col border-b border-neutral-200 bg-white px-6 py-8 sm:px-10 lg:order-2 lg:min-h-screen lg:max-w-[580px] lg:border-b-0 lg:border-l lg:px-16 lg:py-14">
          <div className="mx-auto flex w-full max-w-[360px] flex-col justify-center lg:flex-1">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-slate-950">
                <Sparkles className="size-4 text-cyan-300" />
              </div>
              <p className="text-base font-bold">LingStack</p>
            </div>

            <div className="mt-5">
              <h2 className="text-[30px] font-bold leading-[1.18] tracking-normal">
                立即注册
              </h2>
              <p className="mt-2 text-sm leading-[1.5] text-neutral-500">
                创建账号后开始保存你的 AI 学习会话。
              </p>
            </div>

            <RegisterForm />
          </div>

          <div className="mx-auto mt-8 flex h-16 w-full max-w-[520px] items-center justify-center gap-2 text-xs font-semibold text-neutral-400 lg:mt-0">
            <span className="h-px w-[88px] bg-neutral-200" />
            LingStack · 河北农业大学开发
            <span className="h-px w-[88px] bg-neutral-200" />
          </div>
        </aside>
      </section>
    </main>
  );
}
