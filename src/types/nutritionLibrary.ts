import type { Goal, MealStructurePreference, NutritionBlueprintId } from "@/types/coach";

export type NutritionRhythmType =
  | "three_easy"
  | "four_normal"
  | "five_performance"
  | "busy"
  | "shift"
  | "social"
  | "cut"
  | "growth";

export type NutritionLibraryEntry = {
  id: string;
  nameFi: string;
  nameEn: string;
  goal: Goal | "any";
  mealsPerDay: number;
  rhythmType: NutritionRhythmType;
  shortDescriptionFi: string;
  shortDescriptionEn: string;
  idealForFi: string;
  idealForEn: string;
  styleTag: string;
  proteinBias: "standard" | "high" | "very_high";
  flexibilityLevel: "structured" | "balanced" | "flex";
  shiftCompatible: boolean;
  nutritionBlueprintId: NutritionBlueprintId;
  mealStructure: MealStructurePreference;
};
