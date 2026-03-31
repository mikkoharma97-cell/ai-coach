/**
 * Loppupäivän makrotasapaino — maltilliset korjaukset, ei yhden aterian ääriarvoja.
 */
import type { NutritionBlueprint } from "@/lib/nutritionBlueprints";
import type { OnboardingAnswers } from "@/types/coach";
import type { CorrectionStrategy, MacroTotals } from "@/lib/food/offPlan";

export type MacroCorrectionSeverity = "low" | "medium" | "high";

export type MacroCorrectionPlan = {
  mealTargetsRestOfDay: MacroTotals;
  perMealIfSplitEvenly: MacroTotals;
  explanationFi: string;
  explanationEn: string;
  severity: MacroCorrectionSeverity;
  correctionStrategy: CorrectionStrategy;
};

function severityFromGaps(
  target: MacroTotals,
  consumed: MacroTotals,
): MacroCorrectionSeverity {
  const calG =
    target.calories > 0
      ? Math.abs(target.calories - consumed.calories) / target.calories
      : 0;
  const pG =
    target.protein > 0
      ? Math.max(0, target.protein - consumed.protein) / target.protein
      : 0;
  const stress = Math.max(calG, pG * 0.9);
  if (stress < 0.1) return "low";
  if (stress < 0.22) return "medium";
  return "high";
}

function capPerMealSlot(target: MacroTotals, m: MacroTotals): MacroTotals {
  return {
    calories: Math.min(m.calories, target.calories * 0.42),
    protein: Math.min(m.protein, target.protein * 0.38),
    carbs: Math.min(m.carbs, target.carbs * 0.42),
    fat: Math.min(m.fat, target.fat * 0.42),
  };
}

/**
 * Jakaa jäljellä olevat makrot jäljellä oleville aterioille.
 */
export function buildMacroCorrectionPlan(input: {
  target: MacroTotals;
  consumed: MacroTotals;
  remainingMeals: number;
  nutritionBlueprint: NutritionBlueprint;
  profile: Pick<OnboardingAnswers, "goal" | "mealStructure">;
  hasTrainingToday?: boolean;
  missedMeals?: number;
}): MacroCorrectionPlan {
  const {
    target,
    consumed,
    remainingMeals,
    nutritionBlueprint,
    profile,
    hasTrainingToday = false,
    missedMeals = 0,
  } = input;

  const rm = Math.max(1, Math.min(5, Math.round(remainingMeals)));

  let remaining: MacroTotals = {
    calories: Math.max(0, target.calories - consumed.calories),
    protein: Math.max(0, target.protein - consumed.protein),
    carbs: Math.max(0, target.carbs - consumed.carbs),
    fat: Math.max(0, target.fat - consumed.fat),
  };

  const overCal = consumed.calories > target.calories * 1.02;
  const proteinBehind = consumed.protein < target.protein * 0.72;
  const carbsBehind =
    hasTrainingToday &&
    nutritionBlueprint.includesWorkoutNutrition &&
    consumed.carbs < target.carbs * 0.58 &&
    profile.goal !== "lose_weight";

  let correctionStrategy: CorrectionStrategy = "spread_remaining";
  let explanationFi =
    "Päivä muuttui — tasapainotetaan loppu tästä. Jaa jäljellä olevat makrot seuraaviin aterioihin.";
  let explanationEn =
    "The day shifted — we balance the tail. Spread what’s left across upcoming meals.";

  if (overCal) {
    correctionStrategy = "reduce_calories";
    remaining.calories *= 0.88;
    remaining.carbs *= 0.93;
    remaining.fat *= 0.91;
    explanationFi =
      "Kalorit karkasivat yli — kevennetään loppupäivää maltillisesti.";
    explanationEn =
      "Calories went over — we lighten the rest of the day gently.";
  } else if (proteinBehind && remaining.calories > 120) {
    correctionStrategy = "boost_protein";
    remaining.protein *= 1.1;
    explanationFi =
      "Proteiini jäi vajaaksi. Nostetaan sitä seuraavilla aterioilla.";
    explanationEn =
      "Protein is behind. We raise it on the next meals first.";
  } else if (carbsBehind) {
    correctionStrategy = "add_training_carbs";
    remaining.carbs = Math.max(remaining.carbs, target.carbs * 0.18);
    explanationFi =
      "Hiilarit jäivät matalaksi treenipäivänä — pidetään kevyt hiilari mukana.";
    explanationEn =
      "Carbs are low on a training day — keep a modest carb anchor in.";
  }

  if (nutritionBlueprint.timingMode === "flex" && !overCal) {
    if (correctionStrategy === "spread_remaining") {
      correctionStrategy = "balance_flex";
    }
    if (correctionStrategy === "balance_flex") {
      explanationFi =
        "Et tarvitse täydellistä päivää — vain korjatun suunnan.";
      explanationEn =
        "You don’t need a perfect day — just a corrected direction.";
    }
  }

  if (nutritionBlueprint.style === "fatloss" && !overCal) {
    remaining.fat *= 0.94;
  }
  if (nutritionBlueprint.style === "performance") {
    remaining.protein = Math.max(
      remaining.protein,
      target.protein * 0.07 * rm,
    );
  }

  if (missedMeals > 0 && !overCal) {
    explanationFi =
      "Ateria jäi väliin — jaetaan puuttuva osuus jäljellä oleville aterioille.";
    explanationEn =
      "A meal was skipped — we fold that share into what’s left.";
  }

  const perMealRaw: MacroTotals = {
    calories: remaining.calories / rm,
    protein: remaining.protein / rm,
    carbs: remaining.carbs / rm,
    fat: remaining.fat / rm,
  };

  const perMealIfSplitEvenly = capPerMealSlot(target, perMealRaw);

  const severity = severityFromGaps(target, consumed);

  if (nutritionBlueprint.supportsQuickFallbacks && severity !== "low") {
    explanationFi += " Nopea korvaava valinta voi auttaa.";
    explanationEn += " A quick fallback can help.";
  }

  return {
    mealTargetsRestOfDay: { ...remaining },
    perMealIfSplitEvenly,
    explanationFi,
    explanationEn,
    severity,
    correctionStrategy,
  };
}
