import type { SettingsPageView } from "@/lib/services/settings-service";

import { SettingsFeaturePreview } from "./settings-feature-preview";
import { SettingsHero } from "./settings-hero";
import { SettingsLearningPreferences } from "./settings-learning-preferences";
import { SettingsPrivacyCard } from "./settings-privacy-card";
import { SettingsProfileCard } from "./settings-profile-card";
import { SettingsSecurityCard } from "./settings-security-card";

type SettingsPageContentProps = {
  view: SettingsPageView;
  session: {
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: Date;
  };
};

export function SettingsPageContent({ view, session }: SettingsPageContentProps) {
  return (
    <div className="pb-4">
      <SettingsHero userName={view.user.name} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-6 lg:col-span-8">
          <SettingsProfileCard
            name={view.user.name}
            email={view.user.email}
            status={view.user.status}
          />
          <SettingsLearningPreferences
            moduleFocus={view.preference.moduleFocus}
            responseStyle={view.preference.responseStyle}
            progressReminders={view.preference.progressReminders}
          />
        </div>

        <aside className="space-y-6 lg:col-span-4">
          <SettingsSecurityCard
            userAgent={session.userAgent}
            ipAddress={session.ipAddress}
            createdAt={session.createdAt}
          />
          <SettingsPrivacyCard />
          <SettingsFeaturePreview />
        </aside>
      </div>
    </div>
  );
}
