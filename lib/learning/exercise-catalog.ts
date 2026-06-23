export type StaticCheckId =
  | "contains-array-map"
  | "jsx-list-has-key"
  | "references-skill-name"
  | "references-skill-level"
  | "has-empty-state-branch"
  | "contains-use-effect"
  | "contains-set-interval"
  | "has-effect-cleanup-return"
  | "contains-clear-interval"
  | "contains-use-memo"
  | "contains-use-callback"
  | "contains-react-memo"
  | "contains-export-default"
  | "contains-async-await"
  | "contains-next-response"
  | "contains-suspense"
  | "contains-revalidate"
  | "contains-middleware"
  | "contains-database-query";

export type ExerciseRubricItem = {
  id: string;
  label: string;
  weight: number;
  required: boolean;
  staticCheck?: StaticCheckId;
  aiOnly?: boolean;
};

export type ExerciseTemplate = {
  id: string;
  lessonKey: string;
  version: number;
  title: string;
  description: string;
  starterCode: string;
  requirements: string[];
  rubric: ExerciseRubricItem[];
  passScore: number;
  requiredCriteriaIds: string[];
};

export const EXERCISE_TEMPLATES: ExerciseTemplate[] = [
  {
    id: "jsx-basics-render",
    lessonKey: "jsx-rendering",
    version: 1,
    title: "用 JSX 渲染列表",
    description: "实现 SkillList 组件，接收 skills 数组并渲染学习技能列表。",
    starterCode: `type Skill = {
  id: string;
  name: string;
  level: "beginner" | "intermediate" | "advanced";
};

type SkillListProps = {
  skills: Skill[];
};

export function SkillList({ skills }: SkillListProps) {
  return (
    <section>
      {/* 在这里渲染技能列表 */}
    </section>
  );
}`,
    requirements: [
      "必须使用 skills.map(...) 渲染列表。",
      "每个列表项必须有稳定 key，优先使用 skill.id。",
      "必须展示 skill.name。",
      "必须根据 skill.level 展示不同文本或 className。",
      "空数组时要展示空状态文案。",
    ],
    rubric: [
      {
        id: "uses-map",
        label: "使用 map 渲染列表",
        weight: 25,
        required: true,
        staticCheck: "contains-array-map",
      },
      {
        id: "has-key",
        label: "列表项有 key",
        weight: 25,
        required: true,
        staticCheck: "jsx-list-has-key",
      },
      {
        id: "renders-name",
        label: "展示技能名称",
        weight: 20,
        required: true,
        staticCheck: "references-skill-name",
      },
      {
        id: "handles-level",
        label: "处理 level 展示",
        weight: 15,
        required: false,
        staticCheck: "references-skill-level",
      },
      {
        id: "handles-empty",
        label: "处理空状态",
        weight: 15,
        required: false,
        staticCheck: "has-empty-state-branch",
      },
    ],
    passScore: 70,
    requiredCriteriaIds: ["uses-map", "has-key", "renders-name"],
  },
  {
    id: "hooks-effect-cleanup",
    lessonKey: "hooks-effect-context",
    version: 1,
    title: "useEffect 清理函数",
    description:
      "实现 SessionTimer 组件，每秒递增学习时长，并在组件卸载时清除定时器。",
    starterCode: `import { useEffect, useState } from "react";

export function SessionTimer() {
  const [seconds, setSeconds] = useState(0);

  return (
    <div>
      已学习 {seconds} 秒
    </div>
  );
}`,
    requirements: [
      "必须使用 useEffect 创建定时器。",
      "必须使用 setInterval 或等价定时机制每秒更新一次。",
      "必须在 useEffect 中 return 清理函数。",
      "清理函数必须调用 clearInterval 或等价清理逻辑。",
      "依赖数组不能导致重复创建无限定时器。",
    ],
    rubric: [
      {
        id: "uses-effect",
        label: "使用 useEffect",
        weight: 25,
        required: true,
        staticCheck: "contains-use-effect",
      },
      {
        id: "creates-interval",
        label: "创建定时器",
        weight: 20,
        required: true,
        staticCheck: "contains-set-interval",
      },
      {
        id: "has-cleanup",
        label: "返回清理函数",
        weight: 30,
        required: true,
        staticCheck: "has-effect-cleanup-return",
      },
      {
        id: "clears-interval",
        label: "清除定时器",
        weight: 15,
        required: true,
        staticCheck: "contains-clear-interval",
      },
      {
        id: "reasonable-deps",
        label: "依赖数组合理",
        weight: 10,
        required: false,
        aiOnly: true,
      },
    ],
    passScore: 75,
    requiredCriteriaIds: [
      "uses-effect",
      "creates-interval",
      "has-cleanup",
      "clears-interval",
    ],
  },
  {
    id: "perf-memo-callback",
    lessonKey: "perf-memo-callback",
    version: 1,
    title: "用 memo 优化子组件",
    description:
      "优化 LearningDashboard，避免每次输入搜索词时都重新计算昂贵统计，并减少子组件无意义重渲染。",
    starterCode: `import { useState } from "react";

type Lesson = {
  id: string;
  title: string;
  minutes: number;
  completed: boolean;
};

function ProgressSummary({
  completedCount,
  totalMinutes,
  onReset,
}: {
  completedCount: number;
  totalMinutes: number;
  onReset: () => void;
}) {
  return (
    <section>
      <p>已完成 {completedCount} 节</p>
      <p>累计 {totalMinutes} 分钟</p>
      <button onClick={onReset}>重置</button>
    </section>
  );
}

export function LearningDashboard({ lessons }: { lessons: Lesson[] }) {
  const [query, setQuery] = useState("");

  const completedCount = lessons.filter((lesson) => lesson.completed).length;
  const totalMinutes = lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);

  function handleReset() {
    setQuery("");
  }

  const visibleLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <ProgressSummary
        completedCount={completedCount}
        totalMinutes={totalMinutes}
        onReset={handleReset}
      />
      <ul>
        {visibleLessons.map((lesson) => (
          <li key={lesson.id}>{lesson.title}</li>
        ))}
      </ul>
    </div>
  );
}`,
    requirements: [
      "必须用 useMemo 缓存 completedCount 或统计对象。",
      "必须用 useMemo 缓存 totalMinutes 或统计对象。",
      "必须用 useCallback 缓存传给子组件的 onReset。",
      "ProgressSummary 应使用 memo 包裹或等价方式减少重渲染。",
      "依赖数组必须包含正确依赖，不能为了通过检查写空数组。",
    ],
    rubric: [
      {
        id: "uses-usememo",
        label: "使用 useMemo 缓存统计",
        weight: 30,
        required: true,
        staticCheck: "contains-use-memo",
      },
      {
        id: "uses-usecallback",
        label: "使用 useCallback 缓存回调",
        weight: 25,
        required: true,
        staticCheck: "contains-use-callback",
      },
      {
        id: "memoizes-child",
        label: "子组件 memo 化",
        weight: 20,
        required: false,
        staticCheck: "contains-react-memo",
      },
      {
        id: "correct-deps",
        label: "依赖数组合理",
        weight: 20,
        required: true,
        aiOnly: true,
      },
      {
        id: "keeps-behavior",
        label: "保持搜索和重置行为",
        weight: 5,
        required: false,
        aiOnly: true,
      },
    ],
    passScore: 75,
    requiredCriteriaIds: ["uses-usememo", "uses-usecallback", "correct-deps"],
  },
  {
    id: "next-app-router-page",
    lessonKey: "app-router-page",
    version: 1,
    title: "创建 App Router 页面",
    description: "实现一个默认导出的页面组件，展示欢迎标题。",
    starterCode: `export default function WelcomePage() {
  return (
    <main>
      {/* 在这里渲染欢迎标题 */}
    </main>
  );
}`,
    requirements: [
      "必须使用 export default 导出页面组件。",
      "必须返回包含欢迎文案的 JSX。",
    ],
    rubric: [
      {
        id: "default-export",
        label: "默认导出页面组件",
        weight: 50,
        required: true,
        staticCheck: "contains-export-default",
      },
      {
        id: "renders-content",
        label: "渲染页面内容",
        weight: 50,
        required: true,
        aiOnly: true,
      },
    ],
    passScore: 70,
    requiredCriteriaIds: ["default-export", "renders-content"],
  },
  {
    id: "server-component-fetch",
    lessonKey: "server-component-fetch",
    version: 1,
    title: "Server Component 异步获取",
    description: "实现异步 Server Component，使用 fetch 获取数据并渲染。",
    starterCode: `type Course = {
  id: string;
  title: string;
};

async function getCourses(): Promise<Course[]> {
  const response = await fetch("https://example.com/api/courses");
  return response.json();
}

export default async function CourseListPage() {
  return (
    <section>
      {/* 在这里获取并渲染课程列表 */}
    </section>
  );
}`,
    requirements: [
      "页面组件必须是 async function。",
      "必须使用 await fetch 获取数据。",
      "必须渲染课程标题列表。",
    ],
    rubric: [
      {
        id: "async-component",
        label: "异步组件",
        weight: 40,
        required: true,
        staticCheck: "contains-async-await",
      },
      {
        id: "uses-fetch",
        label: "使用 fetch 获取数据",
        weight: 30,
        required: true,
        aiOnly: true,
      },
      {
        id: "renders-list",
        label: "渲染列表",
        weight: 30,
        required: true,
        aiOnly: true,
      },
    ],
    passScore: 70,
    requiredCriteriaIds: ["async-component", "uses-fetch"],
  },
  {
    id: "route-handler-api",
    lessonKey: "route-handler-api",
    version: 1,
    title: "Route Handler GET API",
    description: "实现 GET 路由处理器，返回 JSON 健康检查响应。",
    starterCode: `import { NextResponse } from "next/server";

export async function GET() {
  // 返回 { ok: true, service: "lingstack" }
}`,
    requirements: [
      "必须导出 async function GET。",
      "必须使用 NextResponse.json 返回 JSON。",
      "响应体必须包含 ok: true。",
    ],
    rubric: [
      {
        id: "exports-get",
        label: "导出 GET 处理器",
        weight: 40,
        required: true,
        aiOnly: true,
      },
      {
        id: "uses-next-response",
        label: "使用 NextResponse",
        weight: 30,
        required: true,
        staticCheck: "contains-next-response",
      },
      {
        id: "returns-ok",
        label: "返回 ok 字段",
        weight: 30,
        required: true,
        aiOnly: true,
      },
    ],
    passScore: 70,
    requiredCriteriaIds: ["exports-get", "uses-next-response"],
  },
  {
    id: "suspense-boundary",
    lessonKey: "suspense-streaming",
    version: 1,
    title: "Suspense 边界",
    description: "用 Suspense 包裹异步子组件并提供 fallback。",
    starterCode: `import { Suspense } from "react";

function SlowStats() {
  return <div>统计加载中...</div>;
}

export function DashboardPanel() {
  return (
    <section>
      {/* 用 Suspense 包裹 SlowStats */}
    </section>
  );
}`,
    requirements: [
      "必须使用 Suspense 组件。",
      "必须提供 fallback 属性。",
      "必须包裹异步或慢速子组件。",
    ],
    rubric: [
      {
        id: "uses-suspense",
        label: "使用 Suspense",
        weight: 50,
        required: true,
        staticCheck: "contains-suspense",
      },
      {
        id: "has-fallback",
        label: "提供 fallback",
        weight: 50,
        required: true,
        aiOnly: true,
      },
    ],
    passScore: 70,
    requiredCriteriaIds: ["uses-suspense", "has-fallback"],
  },
  {
    id: "cache-revalidation",
    lessonKey: "cache-revalidation",
    version: 1,
    title: "缓存重新验证",
    description: "在数据获取中配置 revalidate 选项。",
    starterCode: `export async function getDashboardStats() {
  const response = await fetch("https://example.com/api/stats");
  return response.json();
}`,
    requirements: [
      "fetch 调用必须包含 next.revalidate 或 revalidate 配置。",
      "必须保持 async/await 数据获取结构。",
    ],
    rubric: [
      {
        id: "async-fetch",
        label: "异步获取",
        weight: 40,
        required: true,
        staticCheck: "contains-async-await",
      },
      {
        id: "uses-revalidate",
        label: "配置 revalidate",
        weight: 60,
        required: true,
        staticCheck: "contains-revalidate",
      },
    ],
    passScore: 70,
    requiredCriteriaIds: ["async-fetch", "uses-revalidate"],
  },
  {
    id: "saas-auth-middleware",
    lessonKey: "saas-auth-middleware",
    version: 1,
    title: "鉴权中间件",
    description: "实现 middleware，对未登录用户重定向到 /login。",
    starterCode: `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  // 未登录时重定向到 /login
}`,
    requirements: [
      "必须导出 middleware 函数。",
      "未登录时必须返回 NextResponse.redirect。",
      "重定向目标为 /login。",
    ],
    rubric: [
      {
        id: "exports-middleware",
        label: "导出 middleware",
        weight: 40,
        required: true,
        staticCheck: "contains-middleware",
      },
      {
        id: "redirects-unauth",
        label: "未登录重定向",
        weight: 60,
        required: true,
        aiOnly: true,
      },
    ],
    passScore: 70,
    requiredCriteriaIds: ["exports-middleware", "redirects-unauth"],
  },
  {
    id: "project-health-api",
    lessonKey: "project-health-api",
    version: 1,
    title: "健康检查 API",
    description: "实现带数据库探测的健康检查路由。",
    starterCode: `import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  // 查询数据库并返回健康状态
}`,
    requirements: [
      "必须导出 GET 处理器。",
      "必须使用 prisma 执行数据库查询。",
      "必须返回 NextResponse.json。",
    ],
    rubric: [
      {
        id: "uses-prisma",
        label: "使用 Prisma 查询",
        weight: 40,
        required: true,
        staticCheck: "contains-database-query",
      },
      {
        id: "uses-next-response",
        label: "返回 JSON 响应",
        weight: 30,
        required: true,
        staticCheck: "contains-next-response",
      },
      {
        id: "health-shape",
        label: "健康检查结构合理",
        weight: 30,
        required: true,
        aiOnly: true,
      },
    ],
    passScore: 70,
    requiredCriteriaIds: ["uses-prisma", "uses-next-response"],
  },
];

export function getExerciseTemplate(templateId: string) {
  return EXERCISE_TEMPLATES.find((template) => template.id === templateId);
}

export function getTemplatesForLesson(lessonKey: string) {
  return EXERCISE_TEMPLATES.filter(
    (template) => template.lessonKey === lessonKey,
  );
}
