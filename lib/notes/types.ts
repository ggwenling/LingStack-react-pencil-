export type NoteTag =
  | "REACT"
  | "NEXTJS"
  | "AI_AGENT"
  | "TYPESCRIPT"
  | "CSS"
  | "DATABASE";

export type LearningNote = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  tags: NoteTag[];
  createdAt: string;
  updatedAt: string;
};

export type LearningNoteSummary = Omit<LearningNote, "content">;

export const NOTE_TAGS: NoteTag[] = [
  "REACT",
  "NEXTJS",
  "AI_AGENT",
  "TYPESCRIPT",
  "CSS",
  "DATABASE",
];
