import { prisma } from "@/lib/prisma";

export type AiTokenSource = "chat" | "progress_extract" | "exercise_grade";

export type RecordTokenUsageInput = {
  userId: string;
  threadId?: string | null;
  source: AiTokenSource;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export function createAiTokenUsage(input: RecordTokenUsageInput) {
  if (input.totalTokens <= 0) {
    return null;
  }

  return prisma.aiTokenUsage.create({
    data: {
      userId: input.userId,
      threadId: input.threadId ?? null,
      source: input.source,
      promptTokens: input.promptTokens,
      completionTokens: input.completionTokens,
      totalTokens: input.totalTokens,
    },
  });
}

export async function sumTotalTokens() {
  const result = await prisma.aiTokenUsage.aggregate({
    _sum: {
      totalTokens: true,
    },
  });

  return result._sum.totalTokens ?? 0;
}

export async function sumTokensSince(since: Date) {
  const result = await prisma.aiTokenUsage.aggregate({
    where: {
      createdAt: {
        gte: since,
      },
    },
    _sum: {
      totalTokens: true,
    },
  });

  return result._sum.totalTokens ?? 0;
}

export async function sumUserTokensSince(userId: string, since: Date) {
  const result = await prisma.aiTokenUsage.aggregate({
    where: {
      userId,
      createdAt: {
        gte: since,
      },
    },
    _sum: {
      totalTokens: true,
    },
  });

  return result._sum.totalTokens ?? 0;
}

export async function getDailyTokenTrend(since: Date) {
  const rows = await prisma.$queryRaw<
    Array<{ day: Date; tokens: bigint }>
  >`
    SELECT DATE_TRUNC('day', "createdAt") AS day, SUM("totalTokens")::bigint AS tokens
    FROM "AiTokenUsage"
    WHERE "createdAt" >= ${since}
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY day ASC
  `;

  return rows.map((row) => ({
    day: row.day,
    tokens: Number(row.tokens),
  }));
}

export async function getAverageTokensPerChatTurn(since: Date) {
  const [chatTotal, chatCount] = await Promise.all([
    prisma.aiTokenUsage.aggregate({
      where: {
        source: "chat",
        createdAt: {
          gte: since,
        },
      },
      _sum: {
        totalTokens: true,
      },
    }),
    prisma.aiTokenUsage.count({
      where: {
        source: "chat",
        createdAt: {
          gte: since,
        },
      },
    }),
  ]);

  const total = chatTotal._sum.totalTokens ?? 0;

  if (!chatCount || total <= 0) {
    return null;
  }

  return Math.round(total / chatCount);
}
