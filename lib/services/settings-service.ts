import { getCurrentUser } from "@/lib/auth/session";
import {
  findOrCreatePreferenceForUser,
  updatePreferenceForUser,
  updateUserName,
} from "@/lib/repositories/user-preference-repository";
import type {
  UpdateLearningPreferencesInput,
  UpdateProfileInput,
} from "@/lib/validation/settings";

export type SettingsPageView = {
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
  preference: {
    moduleFocus: "REACT" | "NEXT";
    responseStyle: "CONCISE" | "STANDARD" | "DETAILED";
    progressReminders: boolean;
  };
};

export async function getSettingsPageView(
  userId: string,
): Promise<SettingsPageView | null> {
  const user = await getCurrentUser();

  if (!user || user.id !== userId) {
    return null;
  }

  const preference = await findOrCreatePreferenceForUser(userId);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
    },
    preference: {
      moduleFocus: preference.moduleFocus,
      responseStyle: preference.responseStyle,
      progressReminders: preference.progressReminders,
    },
  };
}

export async function saveProfile(userId: string, input: UpdateProfileInput) {
  return updateUserName(userId, input.name);
}

export async function saveLearningPreferences(
  userId: string,
  input: UpdateLearningPreferencesInput,
) {
  await findOrCreatePreferenceForUser(userId);
  return updatePreferenceForUser(userId, input);
}
