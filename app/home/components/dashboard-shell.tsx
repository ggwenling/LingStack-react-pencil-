import type { ReactNode } from "react";

import { FadeSlideIn } from "@/app/home/components/motion/ui";

import { WorkspaceTopbar } from "./workspace-topbar";

type DashboardShellProps = {
  userName?: string | null;
  main: ReactNode;
  aside: ReactNode;
};

export function DashboardShell({ userName, main, aside }: DashboardShellProps) {
  return (
    <section className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <FadeSlideIn>
        <WorkspaceTopbar userName={userName} />
      </FadeSlideIn>

      <div className="mt-6 grid flex-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] xl:gap-6">
        <FadeSlideIn className="space-y-5" delay={0.04}>
          {main}
        </FadeSlideIn>
        <FadeSlideIn className="space-y-5" delay={0.08}>
          {aside}
        </FadeSlideIn>
      </div>
    </section>
  );
}
