/**
 * Meal concepts (not recipes) — local pools for the meal engine.
 * Names are fi/en; macros are %-splits scaled to the user’s day.
 */
import type { Locale } from "@/lib/i18n";

export type MealSlotKind = "breakfast" | "lunch" | "dinner" | "snack";
export type TemplateFlex = "low" | "medium" | "high";

/** % of calories from each macro (should sum ~100). */
export interface MacroSplitPct {
  protein: number;
  carbs: number;
  fat: number;
}

/** Ingredient-level swap hints (not a new meal — same macro ballpark). */
export interface MealSwapLine {
  fromFi: string;
  toFi: string;
  fromEn: string;
  toEn: string;
}

/** Default warm-plate swaps (fi / en). */
export const DEFAULT_WARM_SWAPS: MealSwapLine[] = [
  { fromFi: "kana", toFi: "jauheliha", fromEn: "chicken", toEn: "ground meat" },
  { fromFi: "riisi", toFi: "peruna", fromEn: "rice", toEn: "potato" },
  { fromFi: "öljy", toFi: "pähkinät", fromEn: "oil", toEn: "nuts" },
];

export const DEFAULT_VEG_SWAPS: MealSwapLine[] = [
  { fromFi: "tofu", toFi: "kikherne", fromEn: "tofu", toEn: "chickpeas" },
  { fromFi: "riisi", toFi: "peruna", fromEn: "rice", toEn: "potato" },
  { fromFi: "öljy", toFi: "siemenet", fromEn: "oil", toEn: "seeds" },
];

/** Lunch / dinner: warm vs veg defaults; breakfast & snack = none unless explicit. */
export function resolveSwapHintsForTemplate(
  tmpl: MealTemplate,
): MealSwapLine[] | undefined {
  if (tmpl.swapHints !== undefined) {
    return tmpl.swapHints.length > 0 ? tmpl.swapHints : undefined;
  }
  if (tmpl.slot !== "lunch" && tmpl.slot !== "dinner") return undefined;
  if (tmpl.tags.includes("vegetarian")) return DEFAULT_VEG_SWAPS;
  return DEFAULT_WARM_SWAPS;
}

export interface MealTemplate {
  id: string;
  slot: MealSlotKind;
  nameFi: string;
  nameEn: string;
  /** Reference portion — scaling uses daily targets + slot share. */
  baseCalories: number;
  macroSplit: MacroSplitPct;
  /** Logic tags: protein, quick, light, balanced, vegetarian, dinner, flex, snack… */
  tags: string[];
  /** Display taste labels (mapped per locale). */
  tasteIds: Array<
    "savory" | "rich" | "fresh" | "quick" | "comfortLight" | "bright"
  >;
  flexibility: TemplateFlex;
  /**
   * Explicit swap lines; omit to use defaults (warm vs veg) for lunch/dinner.
   * Empty array = no swap block.
   */
  swapHints?: MealSwapLine[];
}

const TASTE: Record<
  Locale,
  Record<
    "savory" | "rich" | "fresh" | "quick" | "comfortLight" | "bright",
    string
  >
> = {
  fi: {
    savory: "Suolainen",
    rich: "Täyteläinen",
    fresh: "Raikas",
    quick: "Nopea",
    comfortLight: "Lohtu (kevyt)",
    bright: "Kirkas",
  },
  en: {
    savory: "Savory",
    rich: "Rich",
    fresh: "Fresh",
    quick: "Quick",
    comfortLight: "Comfort (light)",
    bright: "Bright",
  },
};

export function tasteLabelsForTemplate(
  tmpl: MealTemplate,
  locale: Locale,
): string[] {
  return tmpl.tasteIds.map((id) => TASTE[locale][id]);
}

export const BREAKFAST_TEMPLATES: MealTemplate[] = [
  {
    id: "bf-soft-scramble",
    slot: "breakfast",
    nameFi: "Pehmeä munakas, ruis ja tilli",
    nameEn: "Soft scramble, rye & dill",
    baseCalories: 440,
    macroSplit: { protein: 30, carbs: 38, fat: 32 },
    tags: ["protein", "carbs", "breakfast", "quick"],
    tasteIds: ["savory", "rich"],
    flexibility: "medium",
  },
  {
    id: "bf-skyr-parfait",
    slot: "breakfast",
    nameFi: "Skyr-vanukas, marjat ja hunaja",
    nameEn: "Skyr parfait, berries & honey",
    baseCalories: 420,
    macroSplit: { protein: 32, carbs: 42, fat: 26 },
    tags: ["protein", "carbs", "breakfast", "quick"],
    tasteIds: ["fresh", "bright"],
    flexibility: "medium",
  },
  {
    id: "bf-warm-oats",
    slot: "breakfast",
    nameFi: "Lämmin kaura, vanilja ja päärynä",
    nameEn: "Warm oats, vanilla & pear",
    baseCalories: 450,
    macroSplit: { protein: 26, carbs: 48, fat: 26 },
    tags: ["protein", "carbs", "breakfast"],
    tasteIds: ["rich", "comfortLight"],
    flexibility: "medium",
  },
  {
    id: "bf-salmon-rye",
    slot: "breakfast",
    nameFi: "Savulohi, levite ja ruis",
    nameEn: "Smoked salmon, spread & rye",
    baseCalories: 460,
    macroSplit: { protein: 28, carbs: 34, fat: 38 },
    tags: ["protein", "carbs", "breakfast"],
    tasteIds: ["savory", "rich"],
    flexibility: "medium",
  },
  {
    id: "bf-cottage-forest",
    slot: "breakfast",
    nameFi: "Rahka, marjat ja kevyt mysli",
    nameEn: "Cottage cheese, berries & light granola",
    baseCalories: 390,
    macroSplit: { protein: 34, carbs: 40, fat: 26 },
    tags: ["protein", "quick", "breakfast"],
    tasteIds: ["fresh", "quick"],
    flexibility: "medium",
  },
  {
    id: "bf-shakshuka-side",
    slot: "breakfast",
    nameFi: "Munat tomaattipedillä + pala ruisleipää",
    nameEn: "Eggs in tomato base + rye toast",
    baseCalories: 470,
    macroSplit: { protein: 28, carbs: 36, fat: 36 },
    tags: ["protein", "carbs", "breakfast"],
    tasteIds: ["savory", "rich"],
    flexibility: "medium",
  },
];

export const LUNCH_TEMPLATES: MealTemplate[] = [
  {
    id: "ln-lemon-feta-bowl",
    slot: "lunch",
    nameFi: "Sitruuna-yrttibowl kanalla ja fetalla",
    nameEn: "Lemon herb chicken bowl with feta & grains",
    baseCalories: 600,
    macroSplit: { protein: 35, carbs: 40, fat: 25 },
    tags: ["balanced", "protein", "carbs"],
    tasteIds: ["savory", "fresh"],
    flexibility: "medium",
  },
  {
    id: "ln-nordic-salmon",
    slot: "lunch",
    nameFi: "Pohjoismainen lohikulho ja tilliraita",
    nameEn: "Nordic salmon bowl with dill yogurt",
    baseCalories: 580,
    macroSplit: { protein: 34, carbs: 32, fat: 34 },
    tags: ["balanced", "protein"],
    tasteIds: ["rich", "fresh"],
    flexibility: "medium",
  },
  {
    id: "ln-crispy-tofu",
    slot: "lunch",
    nameFi: "Rapea tofu, seesaminsalaatti ja riisi",
    nameEn: "Crispy tofu, sesame greens & rice",
    baseCalories: 560,
    macroSplit: { protein: 24, carbs: 48, fat: 28 },
    tags: ["balanced", "vegetarian", "quick"],
    tasteIds: ["savory", "bright"],
    flexibility: "medium",
  },
  {
    id: "ln-mezze-plate",
    slot: "lunch",
    nameFi: "Falafel-mezze, tahini ja tabbouleh",
    nameEn: "Falafel mezze, tahini & tabbouleh",
    baseCalories: 590,
    macroSplit: { protein: 22, carbs: 46, fat: 32 },
    tags: ["balanced", "vegetarian"],
    tasteIds: ["savory", "fresh"],
    flexibility: "medium",
  },
  {
    id: "ln-beef-polenta",
    slot: "lunch",
    nameFi: "Härän härkäpata ja pieni annos polentaa",
    nameEn: "Slow beef ragu with polenta side",
    baseCalories: 620,
    macroSplit: { protein: 32, carbs: 38, fat: 30 },
    tags: ["balanced", "protein"],
    tasteIds: ["rich", "comfortLight"],
    flexibility: "medium",
  },
  {
    id: "ln-miso-greens",
    slot: "lunch",
    nameFi: "Miso-kasvikset, riisi ja paistettu tofu",
    nameEn: "Miso greens, rice & seared tofu",
    baseCalories: 540,
    macroSplit: { protein: 26, carbs: 44, fat: 30 },
    tags: ["balanced", "vegetarian", "quick"],
    tasteIds: ["savory", "fresh"],
    flexibility: "medium",
  },
  {
    id: "ln-wrap-turkey",
    slot: "lunch",
    nameFi: "Täysjyväwrap, kalkkuna ja iso salaatti",
    nameEn: "Whole-grain wrap, turkey & big salad",
    baseCalories: 560,
    macroSplit: { protein: 32, carbs: 40, fat: 28 },
    tags: ["balanced", "quick", "protein"],
    tasteIds: ["fresh", "quick"],
    flexibility: "medium",
  },
];

export const DINNER_STRICT_TEMPLATES: MealTemplate[] = [
  {
    id: "dn-fish-steam",
    slot: "dinner",
    nameFi: "Paistettu kala, höyrykasvikset ja pieni peruna",
    nameEn: "Seared fish, steamed veg & baby potato",
    baseCalories: 510,
    macroSplit: { protein: 36, carbs: 32, fat: 32 },
    tags: ["dinner", "light", "protein"],
    tasteIds: ["fresh", "savory"],
    flexibility: "low",
  },
  {
    id: "dn-chicken-salad",
    slot: "dinner",
    nameFi: "Kana, iso salaatti ja hyvä öljy",
    nameEn: "Chicken, big salad & olive oil",
    baseCalories: 480,
    macroSplit: { protein: 40, carbs: 22, fat: 38 },
    tags: ["dinner", "light", "protein"],
    tasteIds: ["fresh", "savory"],
    flexibility: "low",
  },
  {
    id: "dn-tofu-noodle",
    slot: "dinner",
    nameFi: "Tofu-wok ja kevyet nuudelit",
    nameEn: "Tofu stir-fry with light noodles",
    baseCalories: 500,
    macroSplit: { protein: 28, carbs: 44, fat: 28 },
    tags: ["dinner", "light", "vegetarian"],
    tasteIds: ["savory", "quick"],
    flexibility: "low",
  },
  {
    id: "dn-cod-peas",
    slot: "dinner",
    nameFi: "Turska, herneet ja uudet perunat",
    nameEn: "Cod, peas & new potatoes",
    baseCalories: 490,
    macroSplit: { protein: 34, carbs: 38, fat: 28 },
    tags: ["dinner", "light", "protein"],
    tasteIds: ["fresh", "comfortLight"],
    flexibility: "low",
  },
];

export const DINNER_BALANCED_TEMPLATES: MealTemplate[] = [
  {
    id: "dn-pasta-beef",
    slot: "dinner",
    nameFi: "Laikkainen naudan jauhelihaa, täysjyväpasta ja tomaattikastike",
    nameEn: "Lean beef, whole-wheat pasta & tomato sauce",
    baseCalories: 680,
    macroSplit: { protein: 30, carbs: 44, fat: 26 },
    tags: ["dinner", "balanced"],
    tasteIds: ["rich", "savory"],
    flexibility: "medium",
  },
  {
    id: "dn-steak-night",
    slot: "dinner",
    nameFi: "Filee tai kala, perunat ja paahdetut kasvikset",
    nameEn: "Steak or fish, potatoes & roasted veg",
    baseCalories: 720,
    macroSplit: { protein: 34, carbs: 34, fat: 32 },
    tags: ["dinner", "balanced"],
    tasteIds: ["rich", "savory"],
    flexibility: "medium",
  },
  {
    id: "dn-chili-bowl",
    slot: "dinner",
    nameFi: "Chili, pieni sämpylä ja sivusalaatti",
    nameEn: "Chili, small roll & side salad",
    baseCalories: 640,
    macroSplit: { protein: 30, carbs: 42, fat: 28 },
    tags: ["dinner", "balanced"],
    tasteIds: ["rich", "comfortLight"],
    flexibility: "medium",
  },
  {
    id: "dn-pork-apple",
    slot: "dinner",
    nameFi: "Possunfilee, omena ja paahdetut juurekset",
    nameEn: "Pork fillet, apple & roasted roots",
    baseCalories: 690,
    macroSplit: { protein: 32, carbs: 36, fat: 32 },
    tags: ["dinner", "balanced"],
    tasteIds: ["savory", "rich"],
    flexibility: "medium",
  },
];

export const DINNER_FLEX_TEMPLATES: MealTemplate[] = [
  {
    id: "dn-buddha",
    slot: "dinner",
    nameFi: "Buddha-bowl: proteiini, riisi, kasvikset ja kastike",
    nameEn: "Buddha bowl: protein, rice, veg & dressing",
    baseCalories: 750,
    macroSplit: { protein: 28, carbs: 42, fat: 30 },
    tags: ["dinner", "flex", "social-ok"],
    tasteIds: ["savory", "rich"],
    flexibility: "high",
  },
  {
    id: "dn-taco",
    slot: "dinner",
    nameFi: "Taco-ilta: tortillat, jauhe ja täytteet",
    nameEn: "Taco night: tortillas, mince & toppings",
    baseCalories: 820,
    macroSplit: { protein: 26, carbs: 40, fat: 34 },
    tags: ["dinner", "flex"],
    tasteIds: ["savory", "comfortLight"],
    flexibility: "high",
  },
  {
    id: "dn-pizza-salad",
    slot: "dinner",
    nameFi: "Ohut pizza ja iso vihreä salaatti",
    nameEn: "Thin-crust pizza & big green salad",
    baseCalories: 700,
    macroSplit: { protein: 28, carbs: 44, fat: 28 },
    tags: ["dinner", "flex"],
    tasteIds: ["rich", "fresh"],
    flexibility: "high",
  },
  {
    id: "dn-sushi",
    slot: "dinner",
    nameFi: "Sushi-ilta: lajitelma ja misokeitto",
    nameEn: "Sushi night: mixed rolls & miso soup",
    baseCalories: 760,
    macroSplit: { protein: 30, carbs: 46, fat: 24 },
    tags: ["dinner", "flex", "social-ok"],
    tasteIds: ["fresh", "savory"],
    flexibility: "high",
  },
];

export const SNACK_TEMPLATES: MealTemplate[] = [
  {
    id: "sn-skyr",
    slot: "snack",
    nameFi: "Nopea proteiinivälipala: skyr ja marjat",
    nameEn: "Quick protein bite: skyr & berries",
    baseCalories: 220,
    macroSplit: { protein: 36, carbs: 40, fat: 24 },
    tags: ["snack", "protein", "quick"],
    tasteIds: ["fresh", "quick"],
    flexibility: "medium",
  },
  {
    id: "sn-bar-apple",
    slot: "snack",
    nameFi: "Proteiinipatukka ja omena",
    nameEn: "Protein bar & apple",
    baseCalories: 200,
    macroSplit: { protein: 32, carbs: 48, fat: 20 },
    tags: ["snack", "protein", "quick"],
    tasteIds: ["quick", "fresh"],
    flexibility: "medium",
  },
  {
    id: "sn-chicken-cuke",
    slot: "snack",
    nameFi: "Kananfileesiivut ja kurkku",
    nameEn: "Chicken slices & cucumber",
    baseCalories: 180,
    macroSplit: { protein: 48, carbs: 16, fat: 36 },
    tags: ["snack", "protein", "quick"],
    tasteIds: ["savory", "fresh"],
    flexibility: "medium",
  },
  {
    id: "sn-hummus",
    slot: "snack",
    nameFi: "Hummus, porkkanat ja täysjyväkeksit",
    nameEn: "Hummus, carrots & wholegrain crackers",
    baseCalories: 190,
    macroSplit: { protein: 16, carbs: 46, fat: 38 },
    tags: ["snack", "vegetarian", "quick"],
    tasteIds: ["savory", "fresh"],
    flexibility: "medium",
  },
];
