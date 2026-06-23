import { describe, expect, it } from "vitest";

import { getExerciseTemplate } from "./exercise-catalog";
import {
  calculateScoreFromCriteria,
  finalizePassed,
  mergeCriteriaResults,
} from "./grading-service";
import type { GradingResult } from "@/lib/validation/exercise";

describe("finalizePassed", () => {
  const template = getExerciseTemplate("hooks-effect-cleanup");

  it("requires static checks and score threshold", () => {
    if (!template) {
      throw new Error("missing template");
    }

    const aiResult: GradingResult = {
      passed: true,
      score: 90,
      feedback: "不错",
      criteriaResults: [
        { id: "uses-effect", met: true, reason: "ok" },
        { id: "creates-interval", met: true, reason: "ok" },
        { id: "has-cleanup", met: true, reason: "ok" },
        { id: "clears-interval", met: true, reason: "ok" },
        { id: "reasonable-deps", met: true, reason: "ok" },
      ],
    };

    const staticResults = {
      "uses-effect": true,
      "creates-interval": true,
      "has-cleanup": true,
      "clears-interval": true,
    };

    const criteriaResults = mergeCriteriaResults(
      template,
      staticResults,
      aiResult,
    );
    const score = calculateScoreFromCriteria(template.rubric, criteriaResults);

    expect(
      finalizePassed({
        template,
        aiResult,
        staticResults,
        criteriaResults,
        score,
      }),
    ).toBe(true);
  });

  it("fails when required static check is missing", () => {
    if (!template) {
      throw new Error("missing template");
    }

    const aiResult: GradingResult = {
      passed: true,
      score: 95,
      feedback: "看起来可以",
      criteriaResults: [],
    };

    const staticResults = {
      "uses-effect": true,
      "creates-interval": true,
      "has-cleanup": false,
      "clears-interval": false,
    };

    const criteriaResults = mergeCriteriaResults(
      template,
      staticResults,
      aiResult,
    );
    const score = calculateScoreFromCriteria(template.rubric, criteriaResults);

    expect(
      finalizePassed({
        template,
        aiResult,
        staticResults,
        criteriaResults,
        score,
      }),
    ).toBe(false);
  });
});
