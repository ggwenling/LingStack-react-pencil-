import { getLessonProgressState } from "./exercise-service";
import { buildModuleEntryProgress } from "./learning-metrics";
import {
  RESOURCE_DOCUMENTS,
  RESOURCES_PAGE_DESCRIPTION,
  RESOURCES_PAGE_TITLE,
  SKILL_PATH_CATALOG,
  AI_FRONTEND_RANKINGS,
} from "./resources-catalog";
import type { ResourcesPageView } from "./resources-page-types";

function computeAiAssistedProgress(
  lessons: Awaited<ReturnType<typeof getLessonProgressState>>,
) {
  const entries = buildModuleEntryProgress(lessons);

  if (!entries.length) {
    return 0;
  }

  return Math.round(
    entries.reduce((sum, entry) => sum + entry.percent, 0) / entries.length,
  );
}

export async function getResourcesPageView(
  userId: string,
): Promise<ResourcesPageView> {
  const lessonRecords = await getLessonProgressState(userId);
  const aiProgress = computeAiAssistedProgress(lessonRecords);

  const paths = SKILL_PATH_CATALOG.map((path) => {
    if (path.id === "ai-assisted") {
      return { ...path, progress: aiProgress };
    }

    return { ...path };
  });

  return {
    title: RESOURCES_PAGE_TITLE,
    description: RESOURCES_PAGE_DESCRIPTION,
    documents: RESOURCE_DOCUMENTS,
    paths,
    rankings: AI_FRONTEND_RANKINGS,
  };
}
