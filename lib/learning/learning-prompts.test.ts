import { describe, expect, it } from "vitest";

import {
  buildSystemPrompt,
  buildTeachingPaceRules,
  describeExerciseContextForPrompt,
} from "@/app/api/chat/prompts/learning-prompts";
import type { ChatExerciseContext } from "@/lib/learning/chat-exercise-context-types";

const emptyExerciseContext: ChatExerciseContext = {
  hasActiveGate: false,
  lessonKey: null,
  lessonTitle: null,
  exerciseId: null,
  exerciseTitle: null,
  exerciseStatus: null,
  requirements: [],
  passScore: null,
  learningPhase: "teach",
  userTurnsOnLesson: 0,
  lessonKeywords: [],
  exerciseDescription: null,
  lastSubmission: null,
};

describe("learning prompts exercise sync", () => {
  it("includes teach phase rules in system prompt", () => {
    const prompt = buildSystemPrompt(
      {
        currentTopic: "学习：Hooks 进阶",
        summary: "正在学习 hooks",
        masteredTopics: [],
        weakTopics: [],
        nextPlan: "先理解课节，再完成练习",
        roadmapSteps: [],
        dailyTasks: [{ title: "学习：Hooks 进阶", status: "active" }],
      },
      { module: "REACT" },
      {
        ...emptyExerciseContext,
        hasActiveGate: true,
        lessonKey: "hooks-effect-context",
        lessonTitle: "Hooks 进阶",
        exerciseId: "exercise-1",
        exerciseTitle: "useEffect 清理函数",
        exerciseStatus: "ACTIVE",
        requirements: ["必须使用 useEffect"],
        passScore: 75,
        learningPhase: "teach",
        userTurnsOnLesson: 1,
        lessonKeywords: ["useeffect", "hook"],
        exerciseDescription: "实现 SessionTimer 组件",
      },
    );

    expect(prompt).toContain("讲课阶段");
    expect(prompt).toContain("不要催「现在就去练习区提交」");
  });

  it("includes practice_ready guidance", () => {
    const rules = buildTeachingPaceRules({
      ...emptyExerciseContext,
      hasActiveGate: true,
      exerciseTitle: "用 JSX 渲染列表",
      learningPhase: "practice_ready",
      userTurnsOnLesson: 2,
    });

    expect(rules).toContain("可练习阶段");
    expect(rules).toContain("展开上方做题区");
  });

  it("describes exercise requirements and phase", () => {
    const description = describeExerciseContextForPrompt({
      ...emptyExerciseContext,
      hasActiveGate: true,
      lessonKey: "jsx-rendering",
      lessonTitle: "JSX 语法与渲染逻辑",
      exerciseId: "exercise-1",
      exerciseTitle: "用 JSX 渲染列表",
      exerciseStatus: "ACTIVE",
      requirements: ["必须使用 skills.map"],
      passScore: 70,
      learningPhase: "practice",
      userTurnsOnLesson: 3,
      lessonKeywords: ["jsx"],
      exerciseDescription: "实现 SkillList",
      lastSubmission: {
        attemptNumber: 1,
        score: 45,
        finalPassed: false,
        feedback: "缺少 key",
        createdAt: new Date(),
      },
    });

    expect(description).toContain("练习阶段");
    expect(description).toContain("skills.map");
    expect(description).toContain("未通过");
  });
});
