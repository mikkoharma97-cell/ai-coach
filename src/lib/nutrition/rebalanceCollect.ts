/**
 * Kerää ylisyöntitapahtumat lokista / vihjeistä / poikkeuksista — client-only (localStorage).
 */
import {
  buildAdaptiveUserState,
  composeCoachDailyPlan,
} from "@/lib/adaptive";
import { dayKeyFromDate } from "@/lib/dateKey";
import { loadFoodLog } from "@/lib/foodStorage";
import { loadOffPlanMealsForDay } from "@/lib/food/offPlanStorage";
import { loadExceptionWeekLog } from "@/lib/exceptionStorage";
import { loadOutcomeHint } from "@/lib/storage";
import type { OvereatingEvent } from "@/types/rebalance";
import type { OnboardingAnswers } from "@/types/coach";
import type { Locale } from "@/lib/i18n";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function dayHasFoodChaos(dayKey: string): boolean {
  const log = loadExceptionWeekLog();
  return log.some((e) => e.dayKey === dayKey && e.id === "food_chaos");
}

function collectDay(
  answers: OnboardingAnswers,
  day: Date,
  locale: Locale,
): OvereatingEvent | null {
  const state = buildAdaptiveUserState(answers, day);
  const plan = composeCoachDailyPlan(state, locale, null);
  const targetKcal = plan.todayCalories;

  const log = loadFoodLog(day);
  const logKcal = log.reduce((s, x) => s + x.kcal, 0);
  const offPlan = loadOffPlanMealsForDay(day);
  const offKcal = offPlan.reduce((s, m) => s + m.calories, 0);
  const consumed = logKcal + offKcal;

  let surplus = Math.max(0, Math.round(consumed - targetKcal));
  const hint = loadOutcomeHint(day);
  const dk = dayKeyFromDate(day);

  let source: OvereatingEvent["source"] =
    surplus > 0 ? "logged" : undefined;

  if (hint?.caloriesOver && surplus < 250) {
    surplus = Math.max(surplus, 450);
    source = "estimated";
  }

  if (dayHasFoodChaos(dk)) {
    surplus = Math.max(surplus, 450);
    source = surplus > 0 && source === "logged" ? "logged" : "exception";
  }

  if (surplus <= 0) return null;

  return {
    date: dk,
    extraCalories: surplus,
    source,
  };
}

export function collectOvereatingEventsForRange(
  answers: OnboardingAnswers,
  rangeStart: Date,
  rangeEndInclusive: Date,
  locale: Locale,
): OvereatingEvent[] {
  if (typeof window === "undefined") return [];

  const out: OvereatingEvent[] = [];
  let cur = startOfDay(rangeStart);
  const end = startOfDay(rangeEndInclusive);
  while (cur.getTime() <= end.getTime()) {
    const ev = collectDay(answers, new Date(cur), locale);
    if (ev) out.push(ev);
    cur = addDays(cur, 1);
  }
  return out;
}

/** Viimeiset 7 kalenteripäivää päättyen ref-päivään (mukana). */
export function collectOvereatingEventsForLast7Days(
  answers: OnboardingAnswers,
  referenceDate: Date,
  locale: Locale,
): OvereatingEvent[] {
  const end = startOfDay(referenceDate);
  const start = addDays(end, -6);
  return collectOvereatingEventsForRange(answers, start, end, locale);
}

/** Kalenteriviikko: ma–su, jossa weekMonday on viikon maanantai. */
export function collectOvereatingEventsForCalendarWeek(
  answers: OnboardingAnswers,
  weekMonday: Date,
  locale: Locale,
): OvereatingEvent[] {
  const start = startOfDay(weekMonday);
  const end = addDays(start, 6);
  return collectOvereatingEventsForRange(answers, start, end, locale);
}
