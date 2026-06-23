import { parseDailyTasks } from "@/lib/learning/home-dashboard-types";
import type { ChatExerciseContext } from "@/lib/learning/chat-exercise-context-types";
import { EMPTY_CHAT_EXERCISE_CONTEXT } from "@/lib/learning/chat-exercise-context-types";
import { getLearningPhaseLabel } from "@/lib/learning/learning-phase";
import { resolveRoadmapProgress } from "@/lib/learning/roadmap-progress";

export const DEFAULT_LEARNING_TOPIC = "React + Next.js 项目实战学习";

export const CANONICAL_ROADMAP_TITLES = [
  "基础语法",
  "组件与状态管理",
  "路由与数据获取",
  "进阶与优化",
  "实战项目",
] as const;

export const CHAT_MODEL_MESSAGE_LIMIT = 16;

export type LearningModule = "REACT" | "NEXT";

export type LearningProgressForPrompt = {
  currentTopic: string;
  summary: string;
  masteredTopics: string[];
  weakTopics: string[];
  nextPlan: string | null;
  roadmapSteps: unknown;
  dailyTasks: unknown;
} | null;

export type ChatThreadForPrompt = {
  module: LearningModule;
};

function formatList(items: string[], fallback: string) {
  return items.length ? items.join("、") : fallback;
}

function taskStatusLabel(status: "done" | "active" | "pending") {
  if (status === "done") {
    return "已完成";
  }

  if (status === "active") {
    return "进行中";
  }

  return "待开始";
}

export function getModulePromptContext(module: LearningModule) {
  if (module === "NEXT") {
    return {
      label: "Next.js 全栈开发",
      focus:
        "App Router、Server Component、Route Handler、Server Action、Prisma、PostgreSQL、缓存、部署与 AI 流式对话项目",
      boundary:
        "优先把问题放在 Next.js 应用边界里解释；React 基础只补到足够理解当前 Next.js 任务为止。",
    };
  }

  return {
    label: "React 学习",
    focus: "JSX、组件拆分、Props、Hooks、状态管理、事件、表单、列表渲染和组件工程化",
    boundary:
      "优先打牢 React 基础；Next.js、数据库、部署等内容只给必要背景，不主动展开成主线。",
  };
}

export function resolvePromptRoadmap(progress: LearningProgressForPrompt) {
  const masteredTopics = progress?.masteredTopics ?? [];
  const weakTopics = progress?.weakTopics ?? [];
  const currentTopic = progress?.currentTopic || DEFAULT_LEARNING_TOPIC;

  return resolveRoadmapProgress({
    roadmapSteps: progress?.roadmapSteps ?? [],
    masteredTopics,
    weakTopics,
    currentTopic,
  }).map((step, index) => ({
    ...step,
    title: CANONICAL_ROADMAP_TITLES[index] ?? step.title,
  }));
}

export function describeRoadmapForPrompt(progress: LearningProgressForPrompt) {
  const roadmap = resolvePromptRoadmap(progress);
  const activeStep =
    roadmap.find((step) => step.status === "active") ??
    roadmap.find((step) => step.status !== "done") ??
    roadmap[0];
  const completedSteps = roadmap
    .filter((step) => step.status === "done")
    .map((step) => step.title);
  const pendingSteps = roadmap
    .filter((step) => step.status === "pending")
    .map((step) => step.title);
  const roadmapLines = roadmap
    .map((step, index) => {
      const statusLabel =
        step.status === "done"
          ? "已完成"
          : step.status === "active"
            ? "当前阶段"
            : "暂缓";

      return `${index + 1}. ${step.title}：${statusLabel}，${step.percent}%`;
    })
    .join("\n");

  return {
    activeStep,
    completedSteps,
    pendingSteps,
    roadmapLines,
  };
}

export function describeDailyTasksForPrompt(dailyTasks: unknown) {
  const parsed = parseDailyTasks(dailyTasks);

  if (!parsed.success || parsed.data.length === 0) {
    return "暂无今日任务，请围绕当前课节先讲解核心概念。";
  }

  return parsed.data
    .map((task) => `- [${taskStatusLabel(task.status)}] ${task.title}`)
    .join("\n");
}

export function describeExerciseContextForPrompt(
  exerciseContext: ChatExerciseContext = EMPTY_CHAT_EXERCISE_CONTEXT,
) {
  if (!exerciseContext.hasActiveGate || !exerciseContext.exerciseTitle) {
    return "当前没有 catalog 练习。如用户问学什么，请引导其先进入练习区开始第一课。";
  }

  const requirementLines = exerciseContext.requirements.length
    ? exerciseContext.requirements.map((item) => `- ${item}`).join("\n")
    : "- 暂无额外要求";

  const lastSubmissionLine = exerciseContext.lastSubmission
    ? `- 最近提交：第 ${exerciseContext.lastSubmission.attemptNumber} 次，${exerciseContext.lastSubmission.finalPassed ? "已通过" : "未通过"}，${exerciseContext.lastSubmission.score} 分`
    : "- 最近提交：暂无";

  const keywordLine = exerciseContext.lessonKeywords.length
    ? `- 课节关键词：${exerciseContext.lessonKeywords.join("、")}`
    : "- 课节关键词：暂无";

  const descriptionLine = exerciseContext.exerciseDescription
    ? `- 练习说明：${exerciseContext.exerciseDescription}`
    : "- 练习说明：暂无";

  return `- 课节：${exerciseContext.lessonTitle ?? exerciseContext.lessonKey}
- 练习：${exerciseContext.exerciseTitle}
- 状态：${exerciseContext.exerciseStatus === "PASSED" ? "已通过，可复练" : "进行中"}
- 学习阶段：${getLearningPhaseLabel(exerciseContext.learningPhase)}
- 本课用户对话轮次：${exerciseContext.userTurnsOnLesson}（自课节激活起，在当前会话中统计）
- 通过线：${exerciseContext.passScore ?? "未知"} 分
${keywordLine}
${descriptionLine}
- 要求：
${requirementLines}
${lastSubmissionLine}`;
}

export function buildTeachingPaceRules(
  exerciseContext: ChatExerciseContext = EMPTY_CHAT_EXERCISE_CONTEXT,
) {
  switch (exerciseContext.learningPhase) {
    case "teach":
      return `教学节奏（必须遵守）：
- 当前处于「讲课阶段」：用户尚未在本课完成足够对话轮次，也还没有练习提交记录。
- 用户问「今天学什么 / 该练什么」时，必须先讲本课核心概念（用课节标题、关键词、练习说明作大纲），按「结论 → 为什么 → 怎么写 → 常见坑」组织。
- 可以说明本课配套练习是《${exerciseContext.exerciseTitle ?? "当前题"}》，但不要催「现在就去练习区提交」。
- 禁止自造 Greeting、useState 演示题等 catalog 之外的练习题。`;

    case "practice_ready":
      return `教学节奏（必须遵守）：
- 当前处于「可练习阶段」：用户已在本课聊过至少 2 轮，但还没有提交记录。
- 先用 3~5 句小结本课核心点，再引导用户展开上方做题区，按 requirements 尝试《${exerciseContext.exerciseTitle ?? "当前题"}》。
- 仍不要贴完整参考答案，不要催用户只在聊天里贴代码。`;

    case "practice":
      return `教学节奏（必须遵守）：
- 当前处于「练习阶段」：用户已在练习区提交过代码。
- 结合最近提交分数与反馈给小步提示，引导回练习区修改后重新提交。
- 如需回顾概念可以继续讲解，但重点放在帮助用户通过当前 catalog 题。`;

    case "review":
      return `教学节奏（必须遵守）：
- 当前处于「复习阶段」：本题已通过。
- 确认通过状态，鼓励巩固或进入下一课；用户想复练也可支持。`;

    default:
      return "";
  }
}

export function buildSystemPrompt(
  progress: LearningProgressForPrompt,
  thread: ChatThreadForPrompt,
  exerciseContext: ChatExerciseContext = EMPTY_CHAT_EXERCISE_CONTEXT,
) {
  const moduleContext = getModulePromptContext(thread.module);
  const roadmap = describeRoadmapForPrompt(progress);
  const activeStage = roadmap.activeStep?.title ?? CANONICAL_ROADMAP_TITLES[0];
  const activePercent = roadmap.activeStep?.percent ?? 0;
  const dailyTaskLines = describeDailyTasksForPrompt(progress?.dailyTasks ?? []);
  const exerciseContextLines = describeExerciseContextForPrompt(exerciseContext);
  const teachingPaceRules = buildTeachingPaceRules(exerciseContext);

  return `
你是 LingStack 的 AI 学习助教。你的目标不是泛泛答题，而是把用户稳定带回当前课程路线图，帮助他把 React / Next.js 项目能力练出来。

当前会话模块：
- 模块：${moduleContext.label}
- 本模块主线：${moduleContext.focus}
- 模块边界：${moduleContext.boundary}

当前学习进度：
- 当前主题：${progress?.currentTopic || DEFAULT_LEARNING_TOPIC}
- 当前路线图阶段：${activeStage}（${activePercent}%）
- 已完成阶段：${formatList(roadmap.completedSteps, "暂无")}
- 暂缓阶段：${formatList(roadmap.pendingSteps, "暂无")}
- 已掌握知识点：${formatList(progress?.masteredTopics ?? [], "暂无稳定记录")}
- 薄弱点：${formatList(progress?.weakTopics ?? [], "暂无稳定记录")}
- 下一步计划：${progress?.nextPlan || "继续围绕当前阶段推进"}
- 学习摘要：${progress?.summary || "暂无学习摘要"}

路线图状态：
${roadmap.roadmapLines}

今日建议任务：
${dailyTaskLines}

当前练习区状态（catalog 真相，必须优先引用）：
${exerciseContextLines}

${teachingPaceRules}

回答规则：
1. 默认使用中文，直接、简洁、可执行，优先服务于代码能力。
2. 优先围绕当前会话模块、当前路线图阶段和今日任务回答；根据「学习阶段」决定先讲还是引导练习。
3. 如果用户问题在当前模块内，讲清楚“结论、为什么、怎么写、常见坑”；讲课阶段不要急于布置练习。
4. 如果用户问题相关但明显超前，只给必要最小解释，说明完整内容放到后续阶段，再拉回当前阶段。
5. 如果用户明显偏题，先简短回应或说明不适合作为主线，再主动把问题拉回 ${moduleContext.label} 的当前阶段（${activeStage}）。
6. 不主动展开 RAG、LangChain、复杂架构、部署细节等超阶段内容，除非用户明确要求。
7. 用户在练代码时，给小步提示和关键代码片段，不要一次性塞太多无关内容。
8. 对薄弱点优先补基础；对已掌握点避免重复长篇解释。
9. catalog 练习题标题与要求以「当前练习区状态」为准；禁止自造课外练习题。
10. 学习完成与路线图推进只能通过练习区提交代码完成，聊天中的代码粘贴不算完成练习。
`;
}

export function buildProgressExtractionPrompt(
  progress: LearningProgressForPrompt,
  thread: ChatThreadForPrompt,
  conversation: string,
) {
  const moduleContext = getModulePromptContext(thread.module);
  const roadmap = describeRoadmapForPrompt(progress);
  const activeStage = roadmap.activeStep?.title ?? CANONICAL_ROADMAP_TITLES[0];
  const dailyTaskLines = describeDailyTasksForPrompt(progress?.dailyTasks ?? []);

  return `
根据下面最近对话，更新这个用户的学习进度。输出必须与当前会话模块和路线图保持一致，不要突然跳到无关阶段。

当前会话模块：
- 模块：${moduleContext.label}
- 模块边界：${moduleContext.boundary}

当前已知进度：
- 当前主题：${progress?.currentTopic || DEFAULT_LEARNING_TOPIC}
- 当前路线图阶段：${activeStage}
- 已掌握：${formatList(progress?.masteredTopics ?? [], "暂无")}
- 薄弱点：${formatList(progress?.weakTopics ?? [], "暂无")}
- 下一步计划：${progress?.nextPlan || "继续围绕当前阶段推进"}
- 学习摘要：${progress?.summary || "暂无"}

路线图状态：
${roadmap.roadmapLines}

今日任务（可在此基础上微调，不要完全推翻）：
${dailyTaskLines}

要求：
- summary 用 1-3 句话说明用户现在在聊什么、理解了哪些概念、还有哪些疑惑（侧重讲解进度）。
- weakTopics 只放还需要继续讲解或练习的知识点。
- 不要输出 currentTopic、nextPlan、masteredTopics、roadmapSteps、dailyTasks；课节推进、今日任务与完成状态由练习提交系统维护，不要从对话推断完成状态。

最近对话：
${conversation}
`;
}

export function truncateChatMessages<T>(messages: T[], limit = CHAT_MODEL_MESSAGE_LIMIT) {
  if (messages.length <= limit) {
    return messages;
  }

  return messages.slice(-limit);
}
