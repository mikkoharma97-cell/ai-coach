/**
 * Yhtenäiset näkyvät labelit — Today, Workout, Food sama lähde.
 */
import type { FoodDayStyle } from "@/types/foodPlan";
import type { Locale } from "@/lib/i18n";

export function formatFoodPlanLabel(args: {
  mealCount: number;
  style: FoodDayStyle;
  locale: Locale;
}): string {
  const { mealCount, style, locale } = args;
  const count = Math.min(Math.max(mealCount, 3), 5);
  const fi = locale === "fi";
  const nFi = `${count} ateriaa`;
  const nEn = `${count} meals`;

  const rhythmFi: Record<FoodDayStyle, string> = {
    easy: "tasainen jako",
    warm: "aamupainotteinen",
    high_protein: "korkea proteiini",
    performance: "tarkka rytmi",
  };
  const rhythmEn: Record<FoodDayStyle, string> = {
    easy: "even split",
    warm: "breakfast-forward",
    high_protein: "high protein",
    performance: "tight rhythm",
  };

  if (fi) {
    return `${nFi} — ${rhythmFi[style]}`;
  }
  return `${nEn} — ${rhythmEn[style]}`;
}

/** Rytmi ilman aterioiden lukumäärää (FoodDayPlan.styleLabel). */
export function formatFoodStyleLabel(style: FoodDayStyle, locale: Locale): string {
  const fi = locale === "fi";
  const rhythmFi: Record<FoodDayStyle, string> = {
    easy: "tasainen jako",
    warm: "aamupainotteinen",
    high_protein: "korkea proteiini",
    performance: "tarkka rytmi",
  };
  const rhythmEn: Record<FoodDayStyle, string> = {
    easy: "even split",
    warm: "breakfast-forward",
    high_protein: "high protein",
    performance: "tight rhythm",
  };
  return fi ? rhythmFi[style] : rhythmEn[style];
}

/**
 * Treeni-rivi plan-blokkiin: mock ensisijainen; täydennetään kun vain set-loki löytyy.
 */
export function formatWorkoutPlanLabel(args: {
  locale: Locale;
  mockPlanLine: string;
  hasSessionLogToday: boolean;
  hasSetLogsToday: boolean;
}): string {
  const { locale, mockPlanLine, hasSessionLogToday, hasSetLogsToday } = args;
  if (hasSessionLogToday) return mockPlanLine;
  if (hasSetLogsToday) {
    return locale === "fi"
      ? "Sarjat kirjattu — jatka päivän rytmiä"
      : "Sets logged — keep the day’s rhythm";
  }
  return mockPlanLine;
}

export function formatExerciseHistoryCompact(
  weight: number,
  reps: number,
  locale: Locale,
): string {
  const s = Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
  const num = locale === "fi" ? s.replace(".", ",") : s;
  return `${num}kg x ${reps}`;
}

/** Tyhjä historia / ensimmäinen sarja — ei teknistä “ei dataa”. */
export function workoutHistoryEmptyCue(locale: Locale): string {
  return locale === "fi" ? "Kirjaa ensimmäinen sarja" : "Log your first set";
}

/** Ruokarakenne kun mock ei ole vielä saatavilla */
export function foodPlanFallbackLabel(locale: Locale): string {
  return locale === "fi"
    ? "4 ateriaa — tasainen rytmi"
    : "4 meals — steady rhythm";
}
