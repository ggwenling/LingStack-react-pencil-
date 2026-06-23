import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/session";
import { getOrCreateLatestThread } from "@/lib/services/chat-service";

export default async function AiEntryPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const thread = await getOrCreateLatestThread(user.id);

  redirect(`/home/${thread.id}/ai`);
}
