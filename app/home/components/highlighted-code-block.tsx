"use client";

import { useEffect, useState } from "react";

import { highlightCode } from "@/lib/shiki/highlighter";
import { cn } from "@/lib/utils";

type HighlightedCodeBlockProps = {
  code: string;
  language: string;
};

export function HighlightedCodeBlock({
  code,
  language,
}: HighlightedCodeBlockProps) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    highlightCode(code, language)
      .then((result) => {
        if (!cancelled) {
          setHtml(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHtml(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  if (!html) {
    return (
      <pre
        className={cn(
          "my-4 overflow-x-auto rounded-lg bg-slate-950 px-4 py-3",
          "text-[13px] font-medium leading-6 text-slate-300",
        )}
      >
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className={cn(
        "lingstack-shiki my-4 overflow-x-auto rounded-lg bg-slate-950",
        "[&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:px-4 [&_pre]:py-3",
        "[&_pre]:text-[13px] [&_pre]:leading-6 [&_code]:font-mono",
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
