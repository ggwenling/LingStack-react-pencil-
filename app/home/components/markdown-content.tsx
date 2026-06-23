"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { HighlightedCodeBlock } from "@/app/home/components/highlighted-code-block";
import { cn } from "@/lib/utils";

type MarkdownContentProps = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn("lingstack-markdown text-[15px] leading-7 text-neutral-700", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="my-3 first:mt-0 last:mb-0">{children}</p>
          ),
          h1: ({ children }) => (
            <h1 className="mb-3 mt-6 text-2xl font-extrabold leading-8 text-neutral-950 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 mt-5 text-xl font-extrabold leading-7 text-neutral-950 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2.5 mt-4 flex items-center gap-2 text-base font-extrabold leading-6 text-neutral-950 first:mt-0">
              <span className="size-2 shrink-0 rounded-full bg-cyan-500" aria-hidden="true" />
              <span>{children}</span>
            </h3>
          ),
          ul: ({ children, className: listClassName }) => (
            <ul
              className={cn(
                "my-3 space-y-1.5 pl-5",
                listClassName?.includes("contains-task-list")
                  ? "list-none pl-1"
                  : "list-disc",
                listClassName,
              )}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1.5 pl-5">{children}</ol>
          ),
          li: ({ children, className: itemClassName }) => (
            <li
              className={cn(
                "pl-1",
                itemClassName?.includes("task-list-item") &&
                  "flex list-none items-start gap-2 pl-0",
                itemClassName,
              )}
            >
              {children}
            </li>
          ),
          input: ({ checked }) => (
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mt-1.5 size-4 shrink-0 rounded border-neutral-300 accent-neutral-950"
            />
          ),
          strong: ({ children }) => (
            <strong className="font-extrabold text-neutral-950">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-neutral-950 underline underline-offset-4 hover:text-neutral-600"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 rounded-lg border border-neutral-200 bg-neutral-50 py-3 pl-4 pr-3 text-neutral-700 [&>p]:my-0">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-neutral-200" />,
          code: ({ children, className: codeClassName }) => {
            const isBlock = codeClassName?.startsWith("language-");

            if (isBlock && codeClassName) {
              const language = codeClassName.replace("language-", "");
              const code = String(children).replace(/\n$/, "");

              return <HighlightedCodeBlock code={code} language={language} />;
            }

            return (
              <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[0.92em] font-semibold text-neutral-900">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-neutral-200">
              <table className="w-full border-collapse text-left text-[13px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-neutral-50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-neutral-200 px-3 py-2 font-extrabold text-neutral-950">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-neutral-100 px-3 py-2 align-top">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
