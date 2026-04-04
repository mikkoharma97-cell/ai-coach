/**
 * Yksi ruokalinja / päivä — lyhyet rivit ilman reseptiseinää (Food Flow V1).
 */
import type { Locale, MessageKey, TranslateFn } from "@/lib/i18n";
import { generateDailyMeals, optionsForSlot } from "@/lib/mealEngine";
import type { DailyMealTargets } from "@/lib/mealEngine";
import type { CoachDailyPlan, MealSlot, OnboardingAnswers } from "@/types/coach";
import { dayKeyFromDate } from "@/lib/dateKey";

function splitSentences(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  return t
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const MAX_FOOD_LINE_CHARS = 140;

function clampFoodLine(line: string): string {
  const s = line.trim();
  if (s.length <= MAX_FOOD_LINE_CHARS) return s;
  return `${s.slice(0, MAX_FOOD_LINE_CHARS - 1).trimEnd()}…`;
}

/** Helppo / tarkka / ei väliä — onboardingin joustavuus + ruokatottumukset */
export function resolveFoodDayStyleKey(
  profile: OnboardingAnswers,
): MessageKey {
  if (
    profile.flexibility === "structured" ||
    profile.eatingHabits === "good"
  ) {
    return "foodFlowV1.stylePrecise";
  }
  if (profile.flexibility === "flexible") {
    return "foodFlowV1.styleEasy";
  }
  return "foodFlowV1.styleWhatever";
}

/** Today-kortin yksi pääohje */
export function foodMainLineForToday(todayFoodTask: string): string {
  const first = splitSentences(todayFoodTask)[0] ?? todayFoodTask.trim();
  if (first.length <= 160) return first;
  return `${first.slice(0, 157).trimEnd()}…`;
}

const MEAL_STRUCT_KEYS = {
  three_meals: "onboarding.structThree" as const,
  lighter_evening: "onboarding.structLight" as const,
  snack_forward: "onboarding.structSnack" as const,
};

/** 3–5 selkeää riviä: ateriarytmi + päivän ohje(lauseet) + valinnainen energiarivi */
export function buildFoodDayLines(
  plan: CoachDailyPlan,
  profile: OnboardingAnswers,
  t: TranslateFn,
): string[] {
  const lines: string[] = [];
  lines.push(clampFoodLine(t(MEAL_STRUCT_KEYS[profile.mealStructure])));

  for (const s of splitSentences(plan.todayFoodTask)) {
    if (lines.length >= 5) break;
    lines.push(clampFoodLine(s));
  }

  if (lines.length < 5 && plan.todayCalories > 0) {
    lines.push(
      clampFoodLine(
        t("foodFlowV1.lineEnergy", {
          kcal: plan.todayCalories,
          p: Math.round(plan.todayMacros.proteinG),
        }),
      ),
    );
  }

  return lines.slice(0, 5);
}

const SLOT_KEYS: Record<MealSlot, MessageKey> = {
  breakfast: "foodFlowV1.slotBreakfast",
  lunch: "foodFlowV1.slotLunch",
  dinner: "foodFlowV1.slotDinner",
  snack: "foodFlowV1.slotSnack",
};

function slotsForMealStructure(profile: OnboardingAnswers): MealSlot[] {
  if (profile.mealStructure === "snack_forward") {
    return ["breakfast", "lunch", "snack", "dinner"];
  }
  return ["breakfast", "lunch", "dinner"];
}

function segmentConcreteLines(mealName: string, proteinG: number, carbsG: number): string[] {
  const raw = mealName.split(/,| ja | \+|–|—/).map((s) => s.trim()).filter(Boolean);
  const a = raw[0] ?? mealName;
  const b = raw[1] ?? "";
  const g1 = Math.max(40, Math.min(220, Math.round(proteinG * 5.2)));
  const g2 = Math.max(30, Math.min(200, Math.round(carbsG || proteinG * 1.4)));
  const lines = [`${a} ${g1}g`];
  if (b) lines.push(`${b} ${g2}g`);
  return lines.slice(0, 2);
}

export type FoodMealBlock = {
  slot: MealSlot;
  slotLabel: string;
  mealTitle: string;
  lines: string[];
};

/** Konkreettiset määrät / ateriat — näyttöön FoodDayView:iin */
export function buildFoodMealBlocks(
  plan: CoachDailyPlan,
  profile: OnboardingAnswers,
  t: TranslateFn,
  locale: Locale,
  refDate: Date,
): FoodMealBlock[] {
  const targets: DailyMealTargets = {
    caloriesTarget: plan.todayCalories,
    proteinTarget: plan.todayMacros.proteinG,
  };
  const salt = dayKeyFromDate(refDate);
  const dailyFi = generateDailyMeals(profile, targets, salt, "fi");
  const dailyEn = generateDailyMeals(profile, targets, salt, "en");
  const daily = locale === "en" ? dailyEn : dailyFi;

  const out: FoodMealBlock[] = [];
  for (const slot of slotsForMealStructure(profile)) {
    const opts = optionsForSlot(slot, daily);
    const opt = opts[0];
    if (!opt) continue;
    const name = opt.name;
    const p = opt.protein ?? 0;
    const c = opt.carbsG ?? Math.round(p * 1.1);
    out.push({
      slot,
      slotLabel: t(SLOT_KEYS[slot]),
      mealTitle: name,
      lines: segmentConcreteLines(name, p, c),
    });
  }
  return out;
}
