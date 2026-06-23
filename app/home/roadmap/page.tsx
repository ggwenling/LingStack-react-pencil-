import { redirect } from "next/navigation";

import { RoadmapFloatingCta } from "@/app/home/components/roadmap/roadmap-floating-cta";
import { RoadmapHero } from "@/app/home/components/roadmap/roadmap-hero";
import { RoadmapTimeline } from "@/app/home/components/roadmap/roadmap-timeline";
import { WorkspaceTopbar } from "@/app/home/components/workspace-topbar";
import { getCurrentUser } from "@/lib/auth/session";
import { getRoadmapPageView } from "@/lib/learning/roadmap-view";

export default async function RoadmapPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const view = await getRoadmapPageView(user.id);

  return (
    <div className="min-h-screen px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <WorkspaceTopbar userName={user.name} breadcrumb="全栈路线图" />

        <RoadmapHero
          title={view.title}
          description={view.description}
          overallPercent={view.overallPercent}
          estimatedHoursRemaining={view.estimatedHoursRemaining}
        />

        <RoadmapTimeline stages={view.stages} />
      </div>

      <RoadmapFloatingCta continueInfo={view.continue} />
    </div>
  );
}
