export type RoadmapCatalogLesson = {
  lessonKey: string;
  title: string;
  hours: number;
  keywords: string[];
  exerciseTemplateIds: string[];
};

export type RoadmapCatalogStage = {
  stageKey: string;
  curriculumTitle: string;
  displayTitle: string;
  estimatedTotalHours: number;
  modules?: Array<{ label: string; title: string }>;
  lessons?: RoadmapCatalogLesson[];
  unlockHint?: string;
  tags?: string[];
};

export const ROADMAP_PAGE_TITLE = "React 全栈开发路径";

export const ROADMAP_PAGE_DESCRIPTION =
  "本路线图通过 5 个关键阶段引导您从零开始掌握 React 生态系统。基于 AI 驱动的动态调整，确保您的学习路径始终保持最优效率。";

export const MVP_STAGE_KEY = "react-components-state";

export const ROADMAP_CATALOG: RoadmapCatalogStage[] = [
  {
    stageKey: "js-basics",
    curriculumTitle: "基础语法",
    displayTitle: "JavaScript 与基础语法",
    estimatedTotalHours: 28,
    modules: [
      { label: "模块 A", title: "ES6+ 核心特性" },
      { label: "模块 B", title: "异步编程模型" },
      { label: "模块 C", title: "DOM 操作基础" },
    ],
  },
  {
    stageKey: MVP_STAGE_KEY,
    curriculumTitle: "组件与状态管理",
    displayTitle: "React 核心组件与状态",
    estimatedTotalHours: 32,
    lessons: [
      {
        lessonKey: "jsx-rendering",
        title: "JSX 语法与渲染逻辑",
        hours: 3.5,
        keywords: ["jsx", "渲染", "语法", "props"],
        exerciseTemplateIds: ["jsx-basics-render"],
      },
      {
        lessonKey: "hooks-effect-context",
        title: "Hooks 进阶: useEffect & useContext",
        hours: 4,
        keywords: ["useeffect", "usecontext", "hook", "context", "effect"],
        exerciseTemplateIds: ["hooks-effect-cleanup"],
      },
      {
        lessonKey: "perf-memo-callback",
        title: "性能优化：useMemo & useCallback",
        hours: 4.2,
        keywords: ["usememo", "usecallback", "memo", "性能", "优化"],
        exerciseTemplateIds: ["perf-memo-callback"],
      },
    ],
  },
  {
    stageKey: "routing-data-fetching",
    curriculumTitle: "路由与数据获取",
    displayTitle: "路由、数据获取与 SSR",
    estimatedTotalHours: 36,
    unlockHint:
      "完成「React 核心组件与状态」阶段后自动解锁。本阶段将深入探讨 Next.js 14 的 App Router、服务端组件以及全栈数据获取模式。",
    tags: ["Next.js 14", "Routing", "API Routes"],
    lessons: [
      {
        lessonKey: "app-router-page",
        title: "App Router 页面与布局",
        hours: 4,
        keywords: ["app router", "layout", "page", "next"],
        exerciseTemplateIds: ["next-app-router-page"],
      },
      {
        lessonKey: "server-component-fetch",
        title: "Server Component 数据获取",
        hours: 4.5,
        keywords: ["server component", "fetch", "async", "ssr"],
        exerciseTemplateIds: ["server-component-fetch"],
      },
      {
        lessonKey: "route-handler-api",
        title: "Route Handler API",
        hours: 4,
        keywords: ["route handler", "api", "nextresponse"],
        exerciseTemplateIds: ["route-handler-api"],
      },
    ],
  },
  {
    stageKey: "advanced-optimization",
    curriculumTitle: "进阶与优化",
    displayTitle: "进阶与性能优化",
    estimatedTotalHours: 40,
    unlockHint:
      "完成路由与数据获取阶段后解锁。涵盖 Suspense、Streaming、缓存策略与生产级性能调优。",
    tags: ["Suspense", "Streaming", "Caching"],
    lessons: [
      {
        lessonKey: "suspense-streaming",
        title: "Suspense 与 Streaming",
        hours: 4,
        keywords: ["suspense", "streaming", "fallback"],
        exerciseTemplateIds: ["suspense-boundary"],
      },
      {
        lessonKey: "cache-revalidation",
        title: "缓存与重新验证",
        hours: 4.2,
        keywords: ["cache", "revalidate", "unstable_cache"],
        exerciseTemplateIds: ["cache-revalidation"],
      },
    ],
  },
  {
    stageKey: "fullstack-project",
    curriculumTitle: "实战项目",
    displayTitle: "全栈实战：构建 SaaS 平台",
    estimatedTotalHours: 50,
    unlockHint:
      "综合运用所学知识，从零开始构建一个具备生产力的 SaaS 平台。核心涵盖多租户架构、数据库集成、权限管理与自动化部署。",
    tags: ["Deployment", "Database", "Auth"],
    lessons: [
      {
        lessonKey: "saas-auth-middleware",
        title: "鉴权中间件与路由保护",
        hours: 5,
        keywords: ["middleware", "auth", "redirect", "session"],
        exerciseTemplateIds: ["saas-auth-middleware"],
      },
      {
        lessonKey: "project-health-api",
        title: "项目健康检查 API",
        hours: 4.5,
        keywords: ["health", "api", "prisma", "database"],
        exerciseTemplateIds: ["project-health-api"],
      },
    ],
  },
];

export function getCatalogTotalHours() {
  return ROADMAP_CATALOG.reduce(
    (sum, stage) => sum + stage.estimatedTotalHours,
    0,
  );
}
