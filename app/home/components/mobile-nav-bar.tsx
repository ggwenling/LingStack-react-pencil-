"use client";

import Link from "next/link";
import {
  BarChart3,
  LayoutDashboard,
  Map,
  MessagesSquare,
  NotebookPen,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { isAiRoute, isDashboardRoute, isRoadmapRoute } from "@/lib/home/routes";
import { cn } from "@/lib/utils";

const items = [
  {
    href: "/home",
    label: "仪表盘",
    icon: LayoutDashboard,
    isActive: (pathname: string) => isDashboardRoute(pathname),
  },
  {
    href: "/home/roadmap",
    label: "路线图",
    icon: Map,
    isActive: (pathname: string) => isRoadmapRoute(pathname),
  },
  {
    href: "/home/ai",
    label: "AI",
    icon: MessagesSquare,
    isActive: (pathname: string) => isAiRoute(pathname),
  },
  {
    href: "/home/notes",
    label: "笔记",
    icon: NotebookPen,
    isActive: (pathname: string) => pathname.startsWith("/home/notes"),
  },
  {
    href: "/home/analytics",
    label: "分析",
    icon: BarChart3,
    isActive: (pathname: string) => pathname.startsWith("/home/analytics"),
  },
] as const;

export function MobileNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[#E8E8E8] bg-white px-2 py-2 lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.isActive(pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-semibold transition-colors",
              active ? "text-neutral-950" : "text-neutral-400",
            )}
          >
            <Icon className="size-5" strokeWidth={active ? 2.25 : 2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
