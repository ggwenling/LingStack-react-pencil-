import { describe, expect, it } from "vitest";

import {
  buildDailyTasksFromLessons,
  buildRoadmapStepsFromLessons,
} from "./progress-aggregator-pure";

describe("progress aggregator", () => {
  it("builds active exercise daily task", () => {
    const tasks = buildDailyTasksFromLessons([
      {
        id: "lesson-1",
        userId: "user-1",
        stageKey: "react-components-state",
        stageIndex: 1,
        lessonKey: "jsx-rendering",
        status: "ACTIVE",
        activeExerciseId: "exercise-1",
        startedAt: new Date(),
        passedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        exercises: [
          {
            id: "exercise-1",
            userId: "user-1",
            lessonProgressId: "lesson-1",
            stageKey: "react-components-state",
            lessonKey: "jsx-rendering",
            templateId: "jsx-basics-render",
            templateVersion: 1,
            title: "用 JSX 渲染列表",
            requirements: [],
            rubric: [],
            starterCode: "",
            passScore: 70,
            requiredCriteriaIds: [],
            status: "ACTIVE",
            passedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: { submissions: 0 },
          },
        ],
      },
    ]);

    expect(tasks.some((task) => task.status === "active")).toBe(true);
    expect(tasks[0]?.title).toContain("学习");
  });

  it("uses practice task title after submissions exist", () => {
    const tasks = buildDailyTasksFromLessons([
      {
        id: "lesson-1",
        userId: "user-1",
        stageKey: "react-components-state",
        stageIndex: 1,
        lessonKey: "jsx-rendering",
        status: "ACTIVE",
        activeExerciseId: "exercise-1",
        startedAt: new Date(),
        passedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        exercises: [
          {
            id: "exercise-1",
            userId: "user-1",
            lessonProgressId: "lesson-1",
            stageKey: "react-components-state",
            lessonKey: "jsx-rendering",
            templateId: "jsx-basics-render",
            templateVersion: 1,
            title: "用 JSX 渲染列表",
            requirements: [],
            rubric: [],
            starterCode: "",
            passScore: 70,
            requiredCriteriaIds: [],
            status: "ACTIVE",
            passedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: { submissions: 1 },
          },
        ],
      },
    ]);

    expect(tasks[0]?.title).toContain("练习");
  });

  it("keeps stage 1 pending for new users", () => {
    const steps = buildRoadmapStepsFromLessons([
      {
        id: "lesson-1",
        userId: "user-1",
        stageKey: "react-components-state",
        stageIndex: 1,
        lessonKey: "jsx-rendering",
        status: "ACTIVE",
        activeExerciseId: "exercise-1",
        startedAt: new Date(),
        passedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        exercises: [],
      },
    ]);

    expect(steps[0]?.status).toBe("pending");
    expect(steps[1]?.status).toBe("active");
    expect(steps[2]?.status).toBe("pending");
  });

  it("unlocks stage 3 after MVP lessons passed", () => {
    const now = new Date();
    const mvpLessons = [
      "jsx-rendering",
      "hooks-effect-context",
      "perf-memo-callback",
    ].map((lessonKey, index) => ({
      id: `lesson-${index}`,
      userId: "user-1",
      stageKey: "react-components-state",
      stageIndex: 1,
      lessonKey,
      status: "PASSED" as const,
      activeExerciseId: null,
      startedAt: now,
      passedAt: now,
      createdAt: now,
      updatedAt: now,
      exercises: [],
    }));

    const steps = buildRoadmapStepsFromLessons(mvpLessons);

    expect(steps[1]?.status).toBe("done");
    expect(steps[2]?.status).toBe("pending");
  });
});
