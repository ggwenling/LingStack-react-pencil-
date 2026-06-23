export type ResourceDocument = {
  id: string;
  title: string;
  description: string;
  hours: number;
  level: "入门" | "进阶" | "实战";
  icon:
    | "react"
    | "next"
    | "tailwind"
    | "shadcn"
    | "antd"
    | "router"
    | "redux"
    | "prisma"
    | "drizzle"
    | "postgres"
    | "leetcode"
    | "mdn";
  href: string;
};

export type SkillPathCard = {
  id: string;
  title: string;
  description: string;
  href: string;
  variant: "featured" | "compact";
  badge?: string;
  stats?: { label: string; value: string }[];
  progress?: number;
};

export type AiVendorIcon = "claude" | "qwen" | "glm";

export type AiFrontendRanking = {
  rank: number;
  name: string;
  subtitle: string;
  vendor: AiVendorIcon;
  score: number;
  ioCostUsd: string;
  status: string;
};

export type ResourcesPageView = {
  title: string;
  description: string;
  documents: ResourceDocument[];
  paths: SkillPathCard[];
  rankings: AiFrontendRanking[];
};
