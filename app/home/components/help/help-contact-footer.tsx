import { Mail } from "lucide-react";

import { HELP_CONTACT_EMAIL } from "@/lib/help/help-content";

export function HelpContactFooter() {
  return (
    <footer className="rounded-2xl border border-dashed border-neutral-200 bg-white/60 px-5 py-6 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-700">
            项目未来可能继续维护与迭代，但不承诺固定的更新周期。
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            如有问题、建议或合作意向，欢迎通过邮箱联系。
          </p>
        </div>
        <a
          href={`mailto:${HELP_CONTACT_EMAIL}`}
          className="lingstack-btn-ghost inline-flex h-10 shrink-0 items-center gap-2 px-4 text-[13px] font-semibold"
        >
          <Mail className="size-4" />
          {HELP_CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  );
}
