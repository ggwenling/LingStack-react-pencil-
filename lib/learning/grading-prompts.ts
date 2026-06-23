import type { ExerciseTemplate } from "./exercise-catalog";

export const GRADING_PROMPT_VERSION = "v1";

export function buildGradingSystemPrompt() {
  return `你是 LingStack 的代码练习判题助手。根据题目要求与评分标准，评估用户提交的 React/TypeScript 代码。

规则：
1. 只输出结构化 JSON，不要输出解释性段落。
2. 逐项评估 rubric 中的每个 criteriaId，给出 met 与 reason。
3. 你的 passed 和 score 只是建议，最终由服务端裁决。
4. 对标记为 aiOnly 的评分项，重点评估语义与实现质量。
5. 如果代码明显未完成或无关，对应项 met 应为 false。
6. 使用中文填写 feedback 和 reason。`;
}

export function buildGradingPrompt(template: ExerciseTemplate, code: string) {
  const rubricLines = template.rubric
    .map(
      (item) =>
        `- ${item.id}: ${item.label}（权重 ${item.weight}${item.aiOnly ? "，AI 判定" : ""}）`,
    )
    .join("\n");

  const requirementLines = template.requirements
    .map((item, index) => `${index + 1}. ${item}`)
    .join("\n");

  return `
题目：${template.title}
说明：${template.description}

要求：
${requirementLines}

评分标准：
${rubricLines}

通过建议分数：${template.passScore}
必选项：${template.requiredCriteriaIds.join("、")}

用户提交的代码：
\`\`\`tsx
${code}
\`\`\`

请评估每项 criteriaId 是否满足，并给出总分与总体反馈。对于未满足的必选项，在 nextHint 中给出可执行的改进提示。
`;
}
