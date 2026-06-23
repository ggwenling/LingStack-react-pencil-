"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { revokeCurrentSession } from "@/lib/auth/session";
import { requireUser } from "@/lib/auth/require-user";
import { AppError } from "@/lib/errors/app-error";
import {
  saveLearningPreferences,
  saveProfile,
} from "@/lib/services/settings-service";
import {
  updateLearningPreferencesSchema,
  updateProfileSchema,
} from "@/lib/validation/settings";

type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

export async function updateProfile(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = updateProfileSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "昵称格式不正确",
    };
  }

  try {
    await saveProfile(user.id, parsed.data);
    revalidatePath("/home/settings");
    revalidatePath("/home");

    return { ok: true, message: "资料已保存" };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, message: error.message };
    }

    throw error;
  }
}

export async function updateLearningPreferences(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const parsed = updateLearningPreferencesSchema.safeParse({
    moduleFocus: formData.get("moduleFocus"),
    responseStyle: formData.get("responseStyle"),
    progressReminders: formData.get("progressReminders") === "true",
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "偏好设置格式不正确",
    };
  }

  try {
    await saveLearningPreferences(user.id, parsed.data);
    revalidatePath("/home/settings");

    return { ok: true, message: "学习偏好已保存" };
  } catch (error) {
    if (error instanceof AppError) {
      return { ok: false, message: error.message };
    }

    throw error;
  }
}

export async function logout() {
  await revokeCurrentSession();
  redirect("/login");
}
