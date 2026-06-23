import { redirect } from "next/navigation";

import { HomeShell } from "@/app/home/components/home-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { getSidebarThreads } from "@/lib/services/chat-service";

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const threads = await getSidebarThreads(user.id);

  return <HomeShell threads={threads}>{children}</HomeShell>;
}
