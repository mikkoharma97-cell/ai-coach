/**
 * Ruokamoottori V1 — makrot + ateriarakenteen luokka (profiili + blueprint).
 * Peruslaskenta: `lib/nutrition.ts`.
 */
import type { MessageKey } from "@/lib/i18n";
import { normalizeProfileForEngine } from "@/lib/coach/profileNormalizer";
import {
  bodyWeightKgForMacros,
  calorieTargetForUser,
  macrosFromBodyWeight,
} from "@/lib/nutrition";
import { resolveProgramFromProfile } from "@/lib/profileProgramResolver";
import type { LifeSchedule, NutritionBlueprintId, OnboardingAnswers } from "@/types/coach";
import { effectiveTrainingLevel } from "@/lib/profileTraining";

export type MealStructureKind =
  | "three_meals_easy"
  | "four_meals_normal"
  | "five_meals_performance"
  | "busy"
  | "social_flex"
  | "shift_work";

export type NutritionEngineSnapshot = {
  nutritionBlueprintId: NutritionBlueprintId;
  mealStructureKind: MealStructureKind;
  /** Proteiini g/kg (painon kanssa ~1,6–2,2) */
  proteinGPerKgBand: { min: number; max: number };
  targetKcal: number;
  macros: { proteinG: number; carbsG: number; fatG: number };
  weightIsFallback: boolean;
  /** Lyhyt “miksi tämä rakenne” -avain */
  structureRationaleKey: MessageKey;
};

function lifeScheduleRaw(profile: OnboardingAnswers): LifeSchedule {
  const p = normalizeProfileForEngine(profile);
  return p.lifeSchedule ?? "regular";
}

function blueprintToMealKind(
  nb: NutritionBlueprintId,
  life: LifeSchedule,
  socialOften: boolean,
): MealStructureKind {
  if (life === "shift_work") return "shift_work";
  if (life === "busy_day" || life === "late_schedule" || life === "student") {
    return "busy";
  }
  if (socialOften && (nb === "event_balance" || nb === "steady_meals")) {
    return "social_flex";
  }
  switch (nb) {
    case "easy_daily":
      return "three_meals_easy";
    case "steady_meals":
    case "light_cut_meal":
    case "train_vs_rest":
      return "four_meals_normal";
    case "muscle_fuel":
    case "pro_nutrition":
      return "five_meals_performance";
    case "shift_clock":
      return "shift_work";
    case "event_balance":
      return "social_flex";
    default:
      return "four_meals_normal";
  }
}

function structureRationaleKey(
  kind: MealStructureKind,
): MessageKey {
  const m: Record<MealStructureKind, MessageKey> = {
    three_meals_easy: "engine.nutrition.structure.three_easy",
    four_meals_normal: "engine.nutrition.structure.four_normal",
    five_meals_performance: "engine.nutrition.structure.five_performance",
    busy: "engine.nutrition.structure.busy",
    social_flex: "engine.nutrition.structure.social_flex",
    shift_work: "engine.nutrition.structure.shift",
  };
  return m[kind];
}

function proteinBandGPerKg(profile: OnboardingAnswers): { min: number; max: number } {
  const level = effectiveTrainingLevel(profile);
  let min = 1.6;
  let max = 2.05;
  if (profile.goal === "build_muscle") max = 2.2;
  if (profile.goal === "lose_weight") {
    min = 1.75;
    max = 2.1;
  }
  if (level === "advanced" && profile.goal === "build_muscle") max = 2.2;
  if (level === "beginner") min = Math.max(1.6, min - 0.05);
  return { min, max: Math.min(2.2, max) };
}

/**
 * Yksi kutsu: makrot + rakenneluokka + viite proteiinille.
 */
export function buildNutritionEngineSnapshot(
  profile: OnboardingAnswers,
): NutritionEngineSnapshot {
  const p = normalizeProfileForEngine(profile);
  const resolved = resolveProgramFromProfile(p);
  const nb = resolved.nutritionBlueprintId;
  const life = lifeScheduleRaw(p);
  const socialOften = p.socialEatingFrequency === "often";
  const kind = blueprintToMealKind(nb, life, socialOften);
  const kcal = calorieTargetForUser(p);
  const macros = macrosFromBodyWeight(p, kcal);
  const { isFallback } = bodyWeightKgForMacros(p);

  return {
    nutritionBlueprintId: nb,
    mealStructureKind: kind,
    proteinGPerKgBand: proteinBandGPerKg(p),
    targetKcal: kcal,
    macros,
    weightIsFallback: isFallback,
    structureRationaleKey: structureRationaleKey(kind),
  };
}
