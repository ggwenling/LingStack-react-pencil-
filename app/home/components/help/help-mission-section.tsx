import { Lightbulb } from "lucide-react";

import { HelpSectionCard } from "./help-section-card";

export function HelpMissionSection() {
  return (
    <HelpSectionCard icon={<Lightbulb className="size-5" />} title="项目初衷">
      <p>
        LingStack 是一个专门为 React 和 Next.js 学习者打造的辅助工具。我们意识到现代前端框架的学习曲线日益陡峭，因此通过集成
        AI 聊天、结构化学习路线图以及实战练习工具，旨在降低初学者的「起步摩擦力」，让开发者能够更流畅地跨入全栈开发的门槛。
      </p>
      <p>
        它更像一块学习工作台：帮你整理路线、记录笔记、在卡住时获得引导，而不是替你完成所有思考。
      </p>
    </HelpSectionCard>
  );
}
