import { AppError } from "@/lib/errors/app-error";
import {
  countNotesForUser,
  createNote as createNoteRecord,
  DEFAULT_NOTE_PAGE_SIZE,
  deleteNoteForUser,
  findNoteForUser,
  listNotesForUser,
  updateNoteForUser,
} from "@/lib/repositories/note-repository";
import {
  buildExcerpt,
  createDefaultNoteContent,
  extractNoteTitle,
} from "@/lib/notes/storage";
import type { LearningNote, LearningNoteSummary, NoteTag } from "@/lib/notes/types";
import { noteContentSchema, noteTagsSchema } from "@/lib/validation/notes";

type DbLearningNote = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

type DbLearningNoteSummary = Omit<DbLearningNote, "content">;

export function serializeNoteSummary(note: DbLearningNoteSummary): LearningNoteSummary {
  return {
    id: note.id,
    title: note.title,
    excerpt: note.excerpt,
    tags: note.tags as NoteTag[],
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

export function serializeNote(note: DbLearningNote): LearningNote {
  return {
    ...serializeNoteSummary(note),
    content: note.content,
  };
}

function normalizeImportedTitle(fileName: string, content: string) {
  const name = fileName.replace(/\.md$/i, "").trim();
  return extractNoteTitle(content, name || "导入的 Markdown 笔记");
}

export async function listLearningNoteSummaries(
  userId: string,
  options: { skip?: number; take?: number } = {},
) {
  const notes = await listNotesForUser(userId, options);
  return notes.map(serializeNoteSummary);
}

export async function getLearningNotePage(userId: string, page = 0) {
  const skip = page * DEFAULT_NOTE_PAGE_SIZE;
  const [notes, total] = await Promise.all([
    listLearningNoteSummaries(userId, {
      skip,
      take: DEFAULT_NOTE_PAGE_SIZE,
    }),
    countNotesForUser(userId),
  ]);

  return {
    notes,
    total,
    pageSize: DEFAULT_NOTE_PAGE_SIZE,
    hasMore: skip + notes.length < total,
  };
}

export async function getLearningNoteContent(userId: string, id: string) {
  const note = await findNoteForUser(userId, id);

  if (!note) {
    throw new AppError("NOT_FOUND", "没有找到这条笔记，或你没有权限查看它。");
  }

  return serializeNote(note);
}

export async function createLearningNote(userId: string) {
  const content = createDefaultNoteContent();
  const title = extractNoteTitle(content);

  return createNoteRecord({
    userId,
    title,
    excerpt: buildExcerpt(content),
    content,
    tags: ["REACT"],
  });
}

export async function createLearningNoteFromMarkdown(input: {
  userId: string;
  fileName: string;
  content: string;
}) {
  const parsedContent = noteContentSchema.safeParse(input.content);

  if (!parsedContent.success) {
    throw new AppError("BAD_REQUEST", "Markdown 内容过长，无法导入。");
  }

  return createNoteRecord({
    userId: input.userId,
    title: normalizeImportedTitle(input.fileName, parsedContent.data),
    excerpt: buildExcerpt(parsedContent.data),
    content: parsedContent.data,
    tags: ["TYPESCRIPT"],
  });
}

export async function updateLearningNote(input: {
  userId: string;
  id: string;
  content: string;
  tags: NoteTag[];
}) {
  const parsedContent = noteContentSchema.safeParse(input.content);
  const parsedTags = noteTagsSchema.safeParse(input.tags);

  if (!parsedContent.success) {
    throw new AppError("BAD_REQUEST", "笔记内容过长，无法保存。");
  }

  if (!parsedTags.success) {
    throw new AppError("BAD_REQUEST", "请选择至少一个有效标签。");
  }

  const title = extractNoteTitle(parsedContent.data);
  const excerpt = buildExcerpt(parsedContent.data);
  const result = await updateNoteForUser({
    id: input.id,
    userId: input.userId,
    title,
    excerpt,
    content: parsedContent.data,
    tags: parsedTags.data,
  });

  if (!result.count) {
    throw new AppError("NOT_FOUND", "没有找到这条笔记，或你没有权限修改它。");
  }

  return {
    title,
    excerpt,
    tags: parsedTags.data,
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteLearningNote(userId: string, id: string) {
  const result = await deleteNoteForUser(userId, id);

  if (!result.count) {
    throw new AppError("NOT_FOUND", "没有找到这条笔记，或你没有权限删除它。");
  }
}
