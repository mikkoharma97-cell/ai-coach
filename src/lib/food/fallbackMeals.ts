/**
 * Nopeat korvaavat vaihtoehdot — ei reseptikirjaa, vain rakenteet.
 */
import type { NutritionBlueprint } from "@/lib/nutritionBlueprints";

export type FallbackUseCase =
  | "missed_meal"
  | "late_shift"
  | "pre_workout"
  | "post_workout"
  | "off_plan"
  | "busy_day";

export type FallbackMealOption = {
  id: string;
  nameFi: string;
  nameEn: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
  useCases: FallbackUseCase[];
};

export const FALLBACK_MEAL_BANK: FallbackMealOption[] = [
  {
    id: "fb_quark_berries",
    nameFi: "Proteiinirahka + marjat",
    nameEn: "Protein quark + berries",
    calories: 220,
    protein: 28,
    carbs: 22,
    fat: 3,
    tags: ["quick", "protein", "balanced"],
    useCases: ["missed_meal", "busy_day", "off_plan"],
  },
  {
    id: "fb_turkey_wrap",
    nameFi: "Kalkkuna / kana wrap",
    nameEn: "Turkey / chicken wrap",
    calories: 380,
    protein: 32,
    carbs: 38,
    fat: 12,
    tags: ["protein", "balanced"],
    useCases: ["busy_day", "off_plan", "post_workout"],
  },
  {
    id: "fb_quark_oats",
    nameFi: "Rahka + kaura",
    nameEn: "Quark + oats",
    calories: 290,
    protein: 24,
    carbs: 36,
    fat: 6,
    tags: ["quick", "carbs", "protein"],
    useCases: ["pre_workout", "missed_meal", "busy_day"],
  },
  {
    id: "fb_salad_protein",
    nameFi: "Valmis salaatti + proteiini",
    nameEn: "Ready salad + protein",
    calories: 320,
    protein: 30,
    carbs: 18,
    fat: 14,
    tags: ["light", "protein"],
    useCases: ["off_plan", "busy_day", "missed_meal"],
  },
  {
    id: "fb_smoothie_whey",
    nameFi: "Smoothie + proteiinilisä",
    nameEn: "Smoothie + protein",
    calories: 260,
    protein: 30,
    carbs: 28,
    fat: 4,
    tags: ["quick", "protein", "liquid"],
    useCases: ["post_workout", "pre_workout", "busy_day"],
  },
  {
    id: "fb_ready_hp",
    nameFi: "Lämmin valmisateria (high protein)",
    nameEn: "Warm ready meal (high protein)",
    calories: 450,
    protein: 38,
    carbs: 42,
    fat: 14,
    tags: ["protein", "warm"],
    useCases: ["late_shift", "missed_meal", "off_plan"],
  },
  {
    id: "fb_night_snack",
    nameFi: "Myöhäinen välipala (vuoro / pitkä päivä)",
    nameEn: "Late snack (shift / long day)",
    calories: 180,
    protein: 22,
    carbs: 12,
    fat: 5,
    tags: ["light", "protein", "quick"],
    useCases: ["late_shift", "busy_day"],
  },
];

export type FallbackSituation = {
  /** painotetaan tilannetta */
  primary: FallbackUseCase;
  hasTrainingToday?: boolean;
  supportsQuickFallbacks?: boolean;
  timingMode?: NutritionBlueprint["timingMode"];
};

function score(
  m: FallbackMealOption,
  situation: FallbackSituation,
): number {
  let s = 0;
  if (m.useCases.includes(situation.primary)) s += 4;
  if (situation.primary === "pre_workout" && m.tags.includes("carbs")) s += 2;
  if (situation.primary === "post_workout" && m.protein >= 28) s += 2;
  if (situation.timingMode === "shift_based" && m.useCases.includes("late_shift"))
    s += 2;
  if (situation.supportsQuickFallbacks && m.tags.includes("quick")) s += 1;
  if (situation.hasTrainingToday && m.tags.includes("protein")) s += 1;
  return s;
}

export function getFallbackMealsForSituation(
  situation: FallbackSituation,
  limit = 3,
): FallbackMealOption[] {
  const ranked = [...FALLBACK_MEAL_BANK].sort(
    (a, b) => score(b, situation) - score(a, situation),
  );
  return ranked.slice(0, limit);
}
