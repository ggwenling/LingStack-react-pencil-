import { describe, expect, it } from "vitest";

import { MIN_TEACH_TURNS, resolveLearningPhase } from "./learning-phase";

describe("resolveLearningPhase", () => {
  it("returns teach before enough user turns", () => {
    expect(
      resolveLearningPhase({
        userTurns: 0,
        exerciseStatus: "ACTIVE",
        hasSubmission: false,
      }),
    ).toBe("teach");
    expect(
      resolveLearningPhase({
        userTurns: MIN_TEACH_TURNS - 1,
        exerciseStatus: "ACTIVE",
        hasSubmission: false,
      }),
    ).toBe("teach");
  });

  it("returns practice_ready after enough turns without submission", () => {
    expect(
      resolveLearningPhase({
        userTurns: MIN_TEACH_TURNS,
        exerciseStatus: "ACTIVE",
        hasSubmission: false,
      }),
    ).toBe("practice_ready");
  });

  it("returns practice when submission exists", () => {
    expect(
      resolveLearningPhase({
        userTurns: 1,
        exerciseStatus: "ACTIVE",
        hasSubmission: true,
      }),
    ).toBe("practice");
  });

  it("returns review when exercise passed", () => {
    expect(
      resolveLearningPhase({
        userTurns: 0,
        exerciseStatus: "PASSED",
        hasSubmission: true,
      }),
    ).toBe("review");
  });
});
