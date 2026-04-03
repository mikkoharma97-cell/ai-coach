/**
 * Yksi ruokalinja / päivä — lyhyet rivit ilman reseptiseinää (Food Flow V1).
 */
import type { MessageKey, TranslateFn } from "@/lib/i18n";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";

function splitSentences(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  return t
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
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
  lines.push(t(MEAL_STRUCT_KEYS[profile.mealStructure]));

  for (const s of splitSentences(plan.todayFoodTask)) {
    if (lines.length >= 5) break;
    lines.push(s);
  }

  if (lines.length < 5 && plan.todayCalories > 0) {
    lines.push(
      t("foodFlowV1.lineEnergy", {
        kcal: plan.todayCalories,
        p: Math.round(plan.todayMacros.proteinG),
      }),
    );
  }

  return lines.slice(0, 5);
}
