import type { ProgramPackage } from "@/lib/programPackages";

/** Paketin mealStyle — ruokapäivän rytmi. */
export type FoodDayStyle = ProgramPackage["mealStyle"];

export type FoodMeal = {
  id: string;
  name: string;
  items: string[];
  /** Valinnainen painotus (esim. “pääateria”) — UI voi jättää piiloon V1 */
  emphasis?: string;
};

/**
 * Yksi lähde ruokapäivälle: Today, Food-ruutu ja labelit.
 */
export type FoodDayPlan = {
  /** Lyhyt päiväotsikko (esim. “Tänään”) — locale-spesifi */
  dayLabel: string;
  mealCount: number;
  /** Rytmi ilman lukumäärää (esim. “korkea proteiini”) */
  styleLabel: string;
  /** Kokonaisrivi plan-blokkiin */
  planLabel: string;
  meals: FoodMeal[];
};
