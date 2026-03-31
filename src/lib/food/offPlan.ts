/**
 * Ohisyöminen ja nopeat korvaavat kirjaukset — ei täyttä ruokapäiväkirjaa, vain makrotasapaino.
 */

export type OffPlanMeal = {
  id: string;
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  source: "manual" | "barcode" | "catalog";
  timingTag?: "breakfast" | "lunch" | "dinner" | "snack";
};

export type MacroTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type DayMacroPlan = {
  targets: MacroTotals;
  consumed: MacroTotals;
};

export type CorrectionStrategy =
  | "spread_remaining"
  | "boost_protein"
  | "reduce_calories"
  | "add_training_carbs"
  | "balance_flex"
  | "none";


export function applyOffPlanMealToDay(input: {
  dayPlan: DayMacroPlan;
  meal: OffPlanMeal;
  target: MacroTotals;
}): {
  remaining: MacroTotals;
  correctionStrategy: CorrectionStrategy;
} {
  const { dayPlan, meal } = input;
  const nextConsumed: MacroTotals = {
    calories: dayPlan.consumed.calories + meal.calories,
    protein: dayPlan.consumed.protein + meal.protein,
    carbs: dayPlan.consumed.carbs + meal.carbs,
    fat: dayPlan.consumed.fat + meal.fat,
  };

  const remaining: MacroTotals = {
    calories: Math.max(0, input.target.calories - nextConsumed.calories),
    protein: Math.max(0, input.target.protein - nextConsumed.protein),
    carbs: Math.max(0, input.target.carbs - nextConsumed.carbs),
    fat: Math.max(0, input.target.fat - nextConsumed.fat),
  };

  let correctionStrategy: CorrectionStrategy = "spread_remaining";
  if (nextConsumed.calories > input.target.calories * 1.05) {
    correctionStrategy = "reduce_calories";
  } else if (nextConsumed.protein < input.target.protein * 0.75 && remaining.calories > 200) {
    correctionStrategy = "boost_protein";
  } else {
    correctionStrategy = "spread_remaining";
  }

  return { remaining, correctionStrategy };
}

export function mergeOffPlanMealsIntoConsumed(
  base: MacroTotals,
  meals: OffPlanMeal[],
): MacroTotals {
  let o = { ...base };
  for (const m of meals) {
    o = {
      calories: o.calories + m.calories,
      protein: o.protein + m.protein,
      carbs: o.carbs + m.carbs,
      fat: o.fat + m.fat,
    };
  }
  return o;
}
