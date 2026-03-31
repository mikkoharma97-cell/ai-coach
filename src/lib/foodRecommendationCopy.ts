/**
 * Rule-based copy for Food recommendation UX — no AI, local only.
 */
import type { CoachDailyPlan, MealSlot, OnboardingAnswers } from "@/types/coach";
import type { MealOption } from "@/lib/mealEngine";
import type { MessageKey } from "@/lib/i18n";

function isRestDayWorkout(workout: string): boolean {
  const s = workout.toLowerCase();
  return /\blepo\b|rest|recovery|off|walk|kävely|kevyt\s+kävely|palautum/i.test(s);
}

/** Second bullet under “supports today’s goal” — training vs recovery day. */
export function foodGoalSupportEnergyKey(plan: CoachDailyPlan): MessageKey {
  return isRestDayWorkout(plan.todayWorkout)
    ? "food.goalSupportRestDay"
    : "food.goalSupportTrainEnergy";
}

/**
 * Short “why this meal” line — priority: training alignment → macro/slot fit → slot default.
 */
export function foodWhyThisMealKey(
  slot: MealSlot,
  profile: OnboardingAnswers,
  plan: CoachDailyPlan,
  option: MealOption | null,
): MessageKey {
  const rest = isRestDayWorkout(plan.todayWorkout);
  if (!rest && option && (slot === "lunch" || slot === "dinner")) {
    return "food.why.trainGoal";
  }
  if (
    option?.tags.includes("light") &&
    option.protein >= 24
  ) {
    return "food.why.lightProtein";
  }
  if (
    profile.goal === "build_muscle" &&
    option &&
    option.protein >= 35
  ) {
    return "food.why.muscleGoal";
  }
  if (
    profile.flexibility === "flexible" &&
    (slot === "dinner" || slot === "snack")
  ) {
    return "food.why.flexibleChoice";
  }
  if (profile.goal === "build_muscle") {
    return "food.why.proteinFocus";
  }

  const slotMap: Record<MealSlot, MessageKey> = {
    breakfast: "food.why.slotBreakfast",
    lunch: "food.why.slotLunch",
    dinner: "food.why.slotDinner",
    snack: "food.why.slotSnack",
  };
  return slotMap[slot];
}

/**
 * One-line live status under energy / macros on Food.
 */
export function foodEnergyStatusKey(
  profile: OnboardingAnswers,
  plan: CoachDailyPlan,
  macros: { p: number; c: number; f: number },
): MessageKey {
  const { p, c, f } = macros;
  const total = p + c + f;
  const pShare = total > 0 ? p / total : 0;

  if (plan.foodAdjustmentNote || plan.systemLine) {
    return "food.energyStatusAdjusted";
  }
  if (profile.flexibility === "flexible") {
    return "food.energyStatusFlexible";
  }
  if (pShare >= 0.32) {
    return "food.energyStatusProtein";
  }
  if (profile.mealStructure === "lighter_evening") {
    return "food.energyStatusLighter";
  }
  return "food.energyStatusBalanced";
}
