/**
 * HÄRMÄ42 — yksi progression-aggregaatti: ruoka, liike, treeni.
 * Päätökset V2-signaaleista (streak, väliin jääneet, aktiviteetti) — ei satunnaisuutta.
 */
import { getDailyCoachDecisionV2 } from "@/lib/coach/decisionEngineV2";
import { normalizeProfileForEngine } from "@/lib/coach/profileNormalizer";
import {
  buildActivityProgressionResult,
  type ActivityProgressionResult,
} from "@/lib/coach/activityProgressionEngine";
import {
  buildNutritionProgressionResult,
  type NutritionProgressionResult,
} from "@/lib/coach/nutritionProgressionEngine";
import {
  buildTrainingProgressionResult,
  type TrainingProgressionResult,
} from "@/lib/coach/trainingProgressionEngine";
import type { Locale } from "@/lib/i18n";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";

export type ProgressionTriState = "hold" | "increase" | "reduce";

export type FullProgressionSignalDigest = {
  streakN: number;
  missedTraining: boolean;
  activityShortfall: boolean;
  rebalanceActive: boolean;
};

export type FullProgressionEngineResult = {
  nutrition: NutritionProgressionResult;
  activity: ActivityProgressionResult;
  training: TrainingProgressionResult;
  food: ProgressionTriState;
  activityState: ProgressionTriState;
  trainingState: ProgressionTriState;
  signalDigest: FullProgressionSignalDigest;
};

export function trainingResultToTriState(
  t: TrainingProgressionResult,
): ProgressionTriState {
  if (t.progressLoad) return "increase";
  if (t.deload) return "reduce";
  return "hold";
}

export function buildFullProgressionEngineResult(input: {
  profile: OnboardingAnswers;
  locale: Locale;
  plan: CoachDailyPlan;
  now: Date;
}): FullProgressionEngineResult {
  const p = normalizeProfileForEngine(input.profile);
  const decisionV2 = getDailyCoachDecisionV2({
    profile: p,
    referenceDate: input.now,
    locale: input.locale,
    plan: input.plan,
  });

  const nutrition = buildNutritionProgressionResult({
    profile: input.profile,
    locale: input.locale,
    plan: input.plan,
    now: input.now,
    decisionV2,
  });
  const activity = buildActivityProgressionResult({
    profile: input.profile,
    locale: input.locale,
    plan: input.plan,
    now: input.now,
    decisionV2,
  });
  const training = buildTrainingProgressionResult({
    profile: input.profile,
    locale: input.locale,
    plan: input.plan,
    now: input.now,
    decisionV2,
  });

  const sig = decisionV2.signals;
  return {
    nutrition,
    activity,
    training,
    food: nutrition.adjustmentDirection,
    activityState: activity.activityLoadRecommendation,
    trainingState: trainingResultToTriState(training),
    signalDigest: {
      streakN: sig.streakN,
      missedTraining: sig.missedTrainingDay || sig.missedWorkoutLogged,
      activityShortfall: sig.activityShortfall,
      rebalanceActive: Boolean(input.plan.rebalancePlan),
    },
  };
}
