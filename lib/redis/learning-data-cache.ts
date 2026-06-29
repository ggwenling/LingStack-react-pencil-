import { getRedisClient } from "@/lib/redis/client";

export const LEARNING_DATA_CACHE_TTL_SECONDS = 45;

export type LearningDataCacheKind =
  | "sidebar-threads"
  | "lesson-progress"
  | "learning-progress";

export function learningDataCacheKey(kind: LearningDataCacheKind, userId: string) {
  return `learning:data:${kind}:${userId}`;
}

export async function readLearningDataCache<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  const raw = await redis.get<string>(key);

  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as T;
}

export async function writeLearningDataCache<T>(key: string, value: T) {
  const redis = getRedisClient();
  await redis.set(key, JSON.stringify(value), {
    ex: LEARNING_DATA_CACHE_TTL_SECONDS,
  });
}

export async function invalidateLearningDataCache(userId: string) {
  const redis = getRedisClient();
  const keys = [
    learningDataCacheKey("sidebar-threads", userId),
    learningDataCacheKey("lesson-progress", userId),
    learningDataCacheKey("learning-progress", userId),
  ];

  await redis.del(...keys);
}
