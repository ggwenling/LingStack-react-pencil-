import { describe, expect, it } from "vitest";

import { getNextLesson, listAllLessons } from "./catalog-index";

describe("catalog progression", () => {
  it("unlocks lessons in MVP stage order", () => {
    expect(getNextLesson("jsx-rendering")?.lesson.lessonKey).toBe(
      "hooks-effect-context",
    );
    expect(getNextLesson("hooks-effect-context")?.lesson.lessonKey).toBe(
      "perf-memo-callback",
    );
    expect(getNextLesson("perf-memo-callback")?.lesson.lessonKey).toBe(
      "app-router-page",
    );
  });

  it("lists lessons across all exercise stages", () => {
    const lessons = listAllLessons();

    expect(lessons.length).toBeGreaterThanOrEqual(10);
    expect(lessons[0]?.lesson.lessonKey).toBe("jsx-rendering");
    expect(lessons.some((item) => item.stageKey === "routing-data-fetching")).toBe(
      true,
    );
  });

  it("continues into advanced stages", () => {
    expect(getNextLesson("route-handler-api")?.lesson.lessonKey).toBe(
      "suspense-streaming",
    );
    expect(getNextLesson("cache-revalidation")?.lesson.lessonKey).toBe(
      "saas-auth-middleware",
    );
  });
});
