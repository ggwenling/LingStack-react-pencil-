import dynamic from "next/dynamic";
import type { AnalyticsView } from "@/lib/learning/analytics";

import { FadeSlideIn, StaggerItem } from "@/app/home/components/motion/ui";

import { AnalyticsTopbar } from "./analytics-topbar";
import { KnowledgeMasteryCard } from "./knowledge-mastery-card";
import { LearningOutputCard } from "./learning-output-card";
import { RecentActivityCard } from "./recent-activity-card";
import { TokenBalanceCard } from "./token-balance-card";
import { WeakPointsCard } from "./weak-points-card";
import { WeeklySuggestionCard } from "./weekly-suggestion-card";

const TokenTrendChart = dynamic(
  () =>
    import("./token-trend-chart").then((module) => ({
      default: module.TokenTrendChart,
    })),
  {
    loading: () => (
      <article className="lingstack-card-v2 h-full min-h-[360px] animate-pulse p-5 sm:p-6" />
    ),
  },
);

type AnalyticsDashboardProps = {
  view: AnalyticsView;
  userName?: string | null;
};

export function AnalyticsDashboard({ view, userName }: AnalyticsDashboardProps) {
  return (
    <section className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <FadeSlideIn>
        <AnalyticsTopbar userName={userName} />
      </FadeSlideIn>

      <div className="mt-6 grid gap-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <StaggerItem index={0}>
            <TokenBalanceCard data={view.token} />
          </StaggerItem>
          <StaggerItem index={1}>
            <LearningOutputCard data={view.output} />
          </StaggerItem>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
          <StaggerItem index={2}>
            <TokenTrendChart data={view.token.trend7d} />
          </StaggerItem>
          <StaggerItem index={3}>
            <KnowledgeMasteryCard data={view.mastery} />
          </StaggerItem>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <StaggerItem index={4}>
            <WeakPointsCard data={view.weakPoints} />
          </StaggerItem>
          <StaggerItem index={5}>
            <RecentActivityCard data={view.recentActivity} />
          </StaggerItem>
          <StaggerItem index={6}>
            <WeeklySuggestionCard suggestion={view.weeklySuggestion} />
          </StaggerItem>
        </div>
      </div>
    </section>
  );
}
