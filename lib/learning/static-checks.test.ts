import { describe, expect, it } from "vitest";

import { getExerciseTemplate } from "./exercise-catalog";
import { runStaticCheck } from "./static-checks";

const passingHooksCode = `import { useEffect, useState } from "react";

export function SessionTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <div>已学习 {seconds} 秒</div>;
}`;

const passingJsxCode = `export function SkillList({ skills }: { skills: Array<{ id: string; name: string; level: string }> }) {
  if (!skills.length) {
    return <section>暂无技能</section>;
  }

  return (
    <section>
      {skills.map((skill) => (
        <div key={skill.id} className={skill.level}>
          {skill.name}
        </div>
      ))}
    </section>
  );
}`;

describe("static checks", () => {
  it("detects useEffect cleanup solution", () => {
    expect(runStaticCheck("contains-use-effect", passingHooksCode)).toBe(true);
    expect(runStaticCheck("contains-set-interval", passingHooksCode)).toBe(true);
    expect(runStaticCheck("has-effect-cleanup-return", passingHooksCode)).toBe(
      true,
    );
    expect(runStaticCheck("contains-clear-interval", passingHooksCode)).toBe(
      true,
    );
  });

  it("detects jsx list rendering solution", () => {
    expect(runStaticCheck("contains-array-map", passingJsxCode)).toBe(true);
    expect(runStaticCheck("jsx-list-has-key", passingJsxCode)).toBe(true);
    expect(runStaticCheck("references-skill-name", passingJsxCode)).toBe(true);
    expect(runStaticCheck("has-empty-state-branch", passingJsxCode)).toBe(true);
  });

  it("rejects empty code", () => {
    const template = getExerciseTemplate("hooks-effect-cleanup");

    if (!template) {
      throw new Error("missing template");
    }

    expect(runStaticCheck("contains-use-effect", "")).toBe(false);
    expect(runStaticCheck("contains-clear-interval", "export function X() { return null }")).toBe(
      false,
    );
  });

  it("detects phase 2 app router page solution", () => {
    const passingPageCode = `export default function WelcomePage() {
  return <main><h1>欢迎学习 LingStack</h1></main>;
}`;

    expect(runStaticCheck("contains-export-default", passingPageCode)).toBe(true);
    expect(runStaticCheck("contains-export-default", "export function X() {}")).toBe(
      false,
    );
  });

  it("detects phase 2 suspense solution", () => {
    const passingSuspenseCode = `import { Suspense } from "react";

export function DashboardPanel() {
  return (
    <Suspense fallback={<div>加载中</div>}>
      <SlowStats />
    </Suspense>
  );
}`;

    expect(runStaticCheck("contains-suspense", passingSuspenseCode)).toBe(true);
    expect(runStaticCheck("contains-suspense", "export function X() { return null }")).toBe(
      false,
    );
  });

  it("detects phase 2 cache revalidation solution", () => {
    const passingCacheCode = `export async function getDashboardStats() {
  const response = await fetch("https://example.com/api/stats", {
    next: { revalidate: 60 },
  });
  return response.json();
}`;

    expect(runStaticCheck("contains-async-await", passingCacheCode)).toBe(true);
    expect(runStaticCheck("contains-revalidate", passingCacheCode)).toBe(true);
    expect(runStaticCheck("contains-revalidate", "export async function X() { return {} }")).toBe(
      false,
    );
  });
});
