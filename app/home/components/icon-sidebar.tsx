"use client";

import Link from "next/link";
import {
  BarChart3,
  HelpCircle,
  Layers,
  LayoutDashboard,
  Map,
  MessagesSquare,
  NotebookPen,
  Plus,
  Settings,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";

import { createLearningChat } from "@/app/home/api/actions";
import { isAiRoute, isDashboardRoute, isRoadmapRoute } from "@/lib/home/routes";
import {
  getMotionTransition,
  sidebarSpringTransition,
} from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

import { useSidebarExpand } from "./sidebar-expand-context";

const navItems = [
  {
    href: "/home",
    label: "工作区",
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
    label: "AI 会话",
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
    href: "/home/resources",
    label: "资源库",
    icon: Layers,
    isActive: (pathname: string) => pathname.startsWith("/home/resources"),
  },
  {
    href: "/home/analytics",
    label: "分析",
    icon: BarChart3,
    isActive: (pathname: string) => pathname.startsWith("/home/analytics"),
  },
] as const;

const SIDEBAR_COLLAPSED_WIDTH = 64;
const SIDEBAR_EXPANDED_WIDTH = 256;

const navLinkClass = (active: boolean) =>
  cn(
    "flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 transition-colors",
    active
      ? "lingstack-icon-rail-item-active"
      : "border-transparent text-neutral-500 lingstack-icon-rail-item-hover",
  );

export function IconSidebar() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const { expanded, setHovered } = useSidebarExpand();
  const springTransition = getMotionTransition(
    sidebarSpringTransition,
    reducedMotion,
  );

  return (
    <motion.aside
      initial={false}
      animate={{
        width: expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
      }}
      transition={springTransition}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="lingstack-icon-rail z-40 hidden shrink-0 flex-col overflow-hidden border-r lg:flex lg:h-screen"
    >
      <div className="flex h-full flex-col py-4">
        <Link
          href="/home"
          aria-label="LingStack 首页"
          className="mb-2 flex items-center gap-3 overflow-hidden px-3"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-neutral-950">
            <Sparkles className="size-[18px] text-cyan-300" />
          </span>
          <motion.div
            initial={false}
            animate={{
              opacity: expanded ? 1 : 0,
              x: expanded ? 0 : -8,
            }}
            transition={{
              ...springTransition,
              delay: expanded && !reducedMotion ? 0.04 : 0,
            }}
            className="min-w-0 whitespace-nowrap"
            aria-hidden={!expanded}
          >
            <p className="text-[15px] font-semibold text-neutral-950">
              LingStack
            </p>
            <p className="text-[10px] font-medium tracking-wide text-neutral-500 uppercase">
              AI Learning Workspace
            </p>
          </motion.div>
        </Link>

        <form action={createLearningChat} className="mt-4 px-3">
          <button
            type="submit"
            className="flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-neutral-950 text-white transition-colors hover:bg-neutral-800"
          >
            <Plus className="size-4 shrink-0" />
            <motion.span
              initial={false}
              animate={{ opacity: expanded ? 1 : 0 }}
              transition={{
                ...springTransition,
                delay: expanded && !reducedMotion ? 0.03 : 0,
              }}
              className={cn(
                "overflow-hidden text-[13px] font-semibold whitespace-nowrap",
                !expanded && "pointer-events-none absolute opacity-0",
              )}
            >
              新建学习会话
            </motion.span>
          </button>
        </form>

        <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive(pathname);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={navLinkClass(active)}
              >
                <Icon
                  className="size-[18px] shrink-0"
                  strokeWidth={active ? 2.25 : 2}
                />
                <motion.span
                  initial={false}
                  animate={{
                    opacity: expanded ? 1 : 0,
                    x: expanded ? 0 : -6,
                  }}
                  transition={{
                    ...springTransition,
                    delay: expanded && !reducedMotion ? 0.03 : 0,
                  }}
                  className="overflow-hidden text-[13px] font-semibold whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-[#E7E7E4] px-2 pt-4">
          <Link
            href="/home/help"
            title="帮助"
            className={navLinkClass(pathname.startsWith("/home/help"))}
          >
            <HelpCircle className="size-[18px] shrink-0" />
            <motion.span
              initial={false}
              animate={{ opacity: expanded ? 1 : 0, x: expanded ? 0 : -6 }}
              transition={springTransition}
              className="overflow-hidden text-[13px] font-semibold whitespace-nowrap"
            >
              帮助
            </motion.span>
          </Link>

          <Link
            href="/home/settings"
            title="设置"
            className={navLinkClass(pathname.startsWith("/home/settings"))}
          >
            <Settings className="size-[18px] shrink-0" />
            <motion.span
              initial={false}
              animate={{ opacity: expanded ? 1 : 0, x: expanded ? 0 : -6 }}
              transition={springTransition}
              className="overflow-hidden text-[13px] font-semibold whitespace-nowrap"
            >
              设置
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.aside>
  );
}
