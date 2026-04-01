import type { MealSlot, MealStructurePreference } from "@/types/coach";

/** Sama jako kuin `generateDailyMeals` / `adjustMealToUser`. */
export function engineSlotShare(
  slot: MealSlot,
  structure: MealStructurePreference,
): number {
  if (structure === "snack_forward") {
    switch (slot) {
      case "breakfast":
        return 0.26;
      case "lunch":
        return 0.36;
      case "snack":
        return 0.08;
      case "dinner":
        return 0.32;
    }
  }
  switch (slot) {
    case "breakfast":
      return 0.26;
    case "lunch":
      return 0.36;
    case "dinner":
      return 0.32;
    case "snack":
      return 0.08;
  }
}

export function estimateProteinForSlot(
  dailyProteinG: number,
  slot: MealSlot,
  structure: MealStructurePreference,
): number {
  return Math.max(
    8,
    Math.round(dailyProteinG * engineSlotShare(slot, structure)),
  );
}
