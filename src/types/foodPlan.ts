import type { ProgramPackage } from "@/lib/programPackages";

/** Paketin mealStyle — ruokapäivän rytmi. */
export type FoodDayStyle = ProgramPackage["mealStyle"];

export type FoodMeal = {
  id: string;
  name: string;
  /** Esim. aikavyöhyke: "Aamu", "Keskipäivä" */
  timingLabel?: string;
  items: string[];
  /** Esim. korostus: "Seuraava ateria" — sama locale kuin päivä */
  emphasis?: string;
};

/**
 * Yksi lähde ruokapäivälle: Today planFoodLabel + Food-näkymä.
 */
export type FoodDayPlan = {
  /** Lyhyt päiväotsikko (esim. "Tänään") */
  dayLabel: string;
  mealCount: number;
  /** Rytmi ilman lukumäärää */
  styleLabel: string;
  /** Päivän päärivi — sama merkkijono kuin Today `planFoodLabel` */
  foodPlanLabel: string;
  /** Miksi tämä päivä syödään näin (1–3 riviä copy) */
  guidanceLine: string;
  meals: FoodMeal[];
  /** Korostettava seuraava / aktiivinen ateria */
  nextMealId: string;
};
