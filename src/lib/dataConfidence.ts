import { countDaysWithFoodLog } from "@/lib/food/foodLogCoverage";
import type { MessageKey } from "@/lib/i18n";
import type { OnboardingAnswers } from "@/types/coach";

/** Today / app — vähän merkintöjä tai tavoite puuttuu */
export function appDataFallbackKey(
  profile: OnboardingAnswers,
  combinedStreak: number,
): MessageKey | null {
  const noGoal =
    profile.targetWeight == null || !profile.targetDate?.trim();
  if (noGoal || combinedStreak < 3) return "fallback.sharpensWithUse";
  return null;
}

/** Ruoka — kun viikon kirjauksia vähän */
export function foodDataFallbackKey(referenceDate: Date): MessageKey | null {
  if (countDaysWithFoodLog(referenceDate, 7) < 2) {
    return "fallback.firstWeeksBuildView";
  }
  return null;
}

export function workoutDataFallbackKey(combinedStreak: number): MessageKey | null {
  if (combinedStreak < 2) return "fallback.trendClearerWithData";
  return null;
}

export function progressDataFallbackKey(combinedStreak: number): MessageKey | null {
  if (combinedStreak < 4) return "fallback.trendClearerWithData";
  return null;
}

export function reviewDataFallbackKey(streakDays: number): MessageKey | null {
  if (streakDays < 3) return "fallback.firstWeeksBuildView";
  return null;
}
