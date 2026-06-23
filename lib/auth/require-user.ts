import { redirect } from "next/navigation";

import { AppError } from "@/lib/errors/app-error";
import { getCurrentUser } from "./session";

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AppError("UNAUTHORIZED", "请先登录");
  }

  return user;
}

export async function requirePageUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
