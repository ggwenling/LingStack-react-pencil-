import { redirect } from "next/navigation";

import { ResourceDocumentsSection } from "@/app/home/components/resources/resource-documents-section";
import { ResourcesHero } from "@/app/home/components/resources/resources-hero";
import { SkillPathsSection } from "@/app/home/components/resources/skill-paths-section";
import { TechRankingTable } from "@/app/home/components/resources/tech-ranking-table";
import { WorkspaceTopbar } from "@/app/home/components/workspace-topbar";
import { getCurrentUser } from "@/lib/auth/session";
import { getResourcesPageView } from "@/lib/learning/resources-view";

export default async function ResourcesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const view = await getResourcesPageView(user.id);

  return (
    <div className="min-h-screen px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <WorkspaceTopbar userName={user.name} breadcrumb="资源库" />

        <ResourcesHero title={view.title} description={view.description} />

        <ResourceDocumentsSection documents={view.documents} />

        <SkillPathsSection paths={view.paths} />

        <TechRankingTable rankings={view.rankings} />
      </div>
    </div>
  );
}
