import type { ReactNode } from "react";

type HelpSectionCardProps = {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
};

export function HelpSectionCard({
  icon,
  title,
  children,
  className,
}: HelpSectionCardProps) {
  return (
    <section
      className={`lingstack-card-v2 p-5 sm:p-6 lg:p-8 ${className ?? ""}`}
    >
      <div className="flex items-start gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-neutral-950 sm:text-xl">
            {title}
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
