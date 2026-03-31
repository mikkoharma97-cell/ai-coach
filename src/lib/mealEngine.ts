/**
 * AI Meal Engine — rule-based meal concepts + macro scaling (local, no API).
 */
import { dayKeyFromDate } from "@/lib/dateKey";
import type { Locale } from "@/lib/i18n";
import {
  getMergedMealEngineConfig,
  mealFlexFromDinnerBias,
} from "@/lib/mealPackageConfig";
import { effectiveMealStructureForEngine } from "@/lib/nutritionBlueprints";
import {
  BREAKFAST_TEMPLATES,
  DINNER_BALANCED_TEMPLATES,
  DINNER_FLEX_TEMPLATES,
  DINNER_STRICT_TEMPLATES,
  LUNCH_TEMPLATES,
  SNACK_TEMPLATES,
  resolveSwapHintsForTemplate,
  tasteLabelsForTemplate,
  type MacroSplitPct,
  type MealTemplate,
} from "@/lib/mealTemplates";
import type {
  CoachDailyPlan,
  CookingTimePreference,
  MealSlot,
  OnboardingAnswers,
} from "@/types/coach";

export type { CookingTimePreference } from "@/types/coach";

/** Maps from onboarding flexibility — strict dinner control vs room to flex */
export type MealFlexibilityLevel = "strict" | "balanced" | "flex";

export interface MealPreferences {
  caloriesTarget: number;
  proteinTarget: number;
  mealsPerDay: number;
  likedFoods: string[];
  dislikedFoods: string[];
  cookingTimePreference: CookingTimePreference;
  flexibilityLevel: MealFlexibilityLevel;
}

export interface MealOption {
  name: string;
  calories: number;
  protein: number;
  tags: string[];
  /** Derived from macro split at scaled kcal (display / transparency). */
  carbsG?: number;
  fatG?: number;
  /** Localized taste chips — not internal logic tags. */
  tasteLabels?: string[];
  /** Ingredient-level alternatives (same ballpark). */
  swapHints?: Array<{ from: string; to: string }>;
}

export interface DailyMealsPlan {
  breakfast: MealOption[];
  lunch: MealOption[];
  dinner: MealOption[];
  snacks?: MealOption[];
}

function normList(s: string[]): string[] {
  return s.map((x) => x.toLowerCase().trim()).filter(Boolean);
}

function matchesDislike(name: string, dislikes: string[]): boolean {
  const l = name.toLowerCase();
  for (const d of dislikes) {
    if (d.length >= 2 && l.includes(d)) return true;
  }
  return false;
}

/** Liked keywords + goal nudge — surfaces better matches first for swap cycling */
function withEngineMealStructure(
  profile: OnboardingAnswers,
): OnboardingAnswers {
  return {
    ...profile,
    mealStructure: effectiveMealStructureForEngine(profile),
  };
}

function packageMealNudge(profile: OnboardingAnswers, m: MealOption): number {
  const cfg = getMergedMealEngineConfig(profile);
  let n = 0;
  for (const tag of cfg.boostTags) {
    if (m.tags.includes(tag)) n += 2;
  }
  if (cfg.preferQuick && m.tags.includes("quick")) n += 2;
  return n;
}

function rankMealForProfile(
  m: MealOption,
  profile: OnboardingAnswers,
): number {
  const likes = normList(profile.foodPreferences ?? []);
  const name = m.name.toLowerCase();
  let s = 0;
  for (const x of likes) {
    if (x.length >= 2 && name.includes(x)) s += 4;
  }
  if (profile.goal === "lose_weight" && m.tags.includes("light")) s += 2;
  if (profile.goal === "build_muscle" && m.protein >= 32) s += 2;
  if (
    profile.goal === "improve_fitness" &&
    (m.tags.includes("balanced") || m.tags.includes("carbs"))
  ) {
    s += 1;
  }
  s += packageMealNudge(profile, m);
  return s;
}

function orderPoolForProfile(
  pool: MealOption[],
  profile: OnboardingAnswers,
): MealOption[] {
  if (pool.length <= 1) return pool;
  const p = withEngineMealStructure(profile);
  return [...pool].sort(
    (a, b) => rankMealForProfile(b, p) - rankMealForProfile(a, p),
  );
}

function cookingFromProfile(
  answers: OnboardingAnswers,
): CookingTimePreference {
  if (answers.biggestChallenge === "lack_of_time") return "fast";
  if (answers.eatingHabits === "irregular") return "fast";
  if (answers.eatingHabits === "good") return "any";
  return "normal";
}

function resolveCooking(answers: OnboardingAnswers): CookingTimePreference {
  return answers.cookingTimePreference ?? cookingFromProfile(answers);
}

function flexFromProfile(answers: OnboardingAnswers): MealFlexibilityLevel {
  if (answers.flexibility === "structured") return "strict";
  if (answers.flexibility === "flexible") return "flex";
  return "balanced";
}

function mealsPerDayFromStructure(
  structure: OnboardingAnswers["mealStructure"],
): number {
  if (structure === "snack_forward") return 4;
  return 3;
}

/** Numeric targets for scaling pools — from daily plan or standalone prefs. */
export interface DailyMealTargets {
  caloriesTarget: number;
  proteinTarget: number;
}

/**
 * Preference model for the meal engine — from profile + targets (no full plan required).
 */
export function buildMealPreferencesFromTargets(
  answers: OnboardingAnswers,
  targets: DailyMealTargets,
): MealPreferences {
  return {
    caloriesTarget: targets.caloriesTarget,
    proteinTarget: targets.proteinTarget,
    mealsPerDay: mealsPerDayFromStructure(answers.mealStructure),
    likedFoods: normList(answers.foodPreferences ?? []),
    dislikedFoods: normList(answers.foodDislikes ?? []),
    cookingTimePreference: resolveCooking(answers),
    flexibilityLevel: flexFromProfile(answers),
  };
}

/**
 * Preference model for the meal engine — can be built from onboarding + daily plan.
 */
export function buildMealPreferences(
  answers: OnboardingAnswers,
  plan: CoachDailyPlan,
): MealPreferences {
  const foodP =
    plan.foodProteinTargetG ?? plan.todayMacros.proteinG;
  return buildMealPreferencesFromTargets(answers, {
    caloriesTarget: plan.todayCalories,
    proteinTarget: foodP,
  });
}

function macroGramsFromKcal(
  kcal: number,
  split: MacroSplitPct,
): { proteinG: number; carbsG: number; fatG: number } {
  const pk = kcal * (split.protein / 100);
  const ck = kcal * (split.carbs / 100);
  const fk = kcal * (split.fat / 100);
  return {
    proteinG: Math.max(0, Math.round(pk / 4)),
    carbsG: Math.max(0, Math.round(ck / 4)),
    fatG: Math.max(0, Math.round(fk / 9)),
  };
}

/**
 * Scale a meal concept to today’s slot share and nudge protein toward daily target.
 * User never calculates — numbers are coach output.
 */
export function adjustMealToUser(
  tmpl: MealTemplate,
  targets: DailyMealTargets,
  slotShare: number,
  locale: Locale,
): MealOption {
  const kcal = Math.max(120, Math.round(targets.caloriesTarget * slotShare));
  const targetMealP = targets.proteinTarget * slotShare;
  let { proteinG, carbsG, fatG } = macroGramsFromKcal(kcal, tmpl.macroSplit);
  if (proteinG < targetMealP * 0.88) {
    proteinG = Math.round(
      Math.min(targetMealP * 0.97, Math.max(proteinG + 1, targetMealP * 0.92)),
    );
  }
  const name = locale === "fi" ? tmpl.nameFi : tmpl.nameEn;
  const tasteLabels = tasteLabelsForTemplate(tmpl, locale);
  const rawSwaps = resolveSwapHintsForTemplate(tmpl);
  const swapHints = rawSwaps?.map((s) => ({
    from: locale === "fi" ? s.fromFi : s.fromEn,
    to: locale === "fi" ? s.toFi : s.toEn,
  }));
  return {
    name,
    calories: kcal,
    protein: proteinG,
    carbsG,
    fatG,
    tags: [...tmpl.tags],
    tasteLabels,
    swapHints,
  };
}

function filterTemplatePool(
  pool: MealTemplate[],
  dislikes: string[],
): MealTemplate[] {
  const f = pool.filter(
    (m) => !matchesDislike(`${m.nameFi} ${m.nameEn}`, dislikes),
  );
  return f.length > 0 ? f : pool;
}

function pickDinnerTemplates(level: MealFlexibilityLevel): MealTemplate[] {
  if (level === "strict") return DINNER_STRICT_TEMPLATES;
  if (level === "flex") return DINNER_FLEX_TEMPLATES;
  return DINNER_BALANCED_TEMPLATES;
}

function templatesToOptions(
  templates: MealTemplate[],
  profile: OnboardingAnswers,
  prefs: MealPreferences,
  dailyTargets: DailyMealTargets,
  slotShare: number,
  locale: Locale,
): MealOption[] {
  const filtered = filterTemplatePool(templates, prefs.dislikedFoods);
  const adjusted = filtered.map((m) =>
    adjustMealToUser(m, dailyTargets, slotShare, locale),
  );
  const ranked = orderPoolForProfile(adjusted, profile);
  return preferQuick(ranked, prefs.cookingTimePreference);
}

function preferQuick(
  pool: MealOption[],
  cooking: CookingTimePreference,
): MealOption[] {
  if (cooking !== "fast") return pool;
  const quick = pool.filter((m) => m.tags.includes("quick"));
  return quick.length > 0 ? quick : pool;
}

function rotateOrder<T>(arr: T[], salt: string): T[] {
  let h = 0;
  for (let i = 0; i < salt.length; i++) h = (h * 31 + salt.charCodeAt(i)) | 0;
  const off = Math.abs(h) % arr.length;
  return [...arr.slice(off), ...arr.slice(0, off)];
}

/**
 * Rule-based daily meals: breakfast (protein+carbs), lunch (balanced),
 * dinner (flexibility), optional snacks (protein-heavy).
 *
 * `dailyTargets` supplies calorie/protein budget for scaling (e.g. from `generateDailyPlan`).
 */
export function generateDailyMeals(
  profile: OnboardingAnswers,
  dailyTargets: DailyMealTargets,
  dateSalt: string = dayKeyFromDate(new Date()),
  locale: Locale = "fi",
): DailyMealsPlan {
  const profileEff = withEngineMealStructure(profile);
  const cfg = getMergedMealEngineConfig(profile);
  const scaledTargets: DailyMealTargets = {
    caloriesTarget: dailyTargets.caloriesTarget,
    proteinTarget: Math.round(dailyTargets.proteinTarget * cfg.proteinBias),
  };
  const basePrefs = buildMealPreferencesFromTargets(profileEff, scaledTargets);
  const prefs = cfg.preferQuick
    ? { ...basePrefs, cookingTimePreference: "fast" as CookingTimePreference }
    : basePrefs;
  const dinnerFlex = mealFlexFromDinnerBias(
    prefs.flexibilityLevel,
    cfg.dinnerBias,
  );

  const bPool = templatesToOptions(
    BREAKFAST_TEMPLATES,
    profileEff,
    prefs,
    scaledTargets,
    0.26,
    locale,
  );
  const lPool = templatesToOptions(
    LUNCH_TEMPLATES,
    profileEff,
    prefs,
    scaledTargets,
    0.36,
    locale,
  );
  const dPool = templatesToOptions(
    pickDinnerTemplates(dinnerFlex),
    profileEff,
    prefs,
    scaledTargets,
    0.32,
    locale,
  );

  const breakfast = rotateOrder(bPool, `${dateSalt}-b`);
  const lunch = rotateOrder(lPool, `${dateSalt}-l`);
  const dinner = rotateOrder(dPool, `${dateSalt}-d`);

  const out: DailyMealsPlan = { breakfast, lunch, dinner };

  if (profileEff.mealStructure === "snack_forward") {
    const sPool = templatesToOptions(
      SNACK_TEMPLATES,
      profileEff,
      prefs,
      scaledTargets,
      0.08,
      locale,
    );
    out.snacks = rotateOrder(sPool, `${dateSalt}-s`);
  }

  return out;
}

/** Next option index for Swap (cycles 0..length-1). */
export function nextSwapIndex(current: number, length: number): number {
  if (length <= 0) return 0;
  return (current + 1) % length;
}

export function optionsForSlot(
  slot: MealSlot,
  daily: DailyMealsPlan,
): MealOption[] {
  switch (slot) {
    case "breakfast":
      return daily.breakfast;
    case "lunch":
      return daily.lunch;
    case "dinner":
      return daily.dinner;
    case "snack":
      return daily.snacks ?? [];
    default:
      return daily.lunch;
  }
}
