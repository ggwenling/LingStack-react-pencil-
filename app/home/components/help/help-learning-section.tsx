import Link from "next/link";
import { BookOpen } from "lucide-react";

import { HELP_LEARNING_LINKS } from "@/lib/help/help-content";

import { HelpSectionCard } from "./help-section-card";

export function HelpLearningSection() {
  return (
    <HelpSectionCard icon={<BookOpen className="size-5" />} title="学习建议">
      <p>
        完全依靠 AI 生成代码，很难真正掌握开发思路。AI
        适合帮你解释概念、对照报错、拆解步骤，但「为什么这样设计」仍需要你自己动手验证。
      </p>
      <p>如果你希望扎实入门，可以参考这条路径：</p>
      <ol className="list-decimal space-y-2 pl-5">
        <li>
          先读官方文档，建立正确概念：
          {HELP_LEARNING_LINKS.map((link, index) => (
            <span key={link.href}>
              {index > 0 ? "、" : " "}
              <Link
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-950 underline decoration-neutral-300 underline-offset-2 transition-colors hover:decoration-neutral-500"
              >
                {link.label}
              </Link>
            </span>
          ))}
          。
        </li>
        <li>遇到难点时，配合 AI 提问，但尽量自己先尝试理解和修改。</li>
        <li>
          在 Bilibili
          等平台找完整项目教程，跟着视频或文档「手敲」一遍，比只看答案更有效。
        </li>
      </ol>
    </HelpSectionCard>
  );
}
