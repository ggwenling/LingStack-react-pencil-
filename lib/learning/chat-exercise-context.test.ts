import { describe, expect, it, vi } from "vitest";

import { EMPTY_CHAT_EXERCISE_CONTEXT } from "./chat-exercise-context-types";

vi.mock("@/lib/repositories/chat-repository", () => ({
  countUserMessagesSince: vi.fn(),
}));

vi.mock("@/lib/repositories/exercise-repository", () => ({
  findSubmissionsForExercise: vi.fn(),
  findLessonProgressByKey: vi.fn(),
}));

vi.mock("./exercise-service", () => ({
  getCurrentExerciseView: vi.fn(),
}));

import { countUserMessagesSince } from "@/lib/repositories/chat-repository";
import {
  findLessonProgressByKey,
  findSubmissionsForExercise,
} from "@/lib/repositories/exercise-repository";

import { getChatExerciseContext } from "./chat-exercise-context";
import { getCurrentExerciseView } from "./exercise-service";

describe("getChatExerciseContext", () => {
  it("returns empty context when no exercise exists", async () => {
    vi.mocked(getCurrentExerciseView).mockResolvedValue(null);

    const context = await getChatExerciseContext("user-1");

    expect(context).toEqual(EMPTY_CHAT_EXERCISE_CONTEXT);
  });

  it("aggregates teach phase before enough turns", async () => {
    vi.mocked(getCurrentExerciseView).mockResolvedValue({
      exerciseId: "exercise-1",
      lessonKey: "jsx-rendering",
      lessonTitle: "JSX 语法与渲染逻辑",
      title: "用 JSX 渲染列表",
      description: "实现 SkillList 组件",
      requirements: ["必须使用 skills.map"],
      starterCode: "",
      status: "ACTIVE",
      templateId: "jsx-basics-render",
      passScore: 70,
      rubric: [],
    });
    vi.mocked(findSubmissionsForExercise).mockResolvedValue([]);
    vi.mocked(findLessonProgressByKey).mockResolvedValue({
      id: "lesson-1",
      userId: "user-1",
      stageKey: "react-components-state",
      stageIndex: 1,
      lessonKey: "jsx-rendering",
      status: "ACTIVE",
      activeExerciseId: "exercise-1",
      startedAt: new Date("2026-06-21T10:00:00.000Z"),
      passedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      exercises: [],
    });
    vi.mocked(countUserMessagesSince).mockResolvedValue(1);

    const context = await getChatExerciseContext("user-1", {
      threadId: "thread-1",
    });

    expect(context.learningPhase).toBe("teach");
    expect(context.userTurnsOnLesson).toBe(1);
    expect(context.lessonKeywords).toContain("jsx");
  });

  it("aggregates practice_ready after two turns", async () => {
    vi.mocked(getCurrentExerciseView).mockResolvedValue({
      exerciseId: "exercise-1",
      lessonKey: "jsx-rendering",
      lessonTitle: "JSX 语法与渲染逻辑",
      title: "用 JSX 渲染列表",
      description: "实现 SkillList 组件",
      requirements: ["必须使用 skills.map"],
      starterCode: "",
      status: "ACTIVE",
      templateId: "jsx-basics-render",
      passScore: 70,
      rubric: [],
    });
    vi.mocked(findSubmissionsForExercise).mockResolvedValue([]);
    vi.mocked(findLessonProgressByKey).mockResolvedValue({
      id: "lesson-1",
      userId: "user-1",
      stageKey: "react-components-state",
      stageIndex: 1,
      lessonKey: "jsx-rendering",
      status: "ACTIVE",
      activeExerciseId: "exercise-1",
      startedAt: new Date("2026-06-21T10:00:00.000Z"),
      passedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      exercises: [],
    });
    vi.mocked(countUserMessagesSince).mockResolvedValue(2);

    const context = await getChatExerciseContext("user-1", {
      threadId: "thread-1",
    });

    expect(context.learningPhase).toBe("practice_ready");
  });
});
