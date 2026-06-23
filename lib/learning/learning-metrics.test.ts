import { describe, expect, it } from "vitest";

import type { LessonWithExercises } from "./progress-aggregator-pure";
import {
  buildModuleEntryProgress,
  computeKnowledgeProgress,
  estimateStudyHoursFromMessageCount,
  getCatalogKnowledgePointTotal,
  getLessonKnowledgePoints,
  inferActiveModuleFromLessons,
} from "./learning-metrics";
import { listAllLessons } from "./catalog-index";

function makeLesson(
  lessonKey: string,
  status: "LOCKED" | "ACTIVE" | "PASSED",
  stageKey = "react-components-state",
  exercises: LessonWithExercises["exercises"] = [],
): LessonWithExercises {
  return {
    id: `lesson-${lessonKey}`,
    userId: "user-1",
    lessonKey,
    stageKey,
    stageIndex: 1,
    status,
    startedAt: new Date(),
    passedAt: status === "PASSED" ? new Date() : null,
    createdAt: new Date(),
    updatedAt: new Date(),
    exercises,
  };
}

describe("learning metrics", () => {
  it("derives catalog knowledge point total from lesson keywords", () => {
    const expected = listAllLessons().reduce(
      (sum, ref) => sum + getLessonKnowledgePoints(ref.lesson),
      0,
    );

    expect(getCatalogKnowledgePointTotal()).toBe(expected);
    expect(getCatalogKnowledgePointTotal()).toBeGreaterThan(0);
    expect(getCatalogKnowledgePointTotal()).not.toBe(75);
  });

  it("computes zero progress when no lessons are passed", () => {
    const lessons = [
      makeLesson("jsx-rendering", "ACTIVE"),
      makeLesson("hooks-effect-context", "LOCKED"),
    ];

    const progress = computeKnowledgeProgress(lessons);

    expect(progress.totalCount).toBe(getCatalogKnowledgePointTotal());
    expect(progress.completedCount).toBe(0);
    expect(progress.overallPercent).toBe(0);
  });

  it("counts passed lessons and partial active lesson credit", () => {
    const jsxMeta = listAllLessons().find(
      (ref) => ref.lesson.lessonKey === "jsx-rendering",
    )!;
    const hooksMeta = listAllLessons().find(
      (ref) => ref.lesson.lessonKey === "hooks-effect-context",
    )!;

    const lessons = [
      makeLesson("jsx-rendering", "PASSED"),
      makeLesson("hooks-effect-context", "ACTIVE", "react-components-state", [
        {
          id: "ex-1",
          userId: "user-1",
          lessonProgressId: "lesson-hooks-effect-context",
          templateId: "hooks-effect-cleanup",
          title: "useEffect 清理函数",
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    ];

    const progress = computeKnowledgeProgress(lessons);
    const jsxPoints = getLessonKnowledgePoints(jsxMeta.lesson);
    const hooksPoints = getLessonKnowledgePoints(hooksMeta.lesson);

    expect(progress.completedCount).toBe(jsxPoints);
    expect(progress.overallPercent).toBeGreaterThan(0);
    expect(progress.completedCount).toBeLessThan(jsxPoints + hooksPoints);
  });

  it("builds react and next module entry progress from lesson status", () => {
    const lessons = [
      makeLesson("jsx-rendering", "PASSED"),
      makeLesson("hooks-effect-context", "PASSED"),
      makeLesson("perf-memo-callback", "ACTIVE"),
      makeLesson("app-router-page", "LOCKED", "routing-data-fetching"),
    ];

    const entries = buildModuleEntryProgress(lessons);
    const reactEntry = entries.find((entry) => entry.accent === "react");
    const nextEntry = entries.find((entry) => entry.accent === "next");

    expect(reactEntry?.percent).toBe(67);
    expect(nextEntry?.percent).toBe(0);
  });

  it("infers active module from active lesson stage", () => {
    expect(
      inferActiveModuleFromLessons([
        makeLesson("app-router-page", "ACTIVE", "routing-data-fetching"),
      ]),
    ).toBe("next");

    expect(
      inferActiveModuleFromLessons([
        makeLesson("jsx-rendering", "ACTIVE", "react-components-state"),
      ]),
    ).toBe("react");
  });

  it("estimates study hours from message count", () => {
    expect(estimateStudyHoursFromMessageCount(17)).toBe(6.8);
    expect(estimateStudyHoursFromMessageCount(0)).toBe(0);
  });
});
