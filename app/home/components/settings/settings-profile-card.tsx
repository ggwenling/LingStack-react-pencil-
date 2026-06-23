"use client";

import { useActionState } from "react";
import { Pencil } from "lucide-react";

import { updateProfile } from "@/app/home/settings/api/actions";
import { cn } from "@/lib/utils";

type SettingsProfileCardProps = {
  name: string;
  email: string;
  status: string;
};

const initialState = null;

export function SettingsProfileCard({
  name,
  email,
  status,
}: SettingsProfileCardProps) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);
  const initial = name.charAt(0).toUpperCase() || "L";

  return (
    <section className="lingstack-card-v2 p-5 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <div className="flex size-20 items-center justify-center rounded-full bg-neutral-950 text-2xl font-bold text-white">
            {initial}
          </div>
          <span className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-400">
            <Pencil className="size-3.5" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-neutral-950">个人资料</h2>
          <p className="mt-1 text-sm text-neutral-500">
            邮箱用于登录，暂不支持在此修改。
          </p>

          <form action={formAction} className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="settings-name"
                className="mb-1.5 block text-xs font-semibold tracking-wide text-neutral-500 uppercase"
              >
                显示昵称
              </label>
              <input
                id="settings-name"
                name="name"
                defaultValue={name}
                maxLength={32}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-950 outline-none transition-colors focus:border-neutral-400"
              />
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                邮箱
              </p>
              <p className="text-sm text-neutral-700">{email}</p>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                账户状态
              </p>
              <p className="text-sm text-neutral-700">
                {status === "ACTIVE" ? "已激活" : status}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={pending}
                className="lingstack-btn-primary inline-flex h-10 items-center px-4 text-[13px] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "保存中..." : "保存资料"}
              </button>
              <button
                type="button"
                disabled
                title="暂不支持上传头像"
                className="lingstack-btn-ghost inline-flex h-10 items-center px-4 text-[13px] opacity-50"
              >
                更换头像
              </button>
            </div>

            {state ? (
              <p
                className={cn(
                  "text-sm",
                  state.ok ? "text-emerald-600" : "text-red-600",
                )}
              >
                {state.ok ? state.message : state.message}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
