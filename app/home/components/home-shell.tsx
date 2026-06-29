"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { isAiRoute } from "@/lib/home/routes";
import { cn } from "@/lib/utils";

import { IconSidebar } from "./icon-sidebar";
import { MobileNavBar } from "./mobile-nav-bar";
import { SessionSidebar } from "./session-sidebar";
import { SidebarExpandProvider } from "./sidebar-expand-context";
import { ThreadSearchProvider } from "./thread-search-context";

type HomeShellProps = {
  threads: Array<{
    id: string;
    title: string;
    updatedAt: string | Date;
    module: "REACT" | "NEXT";
  }>;
  children: ReactNode;
};

export function HomeShell({ threads, children }: HomeShellProps) {
  const pathname = usePathname();
  const showSessionSidebar = isAiRoute(pathname);

  return (
    <ThreadSearchProvider>
      <SidebarExpandProvider>
        <div className="lingstack-page-bg flex min-h-screen text-neutral-950 lg:h-screen lg:overflow-hidden">
          <IconSidebar />
          {showSessionSidebar ? <SessionSidebar threads={threads} /> : null}
          <main
            className={cn(
              "min-w-0 flex-1 lg:min-h-0",
              showSessionSidebar ? "lg:overflow-hidden" : "lg:overflow-y-auto",
            )}
          >
            <div
              className={cn(
                "pb-16 lg:pb-0",
                showSessionSidebar && "lg:h-full lg:min-h-0",
              )}
            >
              {children}
            </div>
          </main>
          <MobileNavBar />
        </div>
      </SidebarExpandProvider>
    </ThreadSearchProvider>
  );
}
