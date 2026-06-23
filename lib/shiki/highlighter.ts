import { createHighlighter, type Highlighter, type BundledLanguage } from "shiki";

const THEME = "github-dark";

const LANGS: BundledLanguage[] = [
  "javascript",
  "typescript",
  "tsx",
  "jsx",
  "json",
  "bash",
  "sql",
  "css",
  "html",
  "markdown",
  "yaml",
  "prisma",
  "shell",
];

const LANGUAGE_ALIASES: Record<string, BundledLanguage> = {
  ts: "typescript",
  js: "javascript",
  sh: "bash",
  shell: "shell",
  yml: "yaml",
  md: "markdown",
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEME],
      langs: LANGS,
    });
  }

  return highlighterPromise;
}

export function resolveLanguage(language: string): BundledLanguage {
  const normalized = language.trim().toLowerCase();
  return LANGUAGE_ALIASES[normalized] ?? (normalized as BundledLanguage);
}

export async function highlightCode(code: string, language: string) {
  const highlighter = await getHighlighter();
  const resolved = resolveLanguage(language);
  const lang = highlighter.getLoadedLanguages().includes(resolved)
    ? resolved
    : "typescript";

  return highlighter.codeToHtml(code, {
    lang,
    theme: THEME,
  });
}
