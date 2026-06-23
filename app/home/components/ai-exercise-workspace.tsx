"use client";

import type { UIMessage } from "ai";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import type { AiChatPanelHandle } from "@/app/home/components/ai-chat-panel";
import { ExercisePanel } from "@/app/home/components/exercise/exercise-panel";
import { HomeRouteLoading } from "@/app/home/components/route-state";
import {
  persistExercisePanelCollapsed,
  readExercisePanelCollapsed,
} from "@/lib/home/exercise-panel-preference";
import { cn } from "@/lib/utils";

const AiChatPanel = dynamic(
  () =>
    import("@/app/home/components/ai-chat-panel").then((module) => ({
      default: module.AiChatPanel,
    })),
  {
    loading: () => <HomeRouteLoading kind="ai" />,
  },
);

type AiExerciseWorkspaceProps = {
  threadId: string;
  title: string;
  userName?: string | null;
  initialMessages?: UIMessage[];
};

export function AiExerciseWorkspace({
  threadId,
  title,
  userName,
  initialMessages = [],
}: AiExerciseWorkspaceProps) {
  const [exerciseCollapsed, setExerciseCollapsed] = useState(false);
  const chatPanelRef = useRef<AiChatPanelHandle>(null);
  const registerChatHandlers = useCallback((handlers: AiChatPanelHandle) => {
    chatPanelRef.current = handlers;
  }, []);

  useEffect(() => {
    setExerciseCollapsed(readExercisePanelCollapsed());
  }, []);

  function toggleExerciseCollapsed() {
    setExerciseCollapsed((current) => {
      const next = !current;
      persistExercisePanelCollapsed(next);
      return next;
    });
  }

  function handleChatFollowUp(message: { messageId: string; content: string }) {
    chatPanelRef.current?.appendAssistantMessage({
      id: message.messageId,
      content: message.content,
    });
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f9f9f9]">
      <div
        className={cn(
          "flex min-h-0 flex-col overflow-hidden border-b border-[#E8E8E8] bg-white transition-[flex] duration-300 ease-out",
          exerciseCollapsed ? "shrink-0" : "min-h-0 flex-4",
        )}
      >
        <ExercisePanel
          collapsed={exerciseCollapsed}
          onToggleCollapsed={toggleExerciseCollapsed}
          className="h-full min-h-0"
          threadId={threadId}
          onChatFollowUp={handleChatFollowUp}
        />
      </div>

      <div
        className={cn(
          "min-h-0 overflow-hidden transition-[flex] duration-300 ease-out",
          exerciseCollapsed ? "flex-1" : "min-h-44 flex-1",
        )}
      >
        <AiChatPanel
          key={threadId}
          threadId={threadId}
          title={title}
          userName={userName}
          initialMessages={initialMessages}
          compact={!exerciseCollapsed}
          onRegisterHandlers={registerChatHandlers}
        />
      </div>
    </section>
  );
}
