import { ArrowLeftRight, Terminal, Zap } from "lucide-react";

import { LOGIN_SYSTEM_VERSION } from "@/lib/login/login-content";

const taskSkeletonRows = [
  { primary: "w-[72%]", secondary: "w-[48%]", completed: true },
  { primary: "w-[64%]", secondary: "w-[40%]", completed: false },
  { primary: "w-[56%]", secondary: "w-[36%]", completed: false },
] as const;

const progressBars = [
  { height: 38, className: "bg-neutral-200" },
  { height: 52, className: "bg-neutral-300" },
  { height: 42, className: "bg-neutral-200" },
  { height: 88, className: "bg-neutral-950" },
  { height: 58, className: "bg-neutral-300" },
] as const;

function WindowChrome() {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-full border border-neutral-300 bg-transparent" />
        <span className="size-2.5 rounded-full border border-neutral-300 bg-transparent" />
        <span className="size-2.5 rounded-full border border-neutral-300 bg-transparent" />
      </div>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <span className="h-1.5 w-8 rounded-full bg-neutral-200" />
        <span className="h-1.5 w-10 rounded-full bg-neutral-200" />
        <span className="h-1.5 w-6 rounded-full bg-neutral-200" />
      </div>
    </div>
  );
}

function TasksCard() {
  return (
    <article className="rounded-xl bg-neutral-100 p-4">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
        Today&apos;s Tasks
      </p>
      <ul className="mt-3 space-y-3">
        {taskSkeletonRows.map((row, index) => (
          <li key={index} className="flex items-start gap-2.5">
            <span
              className={
                row.completed
                  ? "mt-0.5 size-2.5 shrink-0 rounded-full bg-neutral-950"
                  : "mt-0.5 size-2.5 shrink-0 rounded-full border border-neutral-300 bg-white"
              }
            />
            <div className="min-w-0 flex-1 space-y-1.5 pt-0.5">
              <span
                className={`block h-1.5 rounded-full bg-neutral-200 ${row.primary}`}
              />
              <span
                className={`block h-1.5 rounded-full bg-neutral-200/80 ${row.secondary}`}
              />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ProgressCard() {
  return (
    <article className="rounded-xl bg-neutral-100 p-4">
      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
        Progress
      </p>
      <div className="mt-4 flex h-16 items-end gap-1.5">
        {progressBars.map((bar, index) => (
          <span
            key={index}
            className={`flex-1 rounded-sm ${bar.className}`}
            style={{ height: `${bar.height}%` }}
          />
        ))}
      </div>
    </article>
  );
}

function AiAssistantCard() {
  return (
    <article className="h-full rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <Zap className="size-3.5 text-neutral-500" />
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-500">
          AI Assistant
        </p>
      </div>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-neutral-50 p-3 font-mono text-[11px] leading-5 text-neutral-800">
        <code>
          <span className="font-semibold text-neutral-950">export default function</span>{" "}
          NextApp() {"{"}
          {"\n  "}
          <span className="font-semibold text-neutral-950">return</span> (
          {"\n    "}
          &lt;div className=
          <span className="text-amber-800 opacity-75">&quot;focus-mode&quot;</span>
          &gt;
          {"\n      "}
          &lt;Header title=
          <span className="text-amber-800 opacity-75">&quot;Deep Learning&quot;</span>
          {" />"}
          {"\n      "}
          &lt;Workspace&gt;
          {"\n        "}
          <span className="text-neutral-400">
            {"{ /* AI Assistant analyzing... */ }"}
          </span>
          {"\n      "}
          &lt;/Workspace&gt;
          {"\n    "}
          &lt;/div&gt;
          {"\n  "});
          {"\n}"}
        </code>
      </pre>
    </article>
  );
}

export function LoginProductPreview() {
  return (
    <div className="mt-8">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.22)]">
        <WindowChrome />
        <div className="grid min-h-[240px] gap-4 p-4 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-3">
            <TasksCard />
            <ProgressCard />
          </div>
          <AiAssistantCard />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400">
          System Version: {LOGIN_SYSTEM_VERSION}
        </p>
        <div className="flex items-center gap-3 text-neutral-300" aria-hidden="true">
          <Terminal className="size-3.5" />
          <ArrowLeftRight className="size-3.5" />
        </div>
      </div>
    </div>
  );
}
