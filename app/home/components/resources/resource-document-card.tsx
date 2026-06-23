import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Clock,
  Database,
  FileText,
  GitBranch,
  Layers,
  Palette,
  Route,
  Sparkles,
  Terminal,
  Wand2,
} from "lucide-react";

import type { ResourceDocument } from "@/lib/learning/resources-page-types";
import { cn } from "@/lib/utils";

const iconConfig = {
  react: {
    Icon: FileText,
    className: "bg-neutral-950 text-white",
    decor: "opacity-[0.06]",
  },
  next: {
    Icon: Wand2,
    className: "bg-[#6366F1] text-white",
    decor: "text-[#6366F1]/10",
  },
  tailwind: {
    Icon: Palette,
    className: "bg-[#10B981] text-white",
    decor: "text-[#10B981]/10",
  },
  shadcn: {
    Icon: Layers,
    className: "bg-neutral-900 text-white",
    decor: "text-neutral-900/10",
  },
  antd: {
    Icon: Sparkles,
    className: "bg-[#1677FF] text-white",
    decor: "text-[#1677FF]/10",
  },
  router: {
    Icon: Route,
    className: "bg-[#E11D48] text-white",
    decor: "text-[#E11D48]/10",
  },
  redux: {
    Icon: GitBranch,
    className: "bg-[#764ABC] text-white",
    decor: "text-[#764ABC]/10",
  },
  prisma: {
    Icon: Database,
    className: "bg-[#2D3748] text-white",
    decor: "text-[#2D3748]/10",
  },
  drizzle: {
    Icon: Terminal,
    className: "bg-[#C9632E] text-white",
    decor: "text-[#C9632E]/10",
  },
  postgres: {
    Icon: Database,
    className: "bg-[#336791] text-white",
    decor: "text-[#336791]/10",
  },
  leetcode: {
    Icon: BarChart3,
    className: "bg-[#FFA116] text-white",
    decor: "text-[#FFA116]/10",
  },
  mdn: {
    Icon: BookOpen,
    className: "bg-[#000000] text-white",
    decor: "text-black/10",
  },
} as const;

const defaultIconConfig = {
  Icon: BookOpen,
  className: "bg-neutral-700 text-white",
  decor: "text-neutral-700/10",
} as const;

type ResourceDocumentCardProps = {
  document: ResourceDocument;
};

export function ResourceDocumentCard({ document }: ResourceDocumentCardProps) {
  const config = iconConfig[document.icon] ?? defaultIconConfig;
  const Icon = config.Icon;

  return (
    <Link
      href={document.href}
      target="_blank"
      rel="noreferrer"
      className="group lingstack-card-v2 relative flex min-h-[240px] flex-col overflow-hidden p-6 transition-transform hover:-translate-y-0.5"
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-4 -bottom-4 opacity-40",
          config.decor,
        )}
      >
        <Icon className="size-24" strokeWidth={1} />
      </div>

      <span
        className={cn(
          "relative z-[1] flex size-10 items-center justify-center rounded-lg",
          config.className,
        )}
      >
        <Icon className="size-5" strokeWidth={2} />
      </span>

      <h3 className="relative z-[1] mt-5 text-lg font-semibold text-neutral-950">
        {document.title}
      </h3>
      <p className="relative z-[1] mt-2 flex-1 text-sm leading-6 text-neutral-500">
        {document.description}
      </p>

      <div className="relative z-[1] mt-6 flex items-center gap-4 text-xs font-medium text-neutral-500">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" />
          {document.hours} 小时
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BarChart3 className="size-3.5" />
          {document.level}
        </span>
      </div>
    </Link>
  );
}
