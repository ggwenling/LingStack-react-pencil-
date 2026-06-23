import { redirect } from "next/navigation";

import { NotesWorkspace } from "@/app/home/components/notes/notes-workspace";
import { WorkspaceTopbar } from "@/app/home/components/workspace-topbar";
import { getCurrentUser } from "@/lib/auth/session";
import { listLearningNotes } from "@/lib/services/note-service";

export default async function NotesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const notes = await listLearningNotes(user.id);

  return (
    <div className="min-h-screen px-4 pb-8 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <WorkspaceTopbar userName={user.name} breadcrumb="学习笔记" />
        <NotesWorkspace initialNotes={notes} userName={user.name} />
      </div>
    </div>
  );
}
