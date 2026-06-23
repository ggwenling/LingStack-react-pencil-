import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateObject } from "ai";

import {
  gradingResultSchema,
  type GradingCriteriaResult,
  type GradingResult,
} from "@/lib/validation/exercise";

import type { ExerciseRubricItem, ExerciseTemplate } from "./exercise-catalog";
import {
  buildGradingPrompt,
  buildGradingSystemPrompt,
  GRADING_PROMPT_VERSION,
} from "./grading-prompts";
import { runStaticChecksForRubric } from "./static-checks";

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
});

const GRADING_MODEL = process.env.DEEPSEEK_GRADING_MODEL ?? "deepseek-chat";

export type MergedCriteriaResult = GradingCriteriaResult & {
  label: string;
  source: "static" | "ai" | "merged";
};

export type FinalizedGrade = {
  passed: boolean;
  score: number;
  feedback: string;
  criteriaResults: MergedCriteriaResult[];
  nextHint?: string;
  staticResult: Record<string, boolean>;
  aiResult: GradingResult;
  promptVersion: string;
  model: string;
};

export function mergeCriteriaResults(
  template: ExerciseTemplate,
  staticResults: Record<string, boolean>,
  aiResult: GradingResult,
): MergedCriteriaResult[] {
  return template.rubric.map((item) => {
    const staticMet = staticResults[item.id];
    const aiItem = aiResult.criteriaResults.find(
      (criteria) => criteria.id === item.id,
    );

    if (staticMet !== undefined) {
      return {
        id: item.id,
        label: item.label,
        met: staticMet,
        reason: staticMet
          ? "静态检查通过"
          : aiItem?.reason || "静态检查未通过",
        source: "static" as const,
      };
    }

    return {
      id: item.id,
      label: item.label,
      met: aiItem?.met ?? false,
      reason: aiItem?.reason ?? "AI 未返回该项结果",
      source: "ai" as const,
    };
  });
}

export function calculateScoreFromCriteria(
  rubric: ExerciseRubricItem[],
  criteriaResults: MergedCriteriaResult[],
) {
  const totalWeight = rubric.reduce((sum, item) => sum + item.weight, 0) || 100;

  const earned = rubric.reduce((sum, item) => {
    const result = criteriaResults.find((criteria) => criteria.id === item.id);

    if (!result?.met) {
      return sum;
    }

    return sum + item.weight;
  }, 0);

  return Math.round((earned / totalWeight) * 100);
}

export function finalizePassed(input: {
  template: ExerciseTemplate;
  aiResult: GradingResult;
  staticResults: Record<string, boolean>;
  criteriaResults: MergedCriteriaResult[];
  score: number;
}) {
  const requiredOk = input.template.requiredCriteriaIds.every((id) => {
    const staticMet = input.staticResults[id];
    const criteriaMet = input.criteriaResults.find(
      (item) => item.id === id,
    )?.met;

    if (staticMet !== undefined) {
      return staticMet;
    }

    return criteriaMet ?? false;
  });

  const scoreOk = input.score >= input.template.passScore;

  return input.aiResult.passed && scoreOk && requiredOk;
}

export function runStaticChecks(
  code: string,
  template: ExerciseTemplate,
) {
  return runStaticChecksForRubric(code, template.rubric);
}

export async function gradeWithAi(code: string, template: ExerciseTemplate) {
  const { object, usage } = await generateObject({
    model: deepseek(GRADING_MODEL),
    schema: gradingResultSchema,
    temperature: 0.1,
    system: buildGradingSystemPrompt(),
    prompt: buildGradingPrompt(template, code),
  });

  return {
    result: object,
    usage,
    model: GRADING_MODEL,
    promptVersion: GRADING_PROMPT_VERSION,
  };
}

export async function gradeSubmission(
  code: string,
  template: ExerciseTemplate,
): Promise<FinalizedGrade & { usage: { inputTokens: number; outputTokens: number; totalTokens: number } }> {
  const staticResult = runStaticChecks(code, template);
  const { result: aiResult, model, promptVersion, usage } = await gradeWithAi(
    code,
    template,
  );
  const criteriaResults = mergeCriteriaResults(template, staticResult, aiResult);
  const score = calculateScoreFromCriteria(template.rubric, criteriaResults);
  const passed = finalizePassed({
    template,
    aiResult,
    staticResults: staticResult,
    criteriaResults,
    score,
  });

  const normalizedUsage = {
    inputTokens: usage.inputTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
    totalTokens: usage.totalTokens ?? 0,
  };

  return {
    passed,
    score,
    feedback: aiResult.feedback,
    criteriaResults,
    nextHint: aiResult.nextHint,
    staticResult,
    aiResult,
    promptVersion,
    model,
    usage: normalizedUsage,
  };
}
