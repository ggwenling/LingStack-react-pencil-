import { describe, expect, it } from "vitest";

import { buildExerciseChatFollowUp } from "./exercise-chat-followup";

describe("buildExerciseChatFollowUp", () => {
  it("builds pass message with unlocked lesson", () => {
    const message = buildExerciseChatFollowUp({
      exerciseTitle: "useEffect 清理函数",
      result: {
        passed: true,
        score: 88,
        feedback: "通过",
        criteria: [],
        lessonCompleted: true,
        unlockedLessonKey: "perf-memo-callback",
        attemptNumber: 1,
      },
    });

    expect(message).toContain("已通过（88 分）");
    expect(message).toContain("下一课");
    expect(message).toContain("useMemo");
  });

  it("builds fail message with hint after three attempts", () => {
    const message = buildExerciseChatFollowUp({
      exerciseTitle: "useEffect 清理函数",
      result: {
        passed: false,
        score: 40,
        feedback: "详细反馈不应展示",
        criteria: [],
        lessonCompleted: false,
        unlockedLessonKey: null,
        attemptNumber: 3,
        nextHint: "记得在 useEffect 中 return 清理函数",
      },
    });

    expect(message).toContain("第 3 次提交未通过");
    expect(message).toContain("记得在 useEffect 中 return 清理函数");
    expect(message).toContain("如需回顾概念，可以继续问我");
  });

  it("builds fail message with feedback before three attempts", () => {
    const message = buildExerciseChatFollowUp({
      exerciseTitle: "用 JSX 渲染列表",
      result: {
        passed: false,
        score: 50,
        feedback: "列表项缺少 key",
        criteria: [],
        lessonCompleted: false,
        unlockedLessonKey: null,
        attemptNumber: 1,
      },
    });

    expect(message).toContain("列表项缺少 key");
  });
});
