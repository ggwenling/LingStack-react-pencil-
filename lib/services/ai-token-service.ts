import {
  createAiTokenUsage,
  getAverageTokensPerChatTurn,
  getDailyTokenTrend,
  sumTokensSince,
  sumTotalTokens,
  type AiTokenSource,
  type RecordTokenUsageInput,
} from "@/lib/repositories/ai-token-repository";

const DEFAULT_SYSTEM_TOKEN_QUOTA = 1_000_000;
const FALLBACK_TOKENS_PER_TURN = 2_000;

export function getSystemTokenQuota() {
  const raw = process.env.AI_SYSTEM_TOKEN_QUOTA;

  if (!raw) {
    return DEFAULT_SYSTEM_TOKEN_QUOTA;
  }

  const parsed = Number.parseInt(raw, 10);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_SYSTEM_TOKEN_QUOTA;
}

type UsageLike = {
  promptTokens?: number;
  completionTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

function normalizeUsage(usage?: UsageLike | null) {
  const promptTokens = usage?.promptTokens ?? usage?.inputTokens ?? 0;
  const completionTokens = usage?.completionTokens ?? usage?.outputTokens ?? 0;
  const totalTokens =
    usage?.totalTokens ?? promptTokens + completionTokens;

  return {
    promptTokens,
    completionTokens,
    totalTokens,
  };
}

export async function recordAiTokenUsage(input: {
  userId: string;
  threadId?: string | null;
  source: AiTokenSource;
  usage?: UsageLike | null;
}) {
  const normalized = normalizeUsage(input.usage);

  const payload: RecordTokenUsageInput = {
    userId: input.userId,
    threadId: input.threadId,
    source: input.source,
    promptTokens: normalized.promptTokens,
    completionTokens: normalized.completionTokens,
    totalTokens: normalized.totalTokens,
  };

  try {
    return await createAiTokenUsage(payload);
  } catch (error) {
    console.error("Failed to record AI token usage", error);
    return null;
  }
}

function getWeekAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 6);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getThirtyDaysAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
}

const WEEKDAY_LABELS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function formatDayLabel(date: Date) {
  return WEEKDAY_LABELS[date.getDay()];
}

function buildLast7DayBuckets() {
  const buckets: Array<{ date: string; label: string; dayStart: Date }> = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - offset);

    const date = dayStart.toISOString().slice(0, 10);

    buckets.push({
      date,
      label: formatDayLabel(dayStart),
      dayStart,
    });
  }

  return buckets;
}

export async function getSystemTokenStats() {
  const weekAgo = getWeekAgo();
  const thirtyDaysAgo = getThirtyDaysAgo();
  const quota = getSystemTokenQuota();

  const [totalUsed, weeklyUsed, trendRows, avgTokensPerTurn] =
    await Promise.all([
      sumTotalTokens(),
      sumTokensSince(weekAgo),
      getDailyTokenTrend(weekAgo),
      getAverageTokensPerChatTurn(thirtyDaysAgo),
    ]);

  const remaining = Math.max(0, quota - totalUsed);
  const tokensPerTurn = avgTokensPerTurn ?? FALLBACK_TOKENS_PER_TURN;
  const estimatedTurnsRemaining = Math.max(
    0,
    Math.floor(remaining / tokensPerTurn),
  );

  const trendMap = new Map(
    trendRows.map((row) => [row.day.toISOString().slice(0, 10), row.tokens]),
  );

  const trend7d = buildLast7DayBuckets().map((bucket) => ({
    date: bucket.date,
    label: bucket.label,
    tokens: trendMap.get(bucket.date) ?? 0,
  }));

  return {
    remaining,
    totalUsed,
    weeklyUsed,
    quota,
    estimatedTurnsRemaining,
    trend7d,
  };
}
