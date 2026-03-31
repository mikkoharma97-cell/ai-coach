/**
 * Ruokarakenteiden kirjasto — blueprint + ateriarytmi; valinta lukitsee nutritionBlueprintId:n.
 */
import { resolveProgramFromProfile } from "@/lib/profileProgramResolver";
import type { NutritionLibraryEntry } from "@/types/nutritionLibrary";
import type { Goal, OnboardingAnswers } from "@/types/coach";

export const NUTRITION_LIBRARY: NutritionLibraryEntry[] = [
  {
    id: "easy_3_meals",
    nameFi: "3 ateriaa — helppo",
    nameEn: "3 meals — easy",
    goal: "any",
    mealsPerDay: 3,
    rhythmType: "three_easy",
    shortDescriptionFi: "Selkeä kolmijako, ei välipala stressiä.",
    shortDescriptionEn: "Clear three blocks, no snack stress.",
    idealForFi: "Säännöllinen arki.",
    idealForEn: "A regular week.",
    styleTag: "helppo",
    proteinBias: "standard",
    flexibilityLevel: "balanced",
    shiftCompatible: true,
    nutritionBlueprintId: "easy_daily",
    mealStructure: "three_meals",
  },
  {
    id: "normal_4_meals",
    nameFi: "4 ateriaa — tasapaino",
    nameEn: "4 meals — balance",
    goal: "any",
    mealsPerDay: 4,
    rhythmType: "four_normal",
    shortDescriptionFi: "Lounas ja välipala jakavat päivän.",
    shortDescriptionEn: "Lunch and snack split the day.",
    idealForFi: "Useimmat tavoitteet.",
    idealForEn: "Most goals.",
    styleTag: "normaali",
    proteinBias: "high",
    flexibilityLevel: "balanced",
    shiftCompatible: true,
    nutritionBlueprintId: "steady_meals",
    mealStructure: "snack_forward",
  },
  {
    id: "performance_5_meals",
    nameFi: "5 ateriaa — suoritus",
    nameEn: "5 meals — performance",
    goal: "build_muscle",
    mealsPerDay: 5,
    rhythmType: "five_performance",
    shortDescriptionFi: "Energia jakautuu koko päivään.",
    shortDescriptionEn: "Energy spread across the day.",
    idealForFi: "Kasvu ja isompi treenimäärä.",
    idealForEn: "Growth and higher training load.",
    styleTag: "suoritus",
    proteinBias: "very_high",
    flexibilityLevel: "structured",
    shiftCompatible: false,
    nutritionBlueprintId: "muscle_fuel",
    mealStructure: "snack_forward",
  },
  {
    id: "busy_day_meals",
    nameFi: "Kiire — minimi ateriat",
    nameEn: "Busy — minimal meals",
    goal: "any",
    mealsPerDay: 3,
    rhythmType: "busy",
    shortDescriptionFi: "Nopeat valinnat, ei monimutkaista.",
    shortDescriptionEn: "Fast choices, nothing fancy.",
    idealForFi: "Kiireinen viikko.",
    idealForEn: "A busy week.",
    styleTag: "kiire",
    proteinBias: "high",
    flexibilityLevel: "flex",
    shiftCompatible: true,
    nutritionBlueprintId: "easy_daily",
    mealStructure: "three_meals",
  },
  {
    id: "shift_work_structure",
    nameFi: "Vuorotyö — kellon mukaan",
    nameEn: "Shift work — clock-based",
    goal: "any",
    mealsPerDay: 4,
    rhythmType: "shift",
    shortDescriptionFi: "Ateriat seuraavat vuoroa, ei kello kahdeksaa.",
    shortDescriptionEn: "Meals follow the shift, not the clock.",
    idealForFi: "Vuorotyö tai epäsäännöllinen rytmi.",
    idealForEn: "Shift work or irregular rhythm.",
    styleTag: "vuoro",
    proteinBias: "high",
    flexibilityLevel: "flex",
    shiftCompatible: true,
    nutritionBlueprintId: "shift_clock",
    mealStructure: "snack_forward",
  },
  {
    id: "social_flex_structure",
    nameFi: "Sosiaalinen joustava",
    nameEn: "Social flex",
    goal: "any",
    mealsPerDay: 4,
    rhythmType: "social",
    shortDescriptionFi: "Tapahtumat mukana ilman romahdusta.",
    shortDescriptionEn: "Events included without losing the plot.",
    idealForFi: "Kun syöt usein ulkona.",
    idealForEn: "When you eat out often.",
    styleTag: "joustava",
    proteinBias: "standard",
    flexibilityLevel: "flex",
    shiftCompatible: true,
    nutritionBlueprintId: "event_balance",
    mealStructure: "snack_forward",
  },
  {
    id: "high_protein_cut",
    nameFi: "Korkea proteiini — kevennys",
    nameEn: "High protein — cut",
    goal: "lose_weight",
    mealsPerDay: 4,
    rhythmType: "cut",
    shortDescriptionFi: "Proteiini pitää nälän kurissa.",
    shortDescriptionEn: "Protein keeps hunger in check.",
    idealForFi: "Painonhallinta.",
    idealForEn: "Weight control.",
    styleTag: "cut",
    proteinBias: "very_high",
    flexibilityLevel: "balanced",
    shiftCompatible: true,
    nutritionBlueprintId: "light_cut_meal",
    mealStructure: "lighter_evening",
  },
  {
    id: "muscle_gain_meal_flow",
    nameFi: "Kasvu — ateriatreeni",
    nameEn: "Growth — meal flow",
    goal: "build_muscle",
    mealsPerDay: 4,
    rhythmType: "growth",
    shortDescriptionFi: "Riittävästi ennen ja jälkeen treenin.",
    shortDescriptionEn: "Enough before and after training.",
    idealForFi: "Lihaskasvu.",
    idealForEn: "Muscle gain.",
    styleTag: "kasvu",
    proteinBias: "very_high",
    flexibilityLevel: "structured",
    shiftCompatible: true,
    nutritionBlueprintId: "muscle_fuel",
    mealStructure: "snack_forward",
  },
];

export function getNutritionLibraryEntry(id: string): NutritionLibraryEntry | undefined {
  return NUTRITION_LIBRARY.find((e) => e.id === id);
}

function matchesGoal(e: NutritionLibraryEntry, g: Goal): boolean {
  return e.goal === "any" || e.goal === g;
}

export function listNutritionForGoal(goal: Goal): NutritionLibraryEntry[] {
  return NUTRITION_LIBRARY.filter((e) => matchesGoal(e, goal));
}

export function recommendNutritionForProfile(profile: OnboardingAnswers): NutritionLibraryEntry {
  const resolved = resolveProgramFromProfile(profile);
  const pool = listNutritionForGoal(profile.goal);
  const hit = pool.find((e) => e.nutritionBlueprintId === resolved.nutritionBlueprintId);
  if (hit) return hit;
  return pool[0] ?? NUTRITION_LIBRARY[0];
}

export function alternativeNutritionForProfile(
  profile: OnboardingAnswers,
  recommended: NutritionLibraryEntry,
  limit = 5,
): NutritionLibraryEntry[] {
  return listNutritionForGoal(profile.goal)
    .filter((e) => e.id !== recommended.id)
    .slice(0, limit);
}

export function applyNutritionLibraryEntry(
  entryId: string,
): Partial<OnboardingAnswers> {
  const entry = getNutritionLibraryEntry(entryId);
  if (!entry) return {};
  return {
    selectedNutritionLibraryId: entry.id,
    nutritionBlueprintId: entry.nutritionBlueprintId,
    mealStructure: entry.mealStructure,
  };
}
