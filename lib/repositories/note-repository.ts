import { prisma } from "@/lib/db/prisma";

const NOTE_LIST_SELECT = {
  id: true,
  title: true,
  excerpt: true,
  tags: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const DEFAULT_NOTE_PAGE_SIZE = 30;

export function listNotesForUser(
  userId: string,
  options: { skip?: number; take?: number } = {},
) {
  const { skip = 0, take = DEFAULT_NOTE_PAGE_SIZE } = options;

  return prisma.learningNote.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    skip,
    take,
    select: NOTE_LIST_SELECT,
  });
}

export function countNotesForUser(userId: string) {
  return prisma.learningNote.count({
    where: {
      userId,
    },
  });
}

export function findNoteForUser(userId: string, id: string) {
  return prisma.learningNote.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export function createNote(input: {
  userId: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
}) {
  return prisma.learningNote.create({
    data: input,
    select: {
      id: true,
    },
  });
}

export function updateNoteForUser(input: {
  id: string;
  userId: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
}) {
  return prisma.learningNote.updateMany({
    where: {
      id: input.id,
      userId: input.userId,
    },
    data: {
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      tags: input.tags,
    },
  });
}

export function deleteNoteForUser(userId: string, id: string) {
  return prisma.learningNote.deleteMany({
    where: {
      id,
      userId,
    },
  });
}
