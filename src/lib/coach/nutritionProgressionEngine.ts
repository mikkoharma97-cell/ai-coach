/**
 * Ravinnon progressiivinen ohjaus — näyttö + adherence, ei rinnakkaista kalorilaskentaa.
 * Totuus kcal/protein: `composeCoachDailyPlan` / `plan.todayCalories`.
 */
import {
  getDailyCoachDecisionV2,
  type CoachDecisionV2,
} from "@/lib/coach/decisionEngineV2";
import { buildNutritionEngineSnapshot } from "@/lib/coach/nutritionEngine";
import { normalizeProfileForEngine } from "@/lib/coach/profileNormalizer";
import type { Locale, MessageKey } from "@/lib/i18n";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";

export type NutritionAdjustmentDirection = "hold" | "increase" | "reduce";

export type NutritionAdherenceSignal = "low" | "mid" | "high";

export type NutritionProgressionResult = {
  calorieTarget: number;
  proteinTarget: number;
  adjustmentDirection: NutritionAdjustmentDirection;
  adjustmentReasonKey: MessageKey;
  mealStructureRecommendationKey: MessageKey;
  adherenceSignal: NutritionAdherenceSignal;
};

function adherenceFromV2(
  signals: ReturnType<typeof getDailyCoachDecisionV2>["signals"],
): NutritionAdherenceSignal {
  if (signals.streakN >= 5 && !signals.missedTrainingDay) return "high";
  if (
    signals.missedTrainingDay ||
    signals.missedWorkoutLogged ||
    signals.activityShortfall
  ) {
    return "low";
  }
  return "mid";
}

function directionForGoal(
  goal: OnboardingAnswers["goal"],
  adherence: NutritionAdherenceSignal,
  rebalance: boolean,
): NutritionAdjustmentDirection {
  if (adherence === "low") return "hold";
  if (rebalance && goal === "lose_weight") return "hold";
  if (goal === "lose_weight") return "reduce";
  if (goal === "build_muscle") return "increase";
  return "hold";
}

function reasonKey(
  dir: NutritionAdjustmentDirection,
  adherence: NutritionAdherenceSignal,
): MessageKey {
  if (adherence === "low") return "engine.progression.nutrition.fixStructureFirst";
  if (dir === "hold") return "engine.progression.nutrition.holdLine";
  if (dir === "reduce") return "engine.progression.nutrition.gentleDeficit";
  if (dir === "increase") return "engine.progression.nutrition.smallStepsUp";
  return "engine.progression.nutrition.holdLine";
}

/**
 * Yhdistää profiilin, päivän suunnitelman ja V2-signaalit yhdeksi näyttöön.
 */
export function buildNutritionProgressionResult(input: {
  profile: OnboardingAnswers;
  locale: Locale;
  plan: CoachDailyPlan;
  now: Date;
  /** Jos annettu, sama instanssi kuin muissa progression-moottoreissa — yksi trendilukema. */
  decisionV2?: CoachDecisionV2;
}): NutritionProgressionResult {
  const p = normalizeProfileForEngine(input.profile);
  const snap = buildNutritionEngineSnapshot(p);
  const v2 =
    input.decisionV2 ??
    getDailyCoachDecisionV2({
      profile: p,
      referenceDate: input.now,
      locale: input.locale,
      plan: input.plan,
    });
  const adherence = adherenceFromV2(v2.signals);
  const rebalance = Boolean(input.plan.rebalancePlan);
  const direction = directionForGoal(p.goal, adherence, rebalance);

  return {
    calorieTarget: input.plan.todayCalories,
    proteinTarget: input.plan.foodProteinTargetG ?? input.plan.todayMacros.proteinG,
    adjustmentDirection: direction,
    adjustmentReasonKey: reasonKey(direction, adherence),
    mealStructureRecommendationKey: snap.structureRationaleKey,
    adherenceSignal: adherence,
  };
}
