import { HelpContactFooter } from "./help-contact-footer";
import { HelpHero } from "./help-hero";
import { HelpInfoGrid } from "./help-info-grid";
import { HelpLearningSection } from "./help-learning-section";
import { HelpMissionSection } from "./help-mission-section";
import { HelpTransparencySection } from "./help-transparency-section";

export function HelpPageContent() {
  return (
    <div className="space-y-6 pb-4 sm:space-y-8">
      <HelpHero />
      <HelpMissionSection />
      <HelpTransparencySection />
      <HelpLearningSection />
      <HelpInfoGrid />
      <HelpContactFooter />
    </div>
  );
}
