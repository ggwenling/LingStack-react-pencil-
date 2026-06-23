import {
  MVP_STAGE_KEY,
  ROADMAP_CATALOG,
  type RoadmapCatalogLesson,
  type RoadmapCatalogStage,
} from "./roadmap-catalog";

export type CatalogLessonRef = {
  stageKey: string;
  stageIndex: number;
  lesson: RoadmapCatalogLesson;
  lessonIndex: number;
};

export function getStageByKey(stageKey: string) {
  const stageIndex = ROADMAP_CATALOG.findIndex(
    (stage) => stage.stageKey === stageKey,
  );

  if (stageIndex < 0) {
    return null;
  }

  return {
    stage: ROADMAP_CATALOG[stageIndex],
    stageIndex,
  };
}

export function getStageByIndex(stageIndex: number) {
  const stage = ROADMAP_CATALOG[stageIndex];

  if (!stage) {
    return null;
  }

  return { stage, stageIndex };
}

export function getLessonByKey(lessonKey: string): CatalogLessonRef | null {
  for (let stageIndex = 0; stageIndex < ROADMAP_CATALOG.length; stageIndex += 1) {
    const stage = ROADMAP_CATALOG[stageIndex];
    const lessons = stage.lessons ?? [];

    const lessonIndex = lessons.findIndex(
      (lesson) => lesson.lessonKey === lessonKey,
    );

    if (lessonIndex >= 0) {
      return {
        stageKey: stage.stageKey,
        stageIndex,
        lesson: lessons[lessonIndex],
        lessonIndex,
      };
    }
  }

  return null;
}

export function getNextLesson(lessonKey: string): CatalogLessonRef | null {
  const current = getLessonByKey(lessonKey);

  if (!current) {
    return null;
  }

  const stage = ROADMAP_CATALOG[current.stageIndex];
  const lessons = stage?.lessons ?? [];
  const nextInStage = lessons[current.lessonIndex + 1];

  if (nextInStage) {
    return {
      stageKey: current.stageKey,
      stageIndex: current.stageIndex,
      lesson: nextInStage,
      lessonIndex: current.lessonIndex + 1,
    };
  }

  const nextStage = ROADMAP_CATALOG[current.stageIndex + 1];

  if (!nextStage?.lessons?.length) {
    return null;
  }

  return {
    stageKey: nextStage.stageKey,
    stageIndex: current.stageIndex + 1,
    lesson: nextStage.lessons[0],
    lessonIndex: 0,
  };
}

export function getFirstLessonOfStage(stageKey: string): CatalogLessonRef | null {
  const found = getStageByKey(stageKey);

  if (!found?.stage.lessons?.length) {
    return null;
  }

  return {
    stageKey: found.stage.stageKey,
    stageIndex: found.stageIndex,
    lesson: found.stage.lessons[0],
    lessonIndex: 0,
  };
}

export function listMvpLessons(): CatalogLessonRef[] {
  return listLessonsInStage(MVP_STAGE_KEY);
}

export function listAllLessons(): CatalogLessonRef[] {
  const refs: CatalogLessonRef[] = [];

  for (let stageIndex = 0; stageIndex < ROADMAP_CATALOG.length; stageIndex += 1) {
    const stage = ROADMAP_CATALOG[stageIndex];
    const lessons = stage.lessons ?? [];

    lessons.forEach((lesson, lessonIndex) => {
      refs.push({
        stageKey: stage.stageKey,
        stageIndex,
        lesson,
        lessonIndex,
      });
    });
  }

  return refs;
}

export function getFirstExerciseLesson(): CatalogLessonRef | null {
  return listAllLessons()[0] ?? null;
}

export function listLessonsInStage(stageKey: string): CatalogLessonRef[] {
  const found = getStageByKey(stageKey);

  if (!found?.stage.lessons) {
    return [];
  }

  return found.stage.lessons.map((lesson, lessonIndex) => ({
    stageKey: found.stage.stageKey,
    stageIndex: found.stageIndex,
    lesson,
    lessonIndex,
  }));
}

export function getMvpStage(): {
  stage: RoadmapCatalogStage;
  stageIndex: number;
} | null {
  return getStageByKey(MVP_STAGE_KEY);
}

const NEXT_MODULE_STAGE_KEYS = [
  "routing-data-fetching",
  "advanced-optimization",
  "fullstack-project",
] as const;

export function getLessonsForModule(
  module: "react" | "next",
): CatalogLessonRef[] {
  if (module === "react") {
    return listLessonsInStage(MVP_STAGE_KEY);
  }

  return NEXT_MODULE_STAGE_KEYS.flatMap((stageKey) =>
    listLessonsInStage(stageKey),
  );
}

export { MVP_STAGE_KEY };
