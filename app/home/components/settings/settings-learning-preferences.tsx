"use client";

import { useActionState, useState } from "react";

import { updateLearningPreferences } from "@/app/home/settings/api/actions";
import { cn } from "@/lib/utils";

type SettingsLearningPreferencesProps = {
  moduleFocus: "REACT" | "NEXT";
  responseStyle: "CONCISE" | "STANDARD" | "DETAILED";
  progressReminders: boolean;
};

const moduleOptions = [
  { value: "REACT" as const, label: "React" },
  { value: "NEXT" as const, label: "Next.js" },
];

const styleOptions = [
  { value: "CONCISE" as const, label: "简洁" },
  { value: "STANDARD" as const, label: "标准" },
  { value: "DETAILED" as const, label: "详细" },
];

const initialState = null;

export function SettingsLearningPreferences({
  moduleFocus,
  responseStyle,
  progressReminders,
}: SettingsLearningPreferencesProps) {
  const [state, formAction, pending] = useActionState(
    updateLearningPreferences,
    initialState,
  );
  const [remindersEnabled, setRemindersEnabled] = useState(progressReminders);

  return (
    <section className="lingstack-card-v2 p-5 sm:p-6 lg:p-8">
      <h2 className="text-lg font-semibold text-neutral-950">学习偏好</h2>
      <p className="mt-1 text-sm text-neutral-500">
        偏好会保存到你的账户，后续可逐步影响 AI 回复风格。
      </p>

      <form action={formAction} className="mt-6 space-y-6">
        <fieldset>
          <legend className="mb-3 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
            当前学习重点
          </legend>
          <div className="flex flex-wrap gap-2">
            {moduleOptions.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold transition-colors has-checked:border-neutral-950 has-checked:bg-neutral-950 has-checked:text-white",
                  "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50",
                )}
              >
                <input
                  type="radio"
                  name="moduleFocus"
                  value={option.value}
                  defaultChecked={moduleFocus === option.value}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
            AI 回复风格
          </legend>
          <div className="flex flex-wrap gap-2">
            {styleOptions.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold transition-colors has-checked:border-neutral-950 has-checked:bg-neutral-950 has-checked:text-white",
                  "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50",
                )}
              >
                <input
                  type="radio"
                  name="responseStyle"
                  value={option.value}
                  defaultChecked={responseStyle === option.value}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-100 bg-neutral-50/80 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-neutral-950">
              学习进度提醒
            </p>
            <p className="mt-0.5 text-xs text-neutral-500">
              在合适的时候提醒你继续当前学习路线。
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={remindersEnabled}
            onClick={() => setRemindersEnabled((current) => !current)}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              remindersEnabled ? "bg-neutral-950" : "bg-neutral-200",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
                remindersEnabled && "translate-x-5",
              )}
            />
          </button>
        </div>

        <input
          type="hidden"
          name="progressReminders"
          value={remindersEnabled ? "true" : "false"}
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="lingstack-btn-primary inline-flex h-10 items-center px-4 text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "保存中..." : "保存偏好"}
          </button>
          {state ? (
            <p
              className={cn(
                "text-sm",
                state.ok ? "text-emerald-600" : "text-red-600",
              )}
            >
              {state.message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
