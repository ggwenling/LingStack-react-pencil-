import { redirect } from "next/navigation";

import { AnalyticsDashboard } from "@/app/home/components/analytics/analytics-dashboard";
import { getCurrentUser } from "@/lib/auth/session";
import { getAnalyticsView } from "@/lib/learning/analytics";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const view = await getAnalyticsView(user.id);

  return <AnalyticsDashboard view={view} userName={user.name} />;
}
