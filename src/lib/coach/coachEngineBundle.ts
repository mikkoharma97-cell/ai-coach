/**
 * Yksi polku: normalisointi → päätös → adaptaatio → selitys → palauterivit.
 */
import { getDailyCoachDecisionV2 } from "@/lib/coach/decisionEngineV2";
import { buildCoachExplanation, type CoachExplanation } from "@/lib/coach/explanationEngine";
import {
  buildFoodCoachLine,
  buildReviewCoachLine,
  buildTodayCoachLine,
  buildWorkoutCoachLine,
} from "@/lib/coach/feedbackEngine";
import { normalizeProfileForEngine } from "@/lib/coach/profileNormalizer";
import { buildCoachProgramDecision, type CoachProgramDecision } from "@/lib/coach/programDecisionEngine";
import {
  buildWeeklyAdaptation,
  type WeeklyAdaptation,
  type WeeklyRecentSignals,
} from "@/lib/coach/weekAdaptationEngine";
import type { Locale } from "@/lib/i18n";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";

export type CoachEngineBundle = {
  normalizedProfile: OnboardingAnswers;
  decision: CoachProgramDecision;
  adaptation: WeeklyAdaptation;
  explanation: CoachExplanation;
  lines: {
    today: string;
    food: string;
    workout: string;
    review: string;
  };
};

function signalsFromToday(
  profile: OnboardingAnswers,
  plan: CoachDailyPlan | null,
  now: Date,
  locale: Locale,
  activeException: boolean,
): WeeklyRecentSignals {
  if (!plan) {
    return {
      exceptionMode: activeException,
    };
  }
  const v2 = getDailyCoachDecisionV2({
    profile,
    referenceDate: now,
    locale,
    plan,
  });
  return {
    missedWorkout:
      v2.signals.missedTrainingDay || v2.signals.missedWorkoutLogged,
    overeatingRebalance: Boolean(plan.rebalancePlan),
    lowActivity: v2.signals.activityShortfall,
    exceptionMode: activeException,
    poorRecovery: false,
    highConsistency: v2.signals.streakN >= 5,
    skippedLogs: false,
    socialDisruption:
      profile.socialEatingFrequency === "often" && Boolean(plan.rebalancePlan),
  };
}

export function buildCoachEngineBundle(input: {
  profile: OnboardingAnswers;
  locale: Locale;
  now: Date;
  plan: CoachDailyPlan | null;
  activeException: boolean;
}): CoachEngineBundle {
  const normalizedProfile = normalizeProfileForEngine(input.profile);
  const decision = buildCoachProgramDecision(normalizedProfile);
  const signals = signalsFromToday(
    normalizedProfile,
    input.plan,
    input.now,
    input.locale,
    input.activeException,
  );
  const adaptation = buildWeeklyAdaptation(normalizedProfile, signals);
  const explanation = buildCoachExplanation(
    normalizedProfile,
    decision,
    adaptation,
    input.locale,
  );
  return {
    normalizedProfile,
    decision,
    adaptation,
    explanation,
    lines: {
      today: buildTodayCoachLine(input.locale, explanation),
      food: buildFoodCoachLine(input.locale, explanation),
      workout: buildWorkoutCoachLine(input.locale, decision),
      review: buildReviewCoachLine(input.locale, adaptation),
    },
  };
}
