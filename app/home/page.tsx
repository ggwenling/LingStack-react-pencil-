import { redirect } from "next/navigation";

import { ContinueLearningHero } from "@/app/home/components/continue-learning-hero";
import { DashboardShell } from "@/app/home/components/dashboard-shell";
import { LearningEntryCards } from "@/app/home/components/learning-entry-cards";
import { LearningRoadmap } from "@/app/home/components/learning-roadmap";
import { ProgressOverview } from "@/app/home/components/progress-overview";
import { TodayTasks } from "@/app/home/components/today-tasks";
import { getCurrentUser } from "@/lib/auth/session";
import { getHomeDashboardView } from "@/lib/learning/home-dashboard";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const dashboard = await getHomeDashboardView(user.id);

  return (
    <DashboardShell
      userName={user.name}
      main={
        <>
          <ContinueLearningHero
            hasLearningActivity={dashboard.hero.hasLearningActivity}
            primaryEntry={dashboard.hero.primaryEntry}
            overallPercent={dashboard.overview.overallPercent}
            currentTopic={dashboard.hero.currentTopic}
            activeModuleLabel={dashboard.hero.activeModuleLabel}
          />
          <ProgressOverview data={dashboard.overview} />
          <LearningEntryCards entries={dashboard.entries} />
        </>
      }
      aside={
        <>
          <LearningRoadmap steps={dashboard.roadmap} />
          <TodayTasks tasks={dashboard.tasks} />
        </>
      }
    />
  );
}
