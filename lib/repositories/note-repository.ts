import { prisma } from "@/lib/db/prisma";

export function listNotesForUser(userId: string) {
  return prisma.learningNote.findMany({
    where: {
      userId,
    },
    orderBy: {
      updatedAt: "desc",
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
