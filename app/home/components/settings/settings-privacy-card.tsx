import Link from "next/link";
import { ChevronRight, Mail, ShieldCheck } from "lucide-react";

import { HELP_CONTACT_EMAIL } from "@/lib/help/help-content";

export function SettingsPrivacyCard() {
  return (
    <section className="lingstack-card-v2 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
          <ShieldCheck className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-neutral-950">数据与隐私</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            学习记录与对话内容仅用于你的个人学习空间，不会对外公开。
          </p>

          <ul className="mt-4 divide-y divide-neutral-100">
            <li>
              <Link
                href="/home/help"
                className="flex items-center justify-between gap-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-950"
              >
                查看帮助中心
                <ChevronRight className="size-4 text-neutral-300" />
              </Link>
            </li>
            <li>
              <a
                href={`mailto:${HELP_CONTACT_EMAIL}`}
                className="flex items-center justify-between gap-3 py-3 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-950"
              >
                <span className="inline-flex items-center gap-2">
                  <Mail className="size-4 text-neutral-400" />
                  联系作者
                </span>
                <ChevronRight className="size-4 text-neutral-300" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
