"use client";

import { EditorView } from "@codemirror/view";
import { markdown } from "@codemirror/lang-markdown";
import CodeMirror from "@uiw/react-codemirror";
import { useMemo } from "react";

const NOTE_EDITOR_FONT =
  'var(--font-sans), var(--font-sans-sc), "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif';

const noteEditorTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      backgroundColor: "transparent",
    },
    "&.cm-focused": {
      outline: "none",
    },
    ".cm-scroller": {
      fontFamily: NOTE_EDITOR_FONT,
      lineHeight: "1.75",
    },
    ".cm-content": {
      fontFamily: NOTE_EDITOR_FONT,
      fontSize: "15px",
      fontWeight: "400",
      lineHeight: "1.75",
      letterSpacing: "0.01em",
      color: "#404040",
      caretColor: "#171717",
      padding: "16px 0",
    },
    ".cm-line": {
      padding: "0 16px",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#171717",
    },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "rgba(23, 23, 23, 0.08)",
    },
    ".cm-gutters": {
      display: "none",
    },
  },
  { dark: false },
);

type NoteCodemirrorEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function NoteCodemirrorEditor({ value, onChange }: NoteCodemirrorEditorProps) {
  const extensions = useMemo(() => [markdown(), noteEditorTheme], []);

  return (
    <CodeMirror
      value={value}
      height="100%"
      minHeight="440px"
      extensions={extensions}
      basicSetup={{
        foldGutter: false,
        highlightActiveLine: false,
        lineNumbers: false,
      }}
      onChange={onChange}
      className="h-full"
    />
  );
}
