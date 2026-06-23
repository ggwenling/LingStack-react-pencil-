import type {
  AiFrontendRanking,
  ResourceDocument,
  SkillPathCard,
} from "./resources-page-types";

export const RESOURCES_PAGE_TITLE = "资源库";

export const RESOURCES_PAGE_DESCRIPTION =
  "探索专业的开发文档与技能提升路径。这里汇总了最前沿的前端技术栈与 AI 辅助开发工具，助你构建高性能的数字产品。";

export const DOCUMENTS_PAGE_TITLE = "全部学习文档";

export const DOCUMENTS_PAGE_DESCRIPTION =
  "精选前端与全栈开发官方文档，涵盖框架、UI、状态管理、数据库与算法练习资源。";

const FEATURED_DOCUMENT_IDS = [
  "react-docs",
  "nextjs-guide",
  "tailwind-practices",
] as const;

export const ALL_RESOURCE_DOCUMENTS: ResourceDocument[] = [
  {
    id: "react-docs",
    title: "React 官方文档",
    description:
      "深入理解组件化思想，掌握最新的 React 18 并发特性与 Hooks 最佳实践。",
    hours: 12,
    level: "进阶",
    icon: "react",
    href: "https://zh-hans.react.dev/",
  },
  {
    id: "nextjs-guide",
    title: "Next.js 实战指南",
    description:
      "从路由系统到服务器组件（RSC），全方位解析生产级 Full-stack 框架开发流程。",
    hours: 18,
    level: "实战",
    icon: "next",
    href: "https://nextjscn.org/docs",
  },
  {
    id: "tailwind-practices",
    title: "Tailwind CSS 最佳实践",
    description:
      "掌握原子化 CSS 的工程化方案，构建响应式、高性能的现代化 UI 界面。",
    hours: 6,
    level: "入门",
    icon: "tailwind",
    href: "https://tailwindcss.com/docs",
  },
  {
    id: "react-learn",
    title: "React 官方教程",
    description:
      "从零开始学习 React 核心概念，通过互动示例掌握组件、状态与数据流。",
    hours: 8,
    level: "入门",
    icon: "react",
    href: "https://zh-hans.react.dev/learn",
  },
  {
    id: "nextjs-learn",
    title: "Next.js 互动教程",
    description:
      "跟随官方分步教程构建博客应用，实践 App Router 与数据获取模式。",
    hours: 10,
    level: "入门",
    icon: "next",
    href: "https://nextjs.org/learn",
  },
  {
    id: "mdn-react",
    title: "MDN React 入门",
    description:
      "Mozilla 开发者网络提供的 React 基础教程，适合配合官方文档系统学习。",
    hours: 6,
    level: "入门",
    icon: "mdn",
    href: "https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/Frameworks_libraries/React_getting_started",
  },
  {
    id: "shadcn",
    title: "shadcn/ui",
    description:
      "基于 Radix UI 与 Tailwind 的可复用组件库，支持复制粘贴式定制与主题扩展。",
    hours: 4,
    level: "进阶",
    icon: "shadcn",
    href: "https://ui.shadcn.com/",
  },
  {
    id: "antd",
    title: "Ant Design",
    description:
      "企业级 React UI 设计语言与组件库，覆盖表单、表格、布局等常见业务场景。",
    hours: 8,
    level: "进阶",
    icon: "antd",
    href: "https://ant.design/index-cn",
  },
  {
    id: "react-router",
    title: "React Router",
    description:
      "React 生态主流路由库，支持嵌套路由、数据加载与客户端导航模式。",
    hours: 5,
    level: "进阶",
    icon: "router",
    href: "https://reactrouter.com/",
  },
  {
    id: "redux",
    title: "Redux",
    description:
      "可预测的状态容器，适用于复杂应用的全局状态管理与调试工具链。",
    hours: 6,
    level: "进阶",
    icon: "redux",
    href: "https://redux.js.org/",
  },
  {
    id: "prisma",
    title: "Prisma",
    description:
      "下一代 Node.js 与 TypeScript ORM，提供类型安全的数据库访问与迁移工具。",
    hours: 8,
    level: "实战",
    icon: "prisma",
    href: "https://www.prisma.io/docs",
  },
  {
    id: "drizzle",
    title: "Drizzle ORM",
    description:
      "轻量 TypeScript ORM，强调 SQL 表达力与无运行时开销的类型推断体验。",
    hours: 6,
    level: "进阶",
    icon: "drizzle",
    href: "https://orm.drizzle.team/docs/overview",
  },
  {
    id: "postgres",
    title: "PostgreSQL",
    description:
      "开源关系型数据库官方文档，涵盖 SQL 语法、索引优化与高级特性。",
    hours: 10,
    level: "进阶",
    icon: "postgres",
    href: "https://www.postgresql.org/docs/",
  },
  {
    id: "leetcode",
    title: "力扣 LeetCode",
    description:
      "系统化算法与数据结构练习平台，助力面试准备与编程思维训练。",
    hours: 20,
    level: "实战",
    icon: "leetcode",
    href: "https://leetcode.cn/",
  },
];

export const RESOURCE_DOCUMENTS: ResourceDocument[] =
  ALL_RESOURCE_DOCUMENTS.filter((document) =>
    FEATURED_DOCUMENT_IDS.includes(
      document.id as (typeof FEATURED_DOCUMENT_IDS)[number],
    ),
  );

export const SKILL_PATH_CATALOG: Omit<SkillPathCard, "progress">[] = [
  {
    id: "react-fullstack",
    title: "React 全栈开发路径",
    description:
      "涵盖前端交互、后端服务与数据库集成的完整链条。通过 5 个实战项目磨炼全栈思维。",
    href: "/home/roadmap",
    variant: "featured",
    badge: "Popular",
    stats: [
      { label: "学员人数", value: "12,480+" },
      { label: "完成率", value: "64.2%" },
    ],
  },
  {
    id: "ai-assisted",
    title: "AI 辅助编程",
    description: "学习如何利用 Copilot 与 GPT 提升 3x 开发效率。",
    href: "/home/ai",
    variant: "compact",
  },
  {
    id: "uiux-design",
    title: "UI/UX 设计系统",
    description: "掌握 Figma 与前端组件库的无缝对接与设计交付。",
    href: "/home/help",
    variant: "compact",
  },
];

export const AI_FRONTEND_RANKINGS: AiFrontendRanking[] = [
  {
    rank: 1,
    name: "Claude Mythos 5",
    subtitle: "Anthropic",
    vendor: "claude",
    score: 99,
    ioCostUsd: "$10.00 / $50.00",
    status: "闭源",
  },
  {
    rank: 2,
    name: "Claude Fable 5",
    subtitle: "Anthropic",
    vendor: "claude",
    score: 95,
    ioCostUsd: "$10.00 / $50.00",
    status: "闭源",
  },
  {
    rank: 3,
    name: "Claude Opus 4.8",
    subtitle: "Anthropic",
    vendor: "claude",
    score: 93,
    ioCostUsd: "$5.00 / $25.00",
    status: "闭源",
  },
  {
    rank: 4,
    name: "GLM-5.2",
    subtitle: "Z.AI",
    vendor: "glm",
    score: 91,
    ioCostUsd: "$1.40 / $4.40",
    status: "开源",
  },
  {
    rank: 5,
    name: "Qwen3.7 Max",
    subtitle: "Alibaba",
    vendor: "qwen",
    score: 90,
    ioCostUsd: "N/A",
    status: "闭源",
  },
];
