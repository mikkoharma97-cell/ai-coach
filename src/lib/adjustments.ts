import type { CoachPlan, OnboardingAnswers, TodayWithAdjustments } from "@/types/coach";
import {
  buildAdaptiveUserState,
  computeYesterdayAdjustmentSignals,
  generateDailyAdjustments,
} from "@/lib/adaptive";
import type { Locale } from "@/lib/i18n";
import { generatePersonalizedPlan } from "@/lib/plan";
import { loadProfile } from "@/lib/storage";

/**
 * Convenience: base plan + adjustments in one call (client-only storage).
 */
export function generateAdjustedPlan(
  answers: OnboardingAnswers,
  referenceDate: Date = new Date(),
  locale: Locale = "fi",
): CoachPlan & TodayWithAdjustments {
  const base = generatePersonalizedPlan(answers, referenceDate, locale);
  const userState = buildAdaptiveUserState(answers, referenceDate);
  return {
    ...base,
    ...generateDailyAdjustments(userState, base, locale),
  };
}

/** Signals for Balance / Adjustments UI — mirrors inputs to `generateDailyAdjustments`. */
export function getYesterdayAdjustmentSignals(
  plan: CoachPlan,
  referenceDate: Date,
): {
  yesterdayDone: boolean;
  missedTrainingDay: boolean;
  missedWorkoutLogged: boolean;
  calorieDrift: boolean;
  activityShortfall: boolean;
} {
  const profile = loadProfile();
  if (!profile) {
    return {
      yesterdayDone: false,
      missedTrainingDay: false,
      missedWorkoutLogged: false,
      calorieDrift: false,
      activityShortfall: false,
    };
  }
  const userState = buildAdaptiveUserState(profile, referenceDate);
  return computeYesterdayAdjustmentSignals(userState, plan);
}
