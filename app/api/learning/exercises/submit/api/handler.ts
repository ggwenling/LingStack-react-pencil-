import { getCurrentUser } from "@/lib/auth/session";
import { AppError, toApiResponse } from "@/lib/errors/app-error";
import { submitExerciseForUser } from "@/lib/learning/exercise-submit-service";
import { invalidateChatLearningCaches } from "@/lib/services/chat-service";
import { submitExerciseSchema } from "@/lib/validation/exercise";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new AppError("UNAUTHORIZED", "未登录");
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      throw new AppError("BAD_REQUEST", "请求体不是合法 JSON");
    }

    const parsed = submitExerciseSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError("BAD_REQUEST", "提交格式不正确");
    }

    const result = await submitExerciseForUser(
      user.id,
      parsed.data.exerciseId,
      parsed.data.code,
      parsed.data.threadId,
    );

    await invalidateChatLearningCaches(user.id);

    return Response.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    return toApiResponse(error);
  }
}
