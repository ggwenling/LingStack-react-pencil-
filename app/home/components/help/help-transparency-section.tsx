import { Code2 } from "lucide-react";

import { HelpSectionCard } from "./help-section-card";

export function HelpTransparencySection() {
  return (
    <HelpSectionCard icon={<Code2 className="size-5" />} title="开发方式说明">
      <p>
        这是一个高度透明的「AI 协作项目」。本项目的大部分代码实现由 AI
        辅助完成（即所谓的 vibe coding），作者在此基础上持续审查、修改与整合。
      </p>

      <div className="grid gap-4 pt-1 sm:grid-cols-2 sm:gap-6">
        <div className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-4">
          <h3 className="text-sm font-semibold text-neutral-950">作者职责</h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            整体框架构建、产品方向定义、后端逻辑监督、Prompt
            指导，以及代码审查与人工修改。
          </p>
        </div>
        <div className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-4">
          <h3 className="text-sm font-semibold text-neutral-950">AI 职责</h3>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            模块化组件实现、逻辑推演、单元测试草稿、基础样板代码编写，以及重复性工作的加速。
          </p>
        </div>
      </div>

      <p className="text-sm text-neutral-500">
        注：这是一个 AI 驱动的教学演示项目，而非旨在解决数百万高并发请求的重型商业化产品。
      </p>
    </HelpSectionCard>
  );
}
