"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ThreadSearchContextValue = {
  query: string;
  setQuery: (query: string) => void;
};

const ThreadSearchContext = createContext<ThreadSearchContextValue | null>(null);

export function ThreadSearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");

  const value = useMemo(
    () => ({
      query,
      setQuery,
    }),
    [query],
  );

  return (
    <ThreadSearchContext.Provider value={value}>
      {children}
    </ThreadSearchContext.Provider>
  );
}

export function useThreadSearch() {
  const context = useContext(ThreadSearchContext);

  if (!context) {
    throw new Error("useThreadSearch must be used within ThreadSearchProvider");
  }

  return context;
}
