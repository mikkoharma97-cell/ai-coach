/**
 * Liikkumisen progressiivinen ohjaus — päivittäinen kuorma, ei irrallinen "juoksuohjelma".
 */
import {
  getDailyCoachDecisionV2,
  type CoachDecisionV2,
} from "@/lib/coach/decisionEngineV2";
import { normalizeProfileForEngine } from "@/lib/coach/profileNormalizer";
import { packageActivityStepDelta } from "@/lib/programPackages";
import {
  resolveProgramTrackId,
  trackActivityStepDelta,
} from "@/lib/programTracks";
import type { Locale } from "@/lib/i18n";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";

export type ActivityLoadRecommendation = "hold" | "increase" | "reduce";

export type ActivityProgressionResult = {
  /** Arvioitu päivittäinen askel-tavoite (peruspaketti + raita + säätö) */
  dailyMovementSteps: number;
  stepGuidanceKey: "engine.progression.activity.walk" | "engine.progression.activity.move";
  activityLoadRecommendation: ActivityLoadRecommendation;
  adjustmentReasonKey:
    | "engine.progression.activity.recoveryFirst"
    | "engine.progression.activity.supportDeficit"
    | "engine.progression.activity.steady";
};

const BASE_STEPS = 7_200;

function baseStepsFromProfile(profile: OnboardingAnswers): number {
  const p = normalizeProfileForEngine(profile);
  const pkg = packageActivityStepDelta(p.selectedPackageId);
  const tr = trackActivityStepDelta(resolveProgramTrackId(p));
  return Math.max(5_000, Math.min(14_000, BASE_STEPS + pkg + tr));
}

/**
 * Päivän aktiviteetti: tavoite + suunta (V2-signaalit + tavoite).
 */
export function buildActivityProgressionResult(input: {
  profile: OnboardingAnswers;
  locale: Locale;
  plan: CoachDailyPlan;
  now: Date;
  decisionV2?: CoachDecisionV2;
}): ActivityProgressionResult {
  const p = normalizeProfileForEngine(input.profile);
  const v2 =
    input.decisionV2 ??
    getDailyCoachDecisionV2({
      profile: p,
      referenceDate: input.now,
      locale: input.locale,
      plan: input.plan,
    });
  let steps = baseStepsFromProfile(p);
  let load: ActivityLoadRecommendation = "hold";
  let reason: ActivityProgressionResult["adjustmentReasonKey"] =
    "engine.progression.activity.steady";

  if (v2.signals.activityShortfall) {
    steps = Math.min(12_000, steps + 1_200);
    load = "increase";
    reason = "engine.progression.activity.supportDeficit";
  } else if (p.goal === "lose_weight" && !v2.signals.missedTrainingDay) {
    steps = Math.min(11_000, steps + 400);
    load = "hold";
    reason = "engine.progression.activity.supportDeficit";
  }

  if (v2.signals.missedTrainingDay || v2.signals.missedWorkoutLogged) {
    steps = Math.max(5_500, steps - 600);
    load = "reduce";
    reason = "engine.progression.activity.recoveryFirst";
  }

  const walkKey: ActivityProgressionResult["stepGuidanceKey"] =
    steps >= 9_000 ? "engine.progression.activity.walk" : "engine.progression.activity.move";

  return {
    dailyMovementSteps: Math.round(steps / 100) * 100,
    stepGuidanceKey: walkKey,
    activityLoadRecommendation: load,
    adjustmentReasonKey: reason,
  };
}
