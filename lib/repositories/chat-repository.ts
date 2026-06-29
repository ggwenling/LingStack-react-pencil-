import { prisma } from "@/lib/db/prisma";

export function findLatestThread(userId: string) {
  return prisma.chatThread.findFirst({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export function createThread(input: {
  userId: string;
  title: string;
  module?: "REACT" | "NEXT";
}) {
  return prisma.chatThread.create({
    data: {
      userId: input.userId,
      title: input.title,
      module: input.module,
    },
  });
}

export function findThreadForUser(userId: string, threadId: string) {
  return prisma.chatThread.findFirst({
    where: {
      id: threadId,
      userId,
      deletedAt: null,
    },
  });
}

export function findThreadWithMessagesForUser(userId: string, threadId: string) {
  return prisma.chatThread.findFirst({
    where: {
      id: threadId,
      userId,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        take: 50,
        select: {
          id: true,
          role: true,
          content: true,
        },
      },
    },
  });
}

export function listSidebarThreads(userId: string) {
  return prisma.chatThread.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 20,
    select: {
      id: true,
      title: true,
      updatedAt: true,
      module: true,
    },
  });
}

export function softDeleteThread(userId: string, threadId: string) {
  return prisma.chatThread.updateMany({
    where: {
      id: threadId,
      userId,
      deletedAt: null,
    },
    data: {
      deletedAt: new Date(),
    },
  });
}

export function renameThread(input: {
  userId: string;
  threadId: string;
  title: string;
}) {
  return prisma.chatThread.updateMany({
    where: {
      id: input.threadId,
      userId: input.userId,
      deletedAt: null,
    },
    data: {
      title: input.title,
    },
  });
}

export function findLatestThreadByModule(userId: string, module: "REACT" | "NEXT") {
  return prisma.chatThread.findFirst({
    where: {
      userId,
      module,
      deletedAt: null,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export function hasThreadMessages(threadId: string) {
  return prisma.chatMessage
    .findFirst({
      where: {
        threadId,
      },
      select: {
        id: true,
      },
    })
    .then((message) => message !== null);
}

export function findUserStudyDays(userId: string, since: Date) {
  return prisma.$queryRaw<Array<{ day: Date }>>`
    SELECT DISTINCT (
      DATE_TRUNC('day', m."createdAt" AT TIME ZONE 'Asia/Hong_Kong') + INTERVAL '12 hours'
    ) AS day
    FROM "ChatMessage" m
    INNER JOIN "ChatThread" t ON t.id = m."threadId"
    WHERE t."userId" = ${userId}
      AND t."deletedAt" IS NULL
      AND m.role = 'user'
      AND m."createdAt" >= ${since}
    ORDER BY day DESC
  `;
}

export function countUserMessagesSince(threadId: string, since: Date) {
  return prisma.chatMessage.count({
    where: {
      threadId,
      role: "user",
      createdAt: {
        gte: since,
      },
    },
  });
}

export function createChatMessage(input: {
  threadId: string;
  role: string;
  content: string;
}) {
  return prisma.chatMessage.create({
    data: input,
  });
}

export function touchThread(threadId: string, data: { title?: string } = {}) {
  return prisma.chatThread.update({
    where: {
      id: threadId,
    },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
}

export function findRecentMessages(threadId: string, take: number) {
  return prisma.chatMessage.findMany({
    where: {
      threadId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take,
  });
}
