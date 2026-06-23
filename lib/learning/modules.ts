export type LearningModuleId = "react" | "next";

export const LEARNING_MODULES: Array<{
  id: LearningModuleId;
  label: string;
  defaultTitle: string;
  prismaValue: "REACT" | "NEXT";
}> = [
  {
    id: "react",
    label: "React 学习",
    defaultTitle: "新的 React 学习会话",
    prismaValue: "REACT",
  },
  {
    id: "next",
    label: "Next.js 全栈开发",
    defaultTitle: "新的 Next.js 学习会话",
    prismaValue: "NEXT",
  },
];

export function toPrismaModule(module: LearningModuleId) {
  return module === "react" ? "REACT" : "NEXT";
}

export function fromPrismaModule(
  module: "REACT" | "NEXT",
): LearningModuleId {
  return module === "REACT" ? "react" : "next";
}

export function getModuleMeta(module: LearningModuleId) {
  return LEARNING_MODULES.find((item) => item.id === module)!;
}

export function inferModuleFromTitle(title: string): "REACT" | "NEXT" {
  const normalized = title.toLowerCase();

  if (normalized.includes("next")) {
    return "NEXT";
  }

  return "REACT";
}
