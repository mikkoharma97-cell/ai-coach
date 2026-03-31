/**
 * Viikon ostoslista — yhdistää ateriat, skaalaa määrät, ehdottaa tuotteita omasta katalogista.
 */
import { dayKeyFromDate } from "@/lib/dateKey";
import type { Locale } from "@/lib/i18n";
import type { DailyMealTargets } from "@/lib/mealEngine";
import { generateDailyMeals, optionsForSlot } from "@/lib/mealEngine";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";
import type {
  GroceryPreference,
  GroceryProduct,
  ShoppingListItem,
  WeeklyMealPlanDay,
  WeeklyMealPlanInput,
} from "@/types/grocery";
import type { MealSlot } from "@/types/coach";
import { getProductCatalog, productsForIngredientKey } from "@/lib/food/productCatalog";

/** Vanha Food-näkymän muoto — yhteensopivuus */
export type ShoppingListGroup = {
  label: string;
  lines: string[];
};

export type ShoppingListResult = {
  title: string;
  groups: ShoppingListGroup[];
};

export type WeeklyShoppingEngineResult = {
  titleFi: string;
  titleEn: string;
  leadFi: string;
  leadEn: string;
  dayCount: number;
  items: ShoppingListItem[];
  /** Ryhmittely näyttöä varten */
  groups: { key: string; labelFi: string; labelEn: string; items: ShoppingListItem[] }[];
};

type Emit = {
  ingredientKey: string;
  labelFi: string;
  labelEn: string;
  grams: number;
  category: GroceryProduct["category"];
};

const RULES: Array<{ test: (s: string) => boolean; emit: Emit }> = [
  {
    test: (s) => /kana|broiler|chicken/i.test(s),
    emit: {
      ingredientKey: "chicken_breast",
      labelFi: "Kanafilee",
      labelEn: "Chicken breast",
      grams: 130,
      category: "protein",
    },
  },
  {
    test: (s) => /jauheliha|mince|ground beef|naudan/i.test(s),
    emit: {
      ingredientKey: "beef_mince",
      labelFi: "Jauheliha",
      labelEn: "Ground meat",
      grams: 120,
      category: "protein",
    },
  },
  {
    test: (s) => /lohi|salmon|kala(?!k)/i.test(s),
    emit: {
      ingredientKey: "salmon",
      labelFi: "Kala / lohi",
      labelEn: "Fish / salmon",
      grams: 130,
      category: "protein",
    },
  },
  {
    test: (s) => /tofu/i.test(s),
    emit: {
      ingredientKey: "tofu",
      labelFi: "Tofu",
      labelEn: "Tofu",
      grams: 180,
      category: "protein",
    },
  },
  {
    test: (s) => /muna|egg/i.test(s),
    emit: {
      ingredientKey: "eggs",
      labelFi: "Kananmunat",
      labelEn: "Eggs",
      grams: 55,
      category: "protein",
    },
  },
  {
    test: (s) => /raejuusto|cottage/i.test(s),
    emit: {
      ingredientKey: "cottage_cheese",
      labelFi: "Raejuusto",
      labelEn: "Cottage cheese",
      grams: 150,
      category: "dairy",
    },
  },
  {
    test: (s) => /rahka|quark|jogurtti|yogurt|greek/i.test(s),
    emit: {
      ingredientKey: "quark",
      labelFi: "Rahka / jogurtti",
      labelEn: "Quark / yogurt",
      grams: 200,
      category: "dairy",
    },
  },
  {
    test: (s) => /riisi|rice/i.test(s),
    emit: {
      ingredientKey: "rice",
      labelFi: "Riisi",
      labelEn: "Rice",
      grams: 70,
      category: "carb",
    },
  },
  {
    test: (s) => /kaura|oat/i.test(s),
    emit: {
      ingredientKey: "oats",
      labelFi: "Kaura",
      labelEn: "Oats",
      grams: 65,
      category: "carb",
    },
  },
  {
    test: (s) => /peruna|potato/i.test(s),
    emit: {
      ingredientKey: "potato",
      labelFi: "Peruna",
      labelEn: "Potato",
      grams: 200,
      category: "carb",
    },
  },
  {
    test: (s) => /pasta|spaghetti|penne|gnocchi/i.test(s),
    emit: {
      ingredientKey: "pasta",
      labelFi: "Pasta",
      labelEn: "Pasta",
      grams: 80,
      category: "carb",
    },
  },
  {
    test: (s) => /öljy|oliivi|oil/i.test(s),
    emit: {
      ingredientKey: "olive_oil",
      labelFi: "Oliiviöljy",
      labelEn: "Olive oil",
      grams: 12,
      category: "fat",
    },
  },
  {
    test: (s) => /pähkin|nuts/i.test(s),
    emit: {
      ingredientKey: "nuts",
      labelFi: "Pähkinät",
      labelEn: "Nuts",
      grams: 25,
      category: "snack",
    },
  },
  {
    test: (s) => /kasvis|vihre|salaatti|parsakaali|broccoli|leaf/i.test(s),
    emit: {
      ingredientKey: "salad_greens",
      labelFi: "Vihannekset / salaatti",
      labelEn: "Vegetables / salad",
      grams: 120,
      category: "vegetable",
    },
  },
  {
    test: (s) => /marja|berry|hedelm|fruit|banaani|apple/i.test(s),
    emit: {
      ingredientKey: "berries",
      labelFi: "Marjat / hedelmät",
      labelEn: "Berries / fruit",
      grams: 120,
      category: "fruit",
    },
  },
];

function extractFromSlot(slot: WeeklyMealPlanDay["slots"][number]): Emit[] {
  const t =
    `${slot.mealNameFi} ${slot.mealNameEn} ${(slot.tags ?? []).join(" ")}`.toLowerCase();
  const out: Emit[] = [];
  for (const r of RULES) {
    if (r.test(t)) out.push({ ...r.emit });
  }
  if (out.length === 0) {
    out.push({
      ingredientKey: "veg_frozen",
      labelFi: "Kasvikset",
      labelEn: "Vegetables",
      grams: 100,
      category: "vegetable",
    });
    out.push({
      ingredientKey: "oats",
      labelFi: "Kaura",
      labelEn: "Oats",
      grams: 50,
      category: "carb",
    });
  }
  return out;
}

function matchesAvoid(text: string, avoid: string[]): boolean {
  const l = text.toLowerCase();
  for (const a of avoid) {
    const x = a.trim().toLowerCase();
    if (x.length >= 2 && l.includes(x)) return true;
  }
  return false;
}

function mergeEmits(
  acc: Map<
    string,
    {
      emit: Emit;
      grams: number;
      days: Set<string>;
    }
  >,
  emits: Emit[],
  dayKey: string,
  batchFactor: number,
): void {
  for (const e of emits) {
    const g = Math.round(e.grams * batchFactor);
    const cur = acc.get(e.ingredientKey);
    if (!cur) {
      acc.set(e.ingredientKey, {
        emit: e,
        grams: g,
        days: new Set([dayKey]),
      });
    } else {
      cur.grams += g;
      cur.days.add(dayKey);
    }
  }
}

function groupKey(cat: GroceryProduct["category"]): string {
  if (cat === "protein") return "protein";
  if (cat === "carb") return "carb";
  if (cat === "vegetable") return "vegetable";
  return "extra";
}

function groupLabel(key: string): { labelFi: string; labelEn: string } {
  const m: Record<string, { fi: string; en: string }> = {
    protein: { fi: "Proteiinit", en: "Protein" },
    carb: { fi: "Hiilarit", en: "Carbs" },
    vegetable: { fi: "Kasvikset", en: "Vegetables" },
    extra: { fi: "Lisät", en: "Extras" },
  };
  const o = m[key] ?? m.extra;
  return { labelFi: o.fi, labelEn: o.en };
}

function suggestionsForKey(
  catalog: GroceryProduct[],
  ingredientKey: string,
): GroceryProduct[] {
  const all = productsForIngredientKey(catalog, ingredientKey);
  const byStore = ["store_a", "store_b", "store_c"] as const;
  const out: GroceryProduct[] = [];
  for (const sid of byStore) {
    const hit = all.find((p) => p.storeId === sid);
    if (hit) out.push(hit);
  }
  return out.slice(0, 3);
}

function amountUnit(emit: Emit, totalG: number): { amount: number; unit: string } {
  if (emit.ingredientKey === "eggs") {
    const n = Math.max(2, Math.round(totalG / 55));
    return { amount: n, unit: "piece" };
  }
  if (emit.ingredientKey === "olive_oil") {
    const raw = Math.max(50, Math.round(totalG * 8));
    return { amount: Math.min(400, raw), unit: "ml" };
  }
  return { amount: Math.round(totalG), unit: "g" };
}

export type GenerateWeeklyShoppingListParams = {
  mealPlan: WeeklyMealPlanInput;
  preferences?: GroceryPreference;
  locale: Locale;
};

export function generateWeeklyShoppingList(
  params: GenerateWeeklyShoppingListParams,
): WeeklyShoppingEngineResult {
  const { mealPlan, preferences, locale: _locale } = params;
  const avoid = preferences?.avoidIngredients ?? [];
  const batch =
    preferences?.batchCooking === true ? 1.12 : 1;
  const catalog = getProductCatalog();

  const acc = new Map<
    string,
    { emit: Emit; grams: number; days: Set<string> }
  >();

  for (const day of mealPlan.days) {
    for (const slot of day.slots) {
      const emits = extractFromSlot(slot);
      mergeEmits(acc, emits, day.dayKey, batch);
    }
  }

  const items: ShoppingListItem[] = [];

  for (const [, row] of acc) {
    const { emit, grams, days } = row;
    if (matchesAvoid(emit.labelFi + emit.labelEn, avoid)) continue;
    if (emit.ingredientKey === "salmon" && matchesAvoid("kala", avoid)) continue;
    if (
      (emit.category === "dairy" || emit.ingredientKey === "quark") &&
      matchesAvoid("maito", avoid)
    ) {
      continue;
    }

    const { amount, unit } = amountUnit(emit, grams);
    const daysUsed = [...days].sort();

    items.push({
      ingredientKey: emit.ingredientKey,
      labelFi: emit.labelFi,
      labelEn: emit.labelEn,
      amount,
      unit,
      daysUsed,
      category: emit.category,
      productSuggestions: suggestionsForKey(catalog, emit.ingredientKey),
    });
  }

  items.sort((a, b) => a.labelFi.localeCompare(b.labelFi, "fi"));

  const groupMap = new Map<string, ShoppingListItem[]>();
  for (const it of items) {
    const gk = groupKey(it.category);
    const arr = groupMap.get(gk) ?? [];
    arr.push(it);
    groupMap.set(gk, arr);
  }

  const order = ["protein", "carb", "vegetable", "extra"] as const;
  const groups = order
    .filter((k) => groupMap.has(k))
    .map((k) => {
      const gl = groupLabel(k);
      return {
        key: k,
        labelFi: gl.labelFi,
        labelEn: gl.labelEn,
        items: groupMap.get(k)!,
      };
    });

  const n = mealPlan.days.length;

  return {
    titleFi: "Viikon ostot valmiina",
    titleEn: "Your week’s shopping ready",
    leadFi: "Rakennettu tämän viikon ateriarytmistä — voit vaihtaa tuotteita myöhemmin.",
    leadEn: "Built from this week’s meal rhythm — you can swap items later.",
    dayCount: n,
    items,
    groups,
  };
}

function slotsForStructure(
  structure: import("@/types/coach").MealStructurePreference,
): MealSlot[] {
  if (structure === "snack_forward") {
    return ["breakfast", "lunch", "snack", "dinner"];
  }
  return ["breakfast", "lunch", "dinner"];
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function mondayStart(ref: Date): Date {
  const x = new Date(ref);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  return x;
}

function dayLabels(d: Date, locale: Locale): { fi: string; en: string } {
  const locFi = "fi-FI";
  const locEn = "en-GB";
  return {
    fi: d.toLocaleDateString(locFi, { weekday: "short" }),
    en: d.toLocaleDateString(locEn, { weekday: "short" }),
  };
}

export function buildWeeklyMealPlanFromProfile(
  profile: OnboardingAnswers,
  plan: CoachDailyPlan,
  locale: Locale,
  daySpan: 3 | 7,
): WeeklyMealPlanInput {
  const targets: DailyMealTargets = {
    caloriesTarget: plan.todayCalories,
    proteinTarget: plan.todayMacros.proteinG,
  };
  const slots = slotsForStructure(profile.mealStructure);
  const start = mondayStart(new Date());
  const days: WeeklyMealPlanDay[] = [];

  for (let i = 0; i < daySpan; i++) {
    const d = addDays(start, i);
    const salt = dayKeyFromDate(d);
    const dailyFi = generateDailyMeals(profile, targets, salt, "fi");
    const dailyEn = generateDailyMeals(profile, targets, salt, "en");
    const lb = dayLabels(d, locale);

    const slotRows: WeeklyMealPlanDay["slots"] = [];
    for (const slot of slots) {
      const fi = optionsForSlot(slot, dailyFi)[0];
      const en = optionsForSlot(slot, dailyEn)[0];
      if (!fi || !en) continue;
      slotRows.push({
        slot,
        mealNameFi: fi.name,
        mealNameEn: en.name,
        tags: fi.tags,
      });
    }

    days.push({
      dayKey: salt,
      labelFi: lb.fi,
      labelEn: lb.en,
      slots: slotRows,
    });
  }

  return { days };
}

export function groceryPreferencesFromProfile(
  profile: OnboardingAnswers,
): GroceryPreference {
  const flex = profile.flexibility;
  const budget: GroceryPreference["budgetLevel"] =
    flex === "structured" ? "low" : flex === "flexible" ? "premium" : "balanced";
  return {
    avoidIngredients: [...(profile.foodDislikes ?? [])],
    favoriteProducts: [...(profile.foodPreferences ?? [])],
    budgetLevel: budget,
    batchCooking: profile.daysPerWeek >= 4,
  };
}

export function generateWeeklyShoppingListForProfile(
  profile: OnboardingAnswers,
  plan: CoachDailyPlan,
  opts: { daySpan: 3 | 7; locale: Locale; householdSize?: number },
): WeeklyShoppingEngineResult {
  const mealPlan = buildWeeklyMealPlanFromProfile(
    profile,
    plan,
    opts.locale,
    opts.daySpan,
  );
  const base = generateWeeklyShoppingList({
    mealPlan,
    preferences: groceryPreferencesFromProfile(profile),
    locale: opts.locale,
  });
  const scale = Math.max(1, Math.min(8, opts.householdSize ?? 1));
  if (scale === 1) return base;
  return {
    ...base,
    items: base.items.map((it) => ({
      ...it,
      amount: Math.round(it.amount * scale),
    })),
  };
}

/**
 * Ostoslista suoraan ateriasuunnitelmasta — talouden koko skaalaa määriä.
 * `storeSuggestions` voidaan liittää myöhemmin ilman tyypin rikkomista.
 */
export function generateShoppingListFromMealPlan(input: {
  days: WeeklyMealPlanDay[];
  meals?: WeeklyMealPlanInput["days"];
  householdSize: number;
  preferences?: GroceryPreference;
  locale: Locale;
}): WeeklyShoppingEngineResult {
  const days = input.meals ?? input.days;
  const mealPlan: WeeklyMealPlanInput = { days };
  const base = generateWeeklyShoppingList({
    mealPlan,
    preferences: input.preferences,
    locale: input.locale,
  });
  const scale = Math.max(1, Math.min(8, input.householdSize));
  if (scale === 1) return base;
  return {
    ...base,
    items: base.items.map((it) => ({
      ...it,
      amount: Math.round(it.amount * scale),
    })),
  };
}

/** Vanha API — kutsuu uutta moottoria geneerisellä suunnitelmalla */
export function generateShoppingList(
  days: number,
  locale: "fi" | "en",
): ShoppingListResult {
  const d = Math.min(7, Math.max(3, Math.round(days))) as 3 | 7;
  const loc = locale === "en" ? "en" : "fi";
  const synthetic: WeeklyMealPlanInput = {
    days: Array.from({ length: d }, (_, i) => ({
      dayKey: `synthetic-${i}`,
      labelFi: `Päivä ${i + 1}`,
      labelEn: `Day ${i + 1}`,
      slots: [
        {
          slot: "lunch",
          mealNameFi: "Kanaa ja riisiä",
          mealNameEn: "Chicken and rice",
          tags: ["balanced"],
        },
        {
          slot: "dinner",
          mealNameFi: "Lohta ja perunaa",
          mealNameEn: "Salmon and potato",
          tags: ["protein"],
        },
      ],
    })),
  };
  const engine = generateWeeklyShoppingList({
    mealPlan: synthetic,
    preferences: {},
    locale: loc,
  });
  return weeklyToLegacy(engine, loc);
}

function weeklyToLegacy(
  w: WeeklyShoppingEngineResult,
  locale: Locale,
): ShoppingListResult {
  return {
    title: locale === "en" ? w.titleEn : w.titleFi,
    groups: w.groups.map((g) => ({
      label: locale === "en" ? g.labelEn : g.labelFi,
      lines: g.items.map((it) => {
        const amt =
          it.unit === "g"
            ? `${it.amount} g`
            : it.unit === "ml"
              ? `${it.amount} ml`
              : `${it.amount} kpl`;
        const name = locale === "en" ? it.labelEn : it.labelFi;
        return `${name} · ${amt}`;
      }),
    })),
  };
}
