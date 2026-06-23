import { prisma } from "@/lib/db/prisma";
import type { UpdateLearningPreferencesInput } from "@/lib/validation/settings";

export function findPreferenceByUserId(userId: string) {
  return prisma.userPreference.findUnique({
    where: { userId },
  });
}

export function createDefaultPreferenceForUser(userId: string) {
  return prisma.userPreference.create({
    data: { userId },
  });
}

export async function findOrCreatePreferenceForUser(userId: string) {
  const existing = await findPreferenceByUserId(userId);

  if (existing) {
    return existing;
  }

  return createDefaultPreferenceForUser(userId);
}

export function updatePreferenceForUser(
  userId: string,
  input: UpdateLearningPreferencesInput,
) {
  return prisma.userPreference.update({
    where: { userId },
    data: input,
  });
}

export function updateUserName(userId: string, name: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { name },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
    },
  });
}
