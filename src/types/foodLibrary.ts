import type { Goal } from "@/types/coach";

export type FoodMealSlot =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "postworkout";

export type FoodLibraryItem = {
  id: string;
  nameFi: string;
  nameEn: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  tags: string[];
  category?: "breakfast" | "meal" | "snack" | "postworkout";
  goalFit?: Goal[];
  proteinLevel?: "low" | "mid" | "high";
  prepStyle?: "easy" | "normal" | "batch" | "quick";
  /** Yksi tai useampi slotti (V1: ydin voi käyttää vain mealSlot) */
  mealSlot?: FoodMealSlot;
  mealSlots?: FoodMealSlot[];
  cheap?: boolean;
  cheapFriendly?: boolean;
  shiftFriendly?: boolean;
  /** Lyhyt syy rivi hakukortille */
  whyFi?: string;
  whyEn?: string;
  commonIngredients?: string[];
};
