import Link from "next/link";

import type { SkillPathCard } from "@/lib/learning/resources-page-types";

type SkillPathCompactCardProps = {
  path: SkillPathCard;
};

export function SkillPathCompactCard({ path }: SkillPathCompactCardProps) {
  const progress = path.progress ?? 0;

  return (
    <Link
      href={path.href}
      className="lingstack-card-v2 flex flex-col p-5 transition-transform hover:-translate-y-0.5 sm:p-6"
    >
      <h3 className="text-base font-semibold text-neutral-950">{path.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-neutral-500">
        {path.description}
      </p>

      {path.id === "ai-assisted" ? (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-medium">
            <span className="text-neutral-500">进度</span>
            <span className="text-[#6366F1]">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#EEEEEE]">
            <div
              className="h-full rounded-full bg-[#6366F1] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}
    </Link>
  );
}
