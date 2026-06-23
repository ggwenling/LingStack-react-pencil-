"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/require-user";
import { AppError } from "@/lib/errors/app-error";
import {
  createLearningNote,
  createLearningNoteFromMarkdown,
  deleteLearningNote,
  updateLearningNote,
} from "@/lib/services/note-service";
import type { NoteTag } from "@/lib/notes/types";

type ActionFailure = {
  ok: false;
  message: string;
};

type CreateNoteFromMarkdownResult =
  | ActionFailure
  | {
      ok: true;
      id: string;
    };

type UpdateNoteResult =
  | ActionFailure
  | {
      ok: true;
      title: string;
      excerpt: string;
      tags: NoteTag[];
      updatedAt: string;
    };

type DeleteNoteResult =
  | ActionFailure
  | {
      ok: true;
    };

function actionFailure(error: AppError): ActionFailure {
  return {
    ok: false,
    message: error.message,
  };
}

export async function createNote() {
  const user = await requireUser();
  const note = await createLearningNote(user.id);

  revalidatePath("/home/notes");
  return note.id;
}

export async function createNoteFromMarkdown(
  fileName: string,
  content: string,
): Promise<CreateNoteFromMarkdownResult> {
  const user = await requireUser();

  try {
    const note = await createLearningNoteFromMarkdown({
      userId: user.id,
      fileName,
      content,
    });

    revalidatePath("/home/notes");

    return {
      ok: true,
      id: note.id,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return actionFailure(error);
    }

    throw error;
  }
}

export async function updateNote(
  id: string,
  content: string,
  tags: NoteTag[],
): Promise<UpdateNoteResult> {
  const user = await requireUser();

  try {
    const result = await updateLearningNote({
      userId: user.id,
      id,
      content,
      tags,
    });

    revalidatePath("/home/notes");

    return {
      ok: true,
      ...result,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return actionFailure(error);
    }

    throw error;
  }
}

export async function deleteNote(id: string): Promise<DeleteNoteResult> {
  const user = await requireUser();

  try {
    await deleteLearningNote(user.id, id);
    revalidatePath("/home/notes");

    return {
      ok: true,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return actionFailure(error);
    }

    throw error;
  }
}
