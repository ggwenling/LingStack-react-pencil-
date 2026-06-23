import { Check } from "lucide-react";

type SuccessNoticeProps = {
  title: string;
  description: string;
};

export function SuccessNotice({ title, description }: SuccessNoticeProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-6 z-50 flex w-[calc(100vw-48px)] max-w-[408px] -translate-x-1/2 items-center gap-3 rounded-lg border border-green-300 bg-white px-[18px] py-4 shadow-[0_18px_42px_-24px_rgba(15,23,42,0.22)]"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700">
        <Check className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold leading-5 text-slate-900">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-xs font-medium leading-5 text-slate-500">
          {description}
        </span>
      </span>
    </div>
  );
}
