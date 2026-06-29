import { revalidateTag } from "next/cache";

export function sidebarThreadsTag(userId: string) {
  return `sidebar-threads:${userId}`;
}

export function lessonProgressTag(userId: string) {
  return `lesson-progress:${userId}`;
}

export function learningProgressTag(userId: string) {
  return `learning-progress:${userId}`;
}

export function homeDashboardTag(userId: string) {
  return `home-dashboard:${userId}`;
}

export function revalidateUserLearningCache(userId: string) {
  revalidateTag(sidebarThreadsTag(userId), "default");
  revalidateTag(lessonProgressTag(userId), "default");
  revalidateTag(learningProgressTag(userId), "default");
  revalidateTag(homeDashboardTag(userId), "default");
}
