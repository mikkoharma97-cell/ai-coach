import {
  DEFAULT_COACH_FEATURE_TOGGLES,
  type CoachFeatureToggles,
} from "@/types/coachPreferences";
import type { OnboardingAnswers } from "@/types/coach";

export function getCoachFeatureToggles(
  profile: OnboardingAnswers | null,
): CoachFeatureToggles {
  if (!profile) {
    return { ...DEFAULT_COACH_FEATURE_TOGGLES };
  }
  return {
    ...DEFAULT_COACH_FEATURE_TOGGLES,
    ...profile.coachFeatureToggles,
  };
}

export function mergeCoachFeatureToggles(
  profile: OnboardingAnswers,
  partial: Partial<CoachFeatureToggles>,
): CoachFeatureToggles {
  return { ...getCoachFeatureToggles(profile), ...partial };
}

export function isFeatureEnabled(
  profile: OnboardingAnswers | null,
  key: keyof CoachFeatureToggles,
): boolean {
  return getCoachFeatureToggles(profile)[key];
}
