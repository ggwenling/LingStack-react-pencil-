"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SidebarExpandContextValue = {
  expanded: boolean;
  pinned: boolean;
  setHovered: (hovered: boolean) => void;
  togglePinned: () => void;
};

const SidebarExpandContext = createContext<SidebarExpandContextValue | null>(
  null,
);

export function SidebarExpandProvider({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);

  const value = useMemo(
    () => ({
      expanded: hovered || pinned,
      pinned,
      setHovered,
      togglePinned: () => setPinned((current) => !current),
    }),
    [hovered, pinned],
  );

  return (
    <SidebarExpandContext.Provider value={value}>
      {children}
    </SidebarExpandContext.Provider>
  );
}

export function useSidebarExpand() {
  const context = useContext(SidebarExpandContext);

  if (!context) {
    throw new Error("useSidebarExpand must be used within SidebarExpandProvider");
  }

  return context;
}
