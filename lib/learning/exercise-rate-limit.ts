import { AppError } from "@/lib/errors/app-error";
import {
  countSubmissionsToday,
  findExerciseByIdForUser,
} from "@/lib/repositories/exercise-repository";

const MIN_SUBMIT_INTERVAL_MS = 10_000;
const MAX_SUBMISSIONS_PER_DAY = 30;

export async function assertExerciseRateLimit(
  userId: string,
  exerciseId: string,
) {
  const exercise = await findExerciseByIdForUser(userId, exerciseId);

  if (!exercise) {
    throw new AppError("NOT_FOUND", "练习不存在");
  }

  const latestSubmission = exercise.submissions[0];

  if (latestSubmission) {
    const elapsed = Date.now() - latestSubmission.createdAt.getTime();

    if (elapsed < MIN_SUBMIT_INTERVAL_MS) {
      throw new AppError("TOO_MANY_REQUESTS", "提交过于频繁，请稍后再试");
    }
  }

  const todayCount = await countSubmissionsToday(userId, exerciseId);

  if (todayCount >= MAX_SUBMISSIONS_PER_DAY) {
    throw new AppError("TOO_MANY_REQUESTS", "今日提交次数已达上限");
  }
}
