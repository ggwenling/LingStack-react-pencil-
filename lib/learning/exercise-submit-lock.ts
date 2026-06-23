import { getRedisClient } from "@/lib/redis/client";

const SUBMIT_LOCK_TTL_SECONDS = 30;

function submitLockKey(userId: string, exerciseId: string) {
  return `learning:exercise-submit:${userId}:${exerciseId}`;
}

export async function acquireExerciseSubmitLock(
  userId: string,
  exerciseId: string,
) {
  const redis = getRedisClient();
  const key = submitLockKey(userId, exerciseId);
  const acquired = await redis.set(key, "1", {
    nx: true,
    ex: SUBMIT_LOCK_TTL_SECONDS,
  });

  return acquired === "OK";
}

export async function releaseExerciseSubmitLock(
  userId: string,
  exerciseId: string,
) {
  const redis = getRedisClient();
  await redis.del(submitLockKey(userId, exerciseId));
}
