import type { AppUsageMode, OnboardingAnswers } from "@/types/coach";

export function getAppUsageMode(
  profile: OnboardingAnswers | null | undefined,
): AppUsageMode {
  const m = profile?.appUsageMode;
  if (m === "food_only" || m === "maintenance" || m === "full_coach") {
    return m;
  }
  return "full_coach";
}

export function isFoodOnlyMode(
  profile: OnboardingAnswers | null | undefined,
): boolean {
  return getAppUsageMode(profile) === "food_only";
}

