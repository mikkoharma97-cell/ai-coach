/**
 * Päivän ruokarakenne — yksi totuus Today + Food -näkymille (mock V2).
 * Ei resepti-engineä; selkeät ateriat ja nimikkeet.
 */
import {
  formatFoodPlanLabel,
  formatFoodStyleLabel,
} from "@/lib/coachDisplayLabels";
import type { ProgramPackage } from "@/lib/programPackages";
import type { Goal } from "@/types/coach";
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

/** Kevyt aikavyöhyke otsikon alle — ei kelloa, vain suunta. */
function timingLabelsForSlot(
  locale: Locale,
  mealCount: number,
  mealIndex: number,
): string | undefined {
  const fi = locale === "fi";
  if (mealCount <= 3) {
    const fi3 = ["Aamu", "Keskipäivä", "Ilta"];
    const en3 = ["Morning", "Midday", "Evening"];
    return fi ? fi3[mealIndex] : en3[mealIndex];
  }
  if (mealCount === 4) {
    const fi4 = ["Aamu", "Keskipäivä", "Iltapäivä", "Ilta"];
    const en4 = ["Morning", "Midday", "Afternoon", "Evening"];
    return fi ? fi4[mealIndex] : en4[mealIndex];
  }
  const fi5 = ["Aamu", "Aamu", "Keskipäivä", "Iltapäivä", "Ilta"];
  const en5 = ["Morning", "Late morning", "Midday", "Afternoon", "Evening"];
  return fi ? fi5[mealIndex] : en5[mealIndex];
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

/** Mikä ateria-slotti on “seuraava” kellonajan perusteella (paikallinen aika). */
export function nextMealSlotIndex(now: Date, mealCount: number): number {
  const capped = Math.min(Math.max(mealCount, 3), 5);
  const h = now.getHours();
  if (capped <= 3) {
    if (h < 10) return 0;
    if (h < 15) return 1;
    return 2;
  }
  if (capped === 4) {
    if (h < 9) return 0;
    if (h < 12) return 1;
    if (h < 16) return 2;
    return 3;
  }
  if (h < 8) return 0;
  if (h < 11) return 1;
  if (h < 14) return 2;
  if (h < 17) return 3;
  return 4;
}

function guidanceForFoodDay(args: {
  locale: Locale;
  goal: Goal;
  style: FoodDayStyle;
  planBias: ProgramPackage["planBias"];
}): string {
  const { locale, goal, style, planBias } = args;
  const fi = locale === "fi";

  if (style === "high_protein") {
    return fi
      ? "Proteiini jokaisella aterialla. Treenipäivää tukeva rytmi."
      : "Protein at every meal — rhythm that supports training.";
  }
  if (style === "warm") {
    return fi
      ? "Energiaa aamuun — päivän rytmi lähtee kevyesti käyntiin."
      : "Front-load energy — the day starts light and steady.";
  }
  if (style === "performance") {
    return fi
      ? "Tarkka jako — tankkaus ja ajoitus tukevat suoritusta."
      : "Tight structure — fueling and timing support performance.";
  }
  if (style === "easy") {
    if (planBias === "cut" || goal === "lose_weight") {
      return fi
        ? "Kevyempi päivä, mutta rytmi pysyy. Energia tasaisena."
        : "Lighter day, same rhythm — keep energy even.";
    }
    return fi
      ? "Tänään pidetään energiansaanti tasaisena."
      : "Keep energy steady across the day.";
  }
  return fi
    ? "Rytmi linjassa valmennuksen kanssa."
    : "Rhythm aligned with your coaching plan.";
}

/**
 * Palauttaa tämän päivän ruokarakenteen — sama muoto Today + Food.
 * Today `planFoodLabel` = `foodPlanLabel` tästä (yksi resolver).
 */
export function resolveFoodDayMock(args: {
  mealCount: number;
  style: FoodDayStyle;
  goal: Goal;
  locale: Locale;
  /** Valinnainen — myöhempi personalointi */
  packageId?: string;
  planBias?: ProgramPackage["planBias"];
  /** Päivämäärä seuraavan aterian valintaan (oletus: nyt) */
  now?: Date;
}): FoodDayPlan {
  const {
    mealCount,
    style,
    goal,
    locale,
    packageId,
    planBias = "steady",
    now = new Date(),
  } = args;
  void packageId;
  const count = Math.min(Math.max(mealCount, 3), 5);
  const names = slotNamesForCount(count);
  const labels = locale === "fi" ? names.fi : names.en;
  const dayLabel = locale === "fi" ? "Tänään" : "Today";

  const foodPlanLabel = formatFoodPlanLabel({
    mealCount: count,
    style,
    locale,
  });

  const nextIdx = nextMealSlotIndex(now, count);
  const nextBadge =
    locale === "fi" ? "Seuraava ateria" : "Next meal";

  const meals = labels.map((name, mealIndex) => {
    const id = mealId(name, mealIndex);
    const isNext = mealIndex === nextIdx;
    return {
      id,
      name,
      timingLabel: timingLabelsForSlot(locale, count, mealIndex),
      items: pickItems(locale, goal, mealIndex, style, count),
      emphasis: isNext ? nextBadge : undefined,
    };
  });

  const nextMealId = meals[nextIdx]?.id ?? meals[0]!.id;

  return {
    dayLabel,
    mealCount: count,
    styleLabel: formatFoodStyleLabel(style, locale),
    foodPlanLabel,
    guidanceLine: guidanceForFoodDay({
      locale,
      goal,
      style,
      planBias,
    }),
    meals,
    nextMealId,
  };
}
