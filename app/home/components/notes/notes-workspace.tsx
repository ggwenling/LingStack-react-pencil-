"use client";

import {
  Check,
  Cloud,
  Download,
  FilePlus2,
  NotebookPen,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useRef, useState, useTransition } from "react";

import { NoteCodemirrorEditor } from "@/app/home/components/notes/note-codemirror-editor";

import {
  createNote,
  createNoteFromMarkdown,
  deleteNote,
  fetchNoteContent,
  loadMoreNotes,
  updateNote,
} from "@/app/home/notes/api/actions";
import {
  buildExcerpt,
  createMarkdownFileName,
  extractNoteTitle,
  formatNoteRelativeTime,
} from "@/lib/notes/storage";
import type { LearningNoteSummary, NoteTag } from "@/lib/notes/types";
import { NOTE_TAGS } from "@/lib/notes/types";
import { cn } from "@/lib/utils";

const MarkdownContent = dynamic(
  () =>
    import("@/app/home/components/markdown-content").then((module) => ({
      default: module.MarkdownContent,
    })),
  {
    loading: () => (
      <div className="min-h-[240px] animate-pulse rounded-lg bg-neutral-50" />
    ),
  },
);

type NotesWorkspaceProps = {
  initialNotes: LearningNoteSummary[];
  initialHasMore?: boolean;
  userName?: string | null;
};

type SaveStatus = "saved" | "dirty" | "saving" | "error";

function toggleTag(tags: NoteTag[], tag: NoteTag) {
  if (tags.includes(tag)) {
    return tags.length === 1 ? tags : tags.filter((item) => item !== tag);
  }

  return [...tags, tag];
}

function downloadMarkdown(title: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = createMarkdownFileName(title);
  anchor.click();
  URL.revokeObjectURL(url);
}

export function NotesWorkspace({
  initialNotes,
  initialHasMore = false,
  userName,
}: NotesWorkspaceProps) {
  const [notes, setNotes] = useState<LearningNoteSummary[]>(initialNotes);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [draftTags, setDraftTags] = useState<NoteTag[]>(["REACT"]);
  const [filter, setFilter] = useState("");
  const [activeTag, setActiveTag] = useState<NoteTag | null>(null);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [message, setMessage] = useState("");
  const [listPage, setListPage] = useState(0);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeNote = useMemo(
    () => notes.find((note) => note.id === activeId) ?? null,
    [notes, activeId],
  );

  const filteredNotes = useMemo(() => {
    const keyword = filter.trim().toLowerCase();

    return notes.filter((note) => {
      const matchesTag = !activeTag || note.tags.includes(activeTag);
      const matchesKeyword =
        !keyword ||
        note.title.toLowerCase().includes(keyword) ||
        note.excerpt.toLowerCase().includes(keyword);

      return matchesTag && matchesKeyword;
    });
  }, [notes, filter, activeTag]);

  function openNote(note: LearningNoteSummary) {
    setActiveId(note.id);
    setDraftTags(note.tags.length ? note.tags : ["REACT"]);
    setStatus("saving");
    setMessage("");

    startTransition(async () => {
      const result = await fetchNoteContent(note.id);

      if (!result.ok) {
        setStatus("error");
        setMessage(result.message);
        return;
      }

      setDraft(result.note.content);
      setStatus("saved");
      setMessage("");
    });
  }

  function syncActiveNote(patch: Partial<LearningNoteSummary>) {
    if (!activeId) {
      return;
    }

    setNotes((current) =>
      current.map((note) => (note.id === activeId ? { ...note, ...patch } : note)),
    );
  }

  function handleCreateNote() {
    setMessage("");
    startTransition(async () => {
      const id = await createNote();
      const now = new Date().toISOString();
      const nextNote: LearningNoteSummary = {
        id,
        title: "未命名笔记",
        excerpt: "空白笔记",
        tags: ["REACT"],
        createdAt: now,
        updatedAt: now,
      };

      setNotes((current) => [nextNote, ...current]);
      setDraft("# 未命名笔记\n\n在这里记录你的学习内容。\n");
      setActiveId(id);
      setDraftTags(["REACT"]);
      setStatus("saved");
    });
  }

  async function handleImportMarkdown(file: File) {
    setMessage("");

    if (!file.name.toLowerCase().endsWith(".md")) {
      setStatus("error");
      setMessage("请上传 .md Markdown 文件。");
      return;
    }

    const content = await file.text();

    startTransition(async () => {
      const result = await createNoteFromMarkdown(file.name, content);

      if (!result.ok) {
        setStatus("error");
        setMessage(result.message);
        return;
      }

      const now = new Date().toISOString();
      const title = extractNoteTitle(
        content,
        file.name.replace(/\.md$/i, "") || "导入的 Markdown 笔记",
      );
      const nextNote: LearningNoteSummary = {
        id: result.id,
        title,
        excerpt: buildExcerpt(content),
        tags: ["TYPESCRIPT"],
        createdAt: now,
        updatedAt: now,
      };

      setNotes((current) => [nextNote, ...current]);
      setActiveId(result.id);
      setDraft(content);
      setDraftTags(["TYPESCRIPT"]);
      setStatus("saved");
    });
  }

  function handleSave() {
    if (!activeNote) {
      return;
    }

    setStatus("saving");
    setMessage("");
    startTransition(async () => {
      const result = await updateNote(activeNote.id, draft, draftTags);

      if (!result.ok) {
        setStatus("error");
        setMessage(result.message);
        return;
      }

      syncActiveNote({
        title: result.title,
        excerpt: result.excerpt,
        tags: result.tags,
        updatedAt: result.updatedAt,
      });
      setStatus("saved");
      setMessage("已保存至云端");
    });
  }

  function handleDelete() {
    if (!activeNote) {
      return;
    }

    const deletingId = activeNote.id;
    setMessage("");
    startTransition(async () => {
      const result = await deleteNote(deletingId);

      if (!result.ok) {
        setStatus("error");
        setMessage(result.message);
        return;
      }

      setNotes((current) => {
        const next = current.filter((note) => note.id !== deletingId);
        const nextActive = next[0] ?? null;

        setActiveId(nextActive?.id ?? null);
        setDraft("");
        setDraftTags(nextActive?.tags.length ? nextActive.tags : ["REACT"]);
        setStatus("saved");

        return next;
      });
    });
  }

  function handleDraftChange(value: string) {
    setDraft(value);
    setStatus("dirty");
    setMessage("");
  }

  function handleTagToggle(tag: NoteTag) {
    setDraftTags((current) => toggleTag(current, tag));
    setStatus("dirty");
    setMessage("");
  }

  function handleLoadMore() {
    const nextPage = listPage + 1;
    startTransition(async () => {
      const result = await loadMoreNotes(nextPage);

      if (!result.ok) {
        return;
      }

      setNotes((current) => {
        const existingIds = new Set(current.map((note) => note.id));
        const appended = result.notes.filter((note) => !existingIds.has(note.id));
        return [...current, ...appended];
      });
      setListPage(nextPage);
      setHasMore(result.hasMore);
    });
  }

  const statusLabel =
    status === "saving"
      ? "保存中..."
      : status === "dirty"
        ? "未保存"
        : status === "error"
          ? "保存失败"
          : "已保存至云端";

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <div className="mb-6 flex flex-col gap-4 border-b border-neutral-200/80 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-neutral-950 text-white">
            <NotebookPen className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-neutral-950">学习笔记</h1>
            <p className="text-sm text-neutral-500">
              {userName ? `${userName} 的 Markdown 学习记录` : "Markdown 学习记录"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,text/markdown"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleImportMarkdown(file);
              }
              event.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="size-4" />
            上传 Markdown
          </button>
          <button
            type="button"
            onClick={() => activeNote && downloadMarkdown(activeNote.title, draft)}
            disabled={!activeNote}
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-4" />
            导出当前笔记
          </button>
          <button
            type="button"
            onClick={handleCreateNote}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FilePlus2 className="size-4" />
            新建笔记
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="lingstack-card-v2 flex max-h-[calc(100vh-14rem)] flex-col overflow-hidden">
          <div className="border-b border-neutral-200 p-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                placeholder="搜索标题、正文或摘要..."
                className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm text-neutral-950 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {NOTE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setActiveTag((current) => (current === tag ? null : tag))
                  }
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide transition-colors",
                    activeTag === tag
                      ? "bg-neutral-950 text-white"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800",
                  )}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {filteredNotes.length === 0 ? (
              <div className="px-2 py-10 text-center">
                <p className="text-sm font-semibold text-neutral-700">
                  {notes.length ? "没有匹配的笔记" : "还没有笔记"}
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-400">
                  {notes.length
                    ? "换个关键词或标签再试。"
                    : "新建一条 Markdown 笔记开始沉淀学习内容。"}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredNotes.map((note) => {
                  const active = note.id === activeId;

                  return (
                    <li key={note.id}>
                      <button
                        type="button"
                        onClick={() => openNote(note)}
                        className={cn(
                          "w-full rounded-xl border px-3 py-3 text-left transition-colors",
                          active
                            ? "border-neutral-300 bg-neutral-50"
                            : "border-transparent hover:border-neutral-200 hover:bg-neutral-50/80",
                        )}
                      >
                        <p className="line-clamp-1 text-sm font-semibold text-neutral-950">
                          {note.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">
                          {note.excerpt}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-[11px] font-medium text-neutral-400">
                            {formatNoteRelativeTime(note.updatedAt)}
                          </p>
                          <div className="flex min-w-0 gap-1">
                            {note.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {hasMore ? (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isPending}
                className="mt-3 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                加载更多
              </button>
            ) : null}
          </div>
        </aside>

        <section className="lingstack-card-v2 flex min-h-[560px] flex-col overflow-hidden">
          {activeNote ? (
            <>
              <div className="flex flex-col gap-3 border-b border-neutral-200 px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 text-sm font-medium",
                      status === "error"
                        ? "text-red-600"
                        : status === "dirty"
                          ? "text-amber-600"
                          : "text-neutral-500",
                    )}
                  >
                    <Cloud
                      className={cn(
                        "size-4",
                        status === "saved"
                          ? "text-emerald-500"
                          : status === "dirty"
                            ? "text-amber-500"
                            : status === "error"
                              ? "text-red-500"
                              : "text-neutral-400",
                      )}
                    />
                    {statusLabel}
                  </span>
                  {message ? (
                    <span className="text-xs font-medium text-neutral-400">
                      {message}
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {NOTE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide transition-colors",
                        draftTags.includes(tag)
                          ? "bg-neutral-950 text-white"
                          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-800",
                      )}
                    >
                      #{tag}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending || status === "saving"}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-neutral-950 px-3 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {status === "saved" ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Save className="size-3.5" />
                    )}
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isPending}
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="删除笔记"
                    title="删除笔记"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="grid min-h-0 flex-1 lg:grid-cols-2">
                <div className="flex min-h-[320px] flex-col border-b border-neutral-200 lg:border-b-0 lg:border-r">
                  <div className="border-b border-neutral-100 px-4 py-2 text-xs font-semibold tracking-wide text-neutral-400">
                    编辑
                  </div>
                  <div className="lingstack-note-editor min-h-0 flex-1 overflow-hidden">
                    <NoteCodemirrorEditor
                      value={draft}
                      onChange={handleDraftChange}
                    />
                  </div>
                </div>

                <div className="flex min-h-[320px] flex-col overflow-hidden">
                  <div className="border-b border-neutral-100 px-4 py-2 text-xs font-semibold tracking-wide text-neutral-400">
                    预览
                  </div>
                  <div className="flex-1 overflow-y-auto px-5 py-4">
                    <MarkdownContent content={draft} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <NotebookPen className="mx-auto size-8 text-neutral-300" />
                <p className="mt-3 text-sm font-semibold text-neutral-700">
                  选择或新建一条笔记
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  笔记会保存到数据库，刷新后仍然可用。
                </p>
                <button
                  type="button"
                  onClick={handleCreateNote}
                  disabled={isPending}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FilePlus2 className="size-4" />
                  新建笔记
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
