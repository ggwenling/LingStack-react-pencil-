import type { HomeDashboardView, RoadmapStatus } from "./home-dashboard-types";

export const DEFAULT_ROADMAP_STEPS: HomeDashboardView["roadmap"] = [
  { title: "基础语法", percent: 0, status: "pending" },
  { title: "组件与状态管理", percent: 0, status: "pending" },
  { title: "路由与数据获取", percent: 0, status: "pending" },
  { title: "进阶与优化", percent: 0, status: "pending" },
  { title: "实战项目", percent: 0, status: "pending" },
];

const STAGE_KEYWORDS: Array<{
  title: string;
  keywords: string[];
}> = [
  { title: "基础语法", keywords: ["jsx", "语法", "props", "hook", "usestate"] },
  {
    title: "组件与状态管理",
    keywords: ["组件", "状态", "state", "context", "reducer", "生命周期"],
  },
  {
    title: "路由与数据获取",
    keywords: ["路由", "router", "fetch", "prisma", "server action", "数据"],
  },
  {
    title: "进阶与优化",
    keywords: ["优化", "性能", "缓存", "memo", "suspense", "streaming"],
  },
  {
    title: "实战项目",
    keywords: ["项目", "实战", "部署", "auth", "全栈"],
  },
];

const REACT_KEYWORDS = ["react", "jsx", "hook", "组件", "props", "usestate"];
const NEXT_KEYWORDS = ["next", "app router", "route handler", "server action"];

export function matchesKeywords(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();

  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function countMatchedStages(
  topics: string[],
  upToIndex: number,
) {
  let matched = 0;

  for (let index = 0; index <= upToIndex; index += 1) {
    const stage = STAGE_KEYWORDS[index];
    const hit = topics.some((topic) => matchesKeywords(topic, stage.keywords));

    if (hit) {
      matched += 1;
    }
  }

  return matched;
}

export function inferRoadmapFromTopics(
  masteredTopics: string[],
  weakTopics: string[],
  currentTopic: string,
): HomeDashboardView["roadmap"] {
  const allTopics = [...masteredTopics, ...weakTopics, currentTopic];
  let activeIndex = 0;

  for (let index = 0; index < STAGE_KEYWORDS.length; index += 1) {
    const masteredCount = countMatchedStages(masteredTopics, index);
    const touched = allTopics.some((topic) =>
      matchesKeywords(topic, STAGE_KEYWORDS[index].keywords),
    );

    if (touched) {
      activeIndex = index;
    }

    if (masteredCount >= index + 1) {
      activeIndex = Math.min(index + 1, STAGE_KEYWORDS.length - 1);
    }
  }

  return DEFAULT_ROADMAP_STEPS.map((step, index) => {
    const masteredCount = countMatchedStages(masteredTopics, index);
    const touched = allTopics.some((topic) =>
      matchesKeywords(topic, STAGE_KEYWORDS[index].keywords),
    );

    let status: RoadmapStatus = "pending";
    let percent = 0;

    if (masteredCount >= index + 1) {
      status = "done";
      percent = 100;
    } else if (index === activeIndex && touched) {
      status = "active";
      percent = Math.min(
        90,
        Math.max(10, Math.round((masteredTopics.length / 8) * 100)),
      );
    } else if (index < activeIndex) {
      status = "done";
      percent = 100;
    }

    return {
      title: step.title,
      percent,
      status,
    };
  });
}

export function buildTimelineFromRoadmap(
  roadmap: HomeDashboardView["roadmap"],
  startedAt: Date | null,
): HomeDashboardView["overview"]["timeline"] {
  const startLabel = startedAt
    ? `${String(startedAt.getMonth() + 1).padStart(2, "0")}/${String(startedAt.getDate()).padStart(2, "0")}`
    : undefined;

  return [
    { label: "起点", percent: 0, date: startLabel },
    ...roadmap.map((step) => ({
      label: step.title.replace("管理", "").replace("获取", ""),
      percent: step.percent,
    })),
  ];
}

export function inferTagFromTitle(title: string) {
  if (matchesKeywords(title, NEXT_KEYWORDS)) {
    return "Next.js";
  }

  if (matchesKeywords(title, REACT_KEYWORDS)) {
    return "React";
  }

  return "学习";
}
