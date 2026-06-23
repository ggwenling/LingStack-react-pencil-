import Link from "next/link";
import { ExternalLink, GitBranch, Network } from "lucide-react";

import {
  HELP_GITHUB_URL,
  HELP_TECH_TAGS,
} from "@/lib/help/help-content";

import { HelpSectionCard } from "./help-section-card";

export function HelpInfoGrid() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <HelpSectionCard
        icon={<GitBranch className="size-5" />}
        title="开源与免费"
        className="h-full"
      >
        <p>
          LingStack 坚持开源精神，完全免费。你可以自由地学习、Fork
          或为它贡献代码。
        </p>
        <Link
          href={HELP_GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="lingstack-btn-primary mt-2 inline-flex h-10 items-center gap-2 px-4 text-[13px]"
        >
          <ExternalLink className="size-4" />
          查看 GitHub 仓库
        </Link>
      </HelpSectionCard>

      <HelpSectionCard
        icon={<Network className="size-5" />}
        title="技术边界"
        className="h-full"
      >
        <p>
          本项目后端对话能力基于 DeepSeek 提供的模型。为了保持轻量和纯粹，我们采用了直接封装
          LLM 能力的方案，当前没有接入 RAG，没有使用 LangChain，也没有进行微调。
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {HELP_TECH_TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-bold tracking-wide text-neutral-500"
            >
              {tag}
            </span>
          ))}
        </div>
      </HelpSectionCard>
    </div>
  );
}
