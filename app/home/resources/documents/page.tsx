import { redirect } from "next/navigation";

import { ResourceDocumentsAllSection } from "@/app/home/components/resources/resource-documents-all-section";
import { WorkspaceTopbar } from "@/app/home/components/workspace-topbar";
import { getCurrentUser } from "@/lib/auth/session";
import {
  ALL_RESOURCE_DOCUMENTS,
  DOCUMENTS_PAGE_DESCRIPTION,
  DOCUMENTS_PAGE_TITLE,
} from "@/lib/learning/resources-catalog";

export default async function ResourceDocumentsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <WorkspaceTopbar userName={user.name} breadcrumb="学习文档" />
        <ResourceDocumentsAllSection
          title={DOCUMENTS_PAGE_TITLE}
          description={DOCUMENTS_PAGE_DESCRIPTION}
          documents={ALL_RESOURCE_DOCUMENTS}
        />
      </div>
    </div>
  );
}
