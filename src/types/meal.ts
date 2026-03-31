import type { MealSlot } from "@/types/coach";

/**
 * Ydinperiaate: **ei yksi kiinteä ateria**, vaan **vaihtoehtopohjainen systeemi**.
 * Vähimmäismuoto: tyyppi + useita vaihtoehtoja (käyttäjä / generaattori valitsee joukosta).
 */
export type MealOptionGroup = {
  type: MealSlot;
  /** Vaihtoehdot (esim. 2–3 konkreettista yhdistelmää) */
  options: string[];
};

/**
 * Laajennettu ateria katalogissa / laskennassa: makrot + tunniste `MealOptionGroup`-rakenteen päälle.
 */
export type Meal = MealOptionGroup & {
  id: string;
  protein: number;
  carbs: number;
  fats: number;
};
