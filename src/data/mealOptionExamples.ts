import type { MealOptionGroup } from "@/types/meal";

/** Esimerkki: aamiainen useilla vaihtoehdoilla (ei yksi kiinteä lista). */
export const breakfastOptionsExample: MealOptionGroup = {
  type: "breakfast",
  options: [
    "rahka + marjat + pähkinät",
    "kananmuna + leipä + avokado",
    "proteiinijuoma + banaani",
  ],
};
