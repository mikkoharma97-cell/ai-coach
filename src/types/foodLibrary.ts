import type { Goal } from "@/types/coach";

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
  mealSlot?: "breakfast" | "lunch" | "dinner" | "snack" | "postworkout";
  cheap?: boolean;
  shiftFriendly?: boolean;
};
