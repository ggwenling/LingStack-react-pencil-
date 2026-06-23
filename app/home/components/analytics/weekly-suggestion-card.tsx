"use client";

import { Sparkles } from "lucide-react";

type WeeklySuggestionCardProps = {
  suggestion: string;
};

export function WeeklySuggestionCard({ suggestion }: WeeklySuggestionCardProps) {
  return (
    <article className="lingstack-card-v2 flex h-full flex-col justify-between bg-gradient-to-br from-[#F8FAFF] to-white p-5 sm:p-6">
      <div className="flex size-10 items-center justify-center rounded-xl bg-[#E8EEFF] text-[#2170E4]">
        <Sparkles className="size-5" />
      </div>

      <div className="mt-4">
        <h2 className="text-base font-bold text-neutral-950">本周建议</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-600">{suggestion}</p>
      </div>
    </article>
  );
}
