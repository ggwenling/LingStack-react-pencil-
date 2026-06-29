import { unstable_cache } from "next/cache";

import { findLearningProgress } from "@/lib/repositories/learning-progress-repository";
import {
  learningDataCacheKey,
  readLearningDataCache,
  writeLearningDataCache,
} from "@/lib/redis/learning-data-cache";

import { learningProgressTag } from "./cache-tags";

async function loadLearningProgress(userId: string) {
  const cacheKey = learningDataCacheKey("learning-progress", userId);
  const cached = await readLearningDataCache<
    Awaited<ReturnType<typeof findLearningProgress>>
  >(cacheKey);

  if (cached) {
    return cached;
  }

  const progress = await findLearningProgress(userId);
  await writeLearningDataCache(cacheKey, progress);
  return progress;
}

export function getCachedLearningProgress(userId: string) {
  return unstable_cache(
    () => loadLearningProgress(userId),
    ["learning-progress", userId],
    {
      revalidate: 60,
      tags: [learningProgressTag(userId)],
    },
  )();
}
