import { redirect } from "next/navigation";

import { SettingsPageContent } from "@/app/home/components/settings/settings-page-content";
import { WorkspaceTopbar } from "@/app/home/components/workspace-topbar";
import { getCurrentSession, getCurrentUser } from "@/lib/auth/session";
import { getSettingsPageView } from "@/lib/services/settings-service";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [view, session] = await Promise.all([
    getSettingsPageView(user.id),
    getCurrentSession(),
  ]);

  if (!view || !session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <WorkspaceTopbar userName={user.name} breadcrumb="个人设置" />
        <SettingsPageContent view={view} session={session} />
      </div>
    </div>
  );
}
