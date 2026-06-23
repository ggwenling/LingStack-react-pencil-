import { getCurrentUser } from "@/lib/auth/session";
import { AppError, toApiResponse } from "@/lib/errors/app-error";
import { computeKnowledgeProgress } from "@/lib/learning/learning-metrics";
import {
  buildDailyTasksFromLessons,
  buildMasteredTopicsFromLessons,
  buildRoadmapStepsFromLessons,
} from "@/lib/learning/progress-aggregator";
import { getLessonProgressState } from "@/lib/learning/exercise-service";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      throw new AppError("UNAUTHORIZED", "未登录");
    }

    const lessons = await getLessonProgressState(user.id);

    return Response.json({
      ok: true,
      data: {
        roadmapSteps: buildRoadmapStepsFromLessons(lessons),
        dailyTasks: buildDailyTasksFromLessons(lessons),
        masteredTopics: buildMasteredTopicsFromLessons(lessons),
        knowledgeProgress: computeKnowledgeProgress(lessons),
        lessons: lessons.map((lesson) => ({
          lessonKey: lesson.lessonKey,
          status: lesson.status,
          stageKey: lesson.stageKey,
          exercises: lesson.exercises.map((exercise) => ({
            id: exercise.id,
            title: exercise.title,
            status: exercise.status,
            templateId: exercise.templateId,
          })),
        })),
      },
    });
  } catch (error) {
    return toApiResponse(error);
  }
}
