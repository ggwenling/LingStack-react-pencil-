"use client";

import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { useMemo } from "react";

const EXERCISE_EDITOR_FONT =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

const exerciseEditorTheme = EditorView.theme(
  {
    "&": {
      height: "100%",
      backgroundColor: "#fafafa",
    },
    "&.cm-focused": {
      outline: "none",
    },
    ".cm-scroller": {
      fontFamily: EXERCISE_EDITOR_FONT,
      lineHeight: "1.6",
    },
    ".cm-content": {
      fontFamily: EXERCISE_EDITOR_FONT,
      fontSize: "13px",
      caretColor: "#171717",
      padding: "12px 0",
    },
    ".cm-line": {
      padding: "0 12px",
    },
    ".cm-gutters": {
      backgroundColor: "#f5f5f5",
      borderRight: "1px solid #e5e5e5",
    },
  },
  { dark: false },
);

type ExerciseCodemirrorEditorProps = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  fill?: boolean;
};

export function ExerciseCodemirrorEditor({
  value,
  onChange,
  readOnly = false,
  fill = false,
}: ExerciseCodemirrorEditorProps) {
  const extensions = useMemo(
    () => [javascript({ typescript: true, jsx: true }), exerciseEditorTheme],
    [],
  );

  return (
    <div className={fill ? "h-full min-h-[10rem]" : undefined}>
      <CodeMirror
        value={value}
        height={fill ? "100%" : "280px"}
        className={fill ? "h-full overflow-hidden rounded-lg border border-[#E8E8E8]" : undefined}
        extensions={extensions}
        onChange={onChange}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: true,
        }}
      />
    </div>
  );
}
