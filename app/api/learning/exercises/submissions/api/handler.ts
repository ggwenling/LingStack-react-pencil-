import { getCurrentUser } from "@/lib/auth/session";
import { AppError, toApiResponse } from "@/lib/errors/app-error";
import { getExerciseSubmissionsView } from "@/lib/learning/exercise-service";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new AppError("UNAUTHORIZED", "未登录");
    }

    const { searchParams } = new URL(request.url);
    const exerciseId = searchParams.get("exerciseId");

    if (!exerciseId) {
      throw new AppError("BAD_REQUEST", "缺少 exerciseId");
    }

    const submissions = await getExerciseSubmissionsView(
      user.id,
      exerciseId,
    );

    if (!submissions) {
      throw new AppError("FORBIDDEN", "无权查看该练习提交记录");
    }

    return Response.json({
      ok: true,
      data: submissions,
    });
  } catch (error) {
    return toApiResponse(error);
  }
}
