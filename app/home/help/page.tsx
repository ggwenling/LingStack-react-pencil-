import { redirect } from "next/navigation";

import { HelpPageContent } from "@/app/home/components/help/help-page-content";
import { WorkspaceTopbar } from "@/app/home/components/workspace-topbar";
import { getCurrentUser } from "@/lib/auth/session";

export default async function HelpPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <WorkspaceTopbar userName={user.name} breadcrumb="帮助与项目说明" />
        <HelpPageContent />
      </div>
    </div>
  );
}
