import type { SkillPathCard } from "@/lib/learning/resources-page-types";

import { SkillPathCompactCard } from "./skill-path-compact-card";
import { SkillPathFeaturedCard } from "./skill-path-featured-card";

type SkillPathsSectionProps = {
  paths: SkillPathCard[];
};

export function SkillPathsSection({ paths }: SkillPathsSectionProps) {
  const featured = paths.find((path) => path.variant === "featured");
  const compact = paths.filter((path) => path.variant === "compact");

  if (!featured) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-950">推荐技能路径</h2>
        <p className="mt-1 text-sm text-neutral-500">
          由 AI 计算推荐的最优成长路线
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SkillPathFeaturedCard path={featured} />
        </div>
        <div className="flex flex-col gap-6">
          {compact.map((path) => (
            <SkillPathCompactCard key={path.id} path={path} />
          ))}
        </div>
      </div>
    </section>
  );
}
