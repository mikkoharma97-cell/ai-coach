/**
 * Päivän ruokarakenne — V1 mock (myöhemmin vaihdettavissa oikeaan dataan).
 * Ei resepti-engineä; selkeät ateriat ja nimikkeet.
 */
import {
  formatFoodPlanLabel,
  formatFoodStyleLabel,
} from "@/lib/coachDisplayLabels";
import type { Goal } from "@/types/coach";
import type { ProgramPackage } from "@/lib/programPackages";
import type { FoodDayPlan, FoodDayStyle } from "@/types/foodPlan";
import type { Locale } from "@/lib/i18n";

export type { FoodDayStyle };

type SlotNames = { fi: string[]; en: string[] };

function slotNamesForCount(count: number): SlotNames {
  if (count <= 3) {
    return {
      fi: ["Aamiainen", "Lounas", "Päivällinen"],
      en: ["Breakfast", "Lunch", "Dinner"],
    };
  }
  if (count === 4) {
    return {
      fi: ["Aamiainen", "Lounas", "Välipala", "Päivällinen"],
      en: ["Breakfast", "Lunch", "Snack", "Dinner"],
    };
  }
  return {
    fi: ["Aamiainen", "Välipala", "Lounas", "Toinen välipala", "Päivällinen"],
    en: ["Breakfast", "Snack", "Lunch", "Snack", "Dinner"],
  };
}

function mealId(name: string, index: number): string {
  const s = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9äöåü\-]/gi, "");
  return `meal-${index}-${s || "slot"}`;
}

function pickItems(
  locale: Locale,
  goal: Goal,
  mealIndex: number,
  style: FoodDayStyle,
  mealCount: number,
): string[] {
  const fi = locale === "fi";

  const proteinHeavy: Record<Goal, { fi: string[]; en: string[] }> = {
    lose_weight: {
      fi: ["Kananrinta", "Vihreä salaatti", "Öljytön kastike"],
      en: ["Chicken breast", "Green salad", "Light dressing"],
    },
    build_muscle: {
      fi: ["Naudan jauheliha", "Peruna", "Juustokananmuna"],
      en: ["Lean beef", "Potato", "Egg-cheese mix"],
    },
    improve_fitness: {
      fi: ["Kala", "Täysjyväriisi", "Kasvikset"],
      en: ["Fish", "Brown rice", "Vegetables"],
    },
  };

  const breakfast: Record<Goal, { fi: string[]; en: string[] }> = {
    lose_weight: {
      fi: ["Kaurapuuro", "Marjat", "Kahvi tai tee"],
      en: ["Oat porridge", "Berries", "Coffee or tea"],
    },
    build_muscle: {
      fi: ["Munakokkeli", "Ruisleipä", "Maitorahka"],
      en: ["Scrambled eggs", "Rye bread", "Skyr"],
    },
    improve_fitness: {
      fi: ["Kananmuna", "Kaura", "Marjat"],
      en: ["Egg", "Oats", "Berries"],
    },
  };

  const lunch: Record<Goal, { fi: string[]; en: string[] }> = {
    lose_weight: {
      fi: ["Tofu-wokki", "Täysjyvänuudeli", "Kasvikset"],
      en: ["Tofu stir-fry", "Whole-grain noodles", "Vegetables"],
    },
    build_muscle: {
      fi: ["Riisi", "Kalkkuna", "Papuja"],
      en: ["Rice", "Turkey", "Beans"],
    },
    improve_fitness: {
      fi: ["Lohi", "Kvinoa", "Parsakaali"],
      en: ["Salmon", "Quinoa", "Broccoli"],
    },
  };

  const dinner: Record<Goal, { fi: string[]; en: string[] }> = {
    lose_weight: {
      fi: ["Kala", "Uunikasvikset", "Pieni annos öljyä"],
      en: ["Fish", "Roasted vegetables", "Small oil drizzle"],
    },
    build_muscle: {
      fi: ["Pihvi tai kasvisproteiini", "Perunamuusi", "Salaatti"],
      en: ["Steak or plant patty", "Mashed potato", "Salad"],
    },
    improve_fitness: {
      fi: ["Kana", "Täysjyväpasta", "Tomaattikastike"],
      en: ["Chicken", "Whole-wheat pasta", "Tomato sauce"],
    },
  };

  const snack: Record<Goal, { fi: string[]; en: string[] }> = {
    lose_weight: {
      fi: ["Hedelmä", "Pähkinä (pieni nyrkki)"],
      en: ["Fruit", "Small handful of nuts"],
    },
    build_muscle: {
      fi: ["Proteiinijuoma", "Banaani"],
      en: ["Protein shake", "Banana"],
    },
    improve_fitness: {
      fi: ["Rahka", "Marjat"],
      en: ["Skyr", "Berries"],
    },
  };

  const b = fi ? breakfast[goal].fi : breakfast[goal].en;
  const l = fi ? lunch[goal].fi : lunch[goal].en;
  const d = fi ? dinner[goal].fi : dinner[goal].en;
  const s = fi ? snack[goal].fi : snack[goal].en;
  const ph = fi ? proteinHeavy[goal].fi : proteinHeavy[goal].en;

  if (mealIndex === 0) {
    if (style === "high_protein") return ph;
    return b;
  }

  const slots3 = [b, l, d];
  const slots4 = [b, l, s, d];
  const slots5 = [b, s, l, s, d];

  const pickSlot = (mc: number, idx: number): string[] => {
    if (mc <= 3) return slots3[idx] ?? l;
    if (mc === 4) return slots4[idx] ?? l;
    return slots5[idx] ?? l;
  };

  return pickSlot(mealCount, mealIndex);
}

/**
 * Palauttaa tämän päivän ruokarakenteen — sama muoto Today + Food -näkymille.
 */
export function resolveFoodDayMock(args: {
  mealCount: number;
  style: FoodDayStyle;
  goal: Goal;
  locale: Locale;
  /** Valinnainen — myöhempi paketti-/personalointi */
  packageId?: string;
}): FoodDayPlan {
  const { mealCount, style, goal, locale, packageId } = args;
  void packageId;
  const count = Math.min(Math.max(mealCount, 3), 5);
  const names = slotNamesForCount(count);
  const labels = locale === "fi" ? names.fi : names.en;
  const dayLabel = locale === "fi" ? "Tänään" : "Today";

  const meals = labels.map((name, mealIndex) => ({
    id: mealId(name, mealIndex),
    name,
    items: pickItems(locale, goal, mealIndex, style, count),
  }));

  return {
    dayLabel,
    mealCount: count,
    styleLabel: formatFoodStyleLabel(style, locale),
    planLabel: formatFoodPlanLabel({
      mealCount: count,
      style,
      locale,
    }),
    meals,
  };
}
