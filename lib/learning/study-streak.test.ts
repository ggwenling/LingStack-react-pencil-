import { describe, expect, it } from "vitest";

import { calculateStreakDays } from "./study-streak";

describe("calculateStreakDays", () => {
  it("counts consecutive study days", () => {
    expect(
      calculateStreakDays(
        [
          new Date("2026-06-30T12:00:00+08:00"),
          new Date("2026-06-29T12:00:00+08:00"),
          new Date("2026-06-28T12:00:00+08:00"),
        ],
        new Date("2026-06-30T20:00:00+08:00"),
      ),
    ).toBe(3);
  });

  it("does not count when today has no study record", () => {
    expect(
      calculateStreakDays(
        [new Date("2026-06-29T12:00:00+08:00")],
        new Date("2026-06-30T20:00:00+08:00"),
      ),
    ).toBe(0);
  });
});
