import { BookOpenCheck, ChevronRight, Dot, Send, Sparkles } from "lucide-react";

import { LoginForm } from "./login-form";

const techTags = ["React", "Next.js", "TypeScript", "Prisma", "Server Action"];
const learningStats = [
  { label: "今日学习", value: "42 min" },
  { label: "已完成", value: "8 个知识点" },
];

export default function LoginPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-neutral-50 text-neutral-950">
      <section className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_440px] xl:grid-cols-[minmax(0,1fr)_480px]">
        <section className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-slate-50 px-6 py-8 sm:px-10 lg:px-14 xl:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:52px_52px] opacity-40"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-white/80 to-transparent"
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-slate-950 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.8)]">
                  <Sparkles className="size-5 text-cyan-300" />
                </div>
                <p className="text-xl font-semibold tracking-normal">
                  LingStack
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 sm:flex">
                <Dot className="size-4 fill-cyan-600 text-cyan-600" />
                AI Learning Workspace
              </div>
            </div>

            <div className="mt-12 max-w-4xl lg:mt-16">
              <h1 className="max-w-4xl text-4xl font-semibold leading-[1.08] tracking-normal text-neutral-950 sm:text-5xl xl:text-[58px]">
                用 AI 系统学习 React 与 Next.js
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-500">
                通过流式对话、代码讲解、项目拆解和错误分析，把零散知识变成可执行的学习路径。
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {techTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-10 rounded-xl border border-neutral-200 bg-white/95 p-4 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.55)] backdrop-blur sm:p-5 lg:mt-12">
            <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                <BookOpenCheck className="size-4 text-neutral-500" />
                当前学习路径
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                <span>React</span>
                <ChevronRight className="size-4 text-neutral-400" />
                <span>Next.js</span>
                <ChevronRight className="size-4 text-neutral-400" />
                <span className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">
                  Server Action
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_250px]">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-neutral-500">
                      正在回答
                    </p>
                    <h2 className="mt-2 text-base font-semibold text-neutral-950">
                      Server Action 和 API Route 有什么区别？
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                    <span className="size-1.5 animate-pulse rounded-full bg-cyan-600" />
                    Streaming
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-4">
                  <p className="text-sm leading-6 text-neutral-700">
                    可以先按使用边界来区分：Server Action 更偏页面内部的服务端操作，
                    API Route 更像对外暴露的 HTTP 接口。
                  </p>
                  <ol className="mt-4 space-y-2 text-sm leading-6 text-neutral-600">
                    <li>1. 表单提交、数据库写入、权限校验：优先 Server Action。</li>
                    <li>2. Webhook、第三方系统、移动端复用：优先 API Route。</li>
                  </ol>

                  <div className="mt-4 rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-100">
                    <p className="text-slate-500">{"// app/actions.ts"}</p>
                    <p>
                      <span className="text-cyan-300">&apos;use server&apos;</span>{" "}
                      <span className="text-slate-500">
                        {"// 与表单和数据库操作同层协作"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
                  <span className="flex-1">继续追问 React / Next.js 问题...</span>
                  <Send className="size-4 text-neutral-400" />
                </div>
              </div>

              <aside className="rounded-lg border border-neutral-200 bg-white p-4">
                <p className="text-sm font-bold">当前学习进度</p>
                <div className="mt-4 space-y-4">
                  {learningStats.map((stat) => (
                    <div key={stat.label} className="border-b border-neutral-100 pb-3">
                      <p className="text-xs text-neutral-500">{stat.label}</p>
                      <p className="mt-1 text-xl font-semibold text-neutral-950">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                  <div className="rounded-lg border border-neutral-200 bg-neutral-100 p-3">
                    <p className="text-xs text-neutral-500">当前主题</p>
                    <p className="mt-1 text-sm font-semibold">Server Action</p>
                  </div>
                  <div className="rounded-lg border border-neutral-200 bg-white p-3">
                    <p className="text-xs text-neutral-500">下一个练习</p>
                    <p className="mt-1 text-sm font-semibold">表单校验</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <aside className="flex min-h-screen flex-col border-t border-neutral-200 bg-white px-6 py-8 sm:px-10 lg:border-l lg:border-t-0 lg:px-11">
          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-slate-950">
                <Sparkles className="size-4 text-cyan-300" />
              </div>
              <p className="text-base font-semibold">LingStack</p>
            </div>

            <div className="mt-7">
              <h2 className="text-3xl font-semibold tracking-normal">登录账号</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                登录后继续你的 React + Next.js 学习进度
              </p>
            </div>

            <LoginForm />
          </div>

          <nav className="mx-auto flex w-full max-w-sm justify-center gap-5 text-xs font-medium text-neutral-500">
            <a href="#" className="transition-colors hover:text-neutral-900">
              接入文档
            </a>
            <a href="#" className="transition-colors hover:text-neutral-900">
              服务状态
            </a>
            <a href="#" className="transition-colors hover:text-neutral-900">
              套餐说明
            </a>
          </nav>
        </aside>
      </section>
    </main>
  );
}
