import { getCurrentUser } from "@/lib/auth/session";
import { AppError, toApiResponse } from "@/lib/errors/app-error";
import { getCurrentExerciseView } from "@/lib/learning/exercise-service";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new AppError("UNAUTHORIZED", "未登录");
    }

    const exercise = await getCurrentExerciseView(user.id);

    return Response.json({
      ok: true,
      data: exercise,
    });
  } catch (error) {
    return toApiResponse(error);
  }
}
