/**
 * Central daily plan composer — Today / Food / Plan / Adjustments.
 */
import {
  buildAdaptiveUserState,
  composeCoachDailyPlan,
} from "@/lib/adaptive";
import { buildRebalancePlan } from "@/lib/nutrition/rebalance";
import { collectOvereatingEventsForLast7Days } from "@/lib/nutrition/rebalanceCollect";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";
import type { Locale, TranslateFn } from "@/lib/i18n";
import { hasEverMarkedDayDone } from "@/lib/storage";

/**
 * Always-on copy for Today — raw `systemLine` may be null when nothing rebalance-worthy fired.
 */
export function displaySystemLine(
  raw: string | null,
  t: TranslateFn,
): string {
  if (raw) return raw;
  return hasEverMarkedDayDone()
    ? t("today.systemLine.baselineEngaged")
    : t("today.systemLine.baselineFresh");
}

/**
 * Primary API — profile + localStorage → full daily plan (tasapainotus clientillä).
 */
export function generateDailyPlan(
  answers: OnboardingAnswers,
  referenceDate: Date = new Date(),
  locale: Locale = "fi",
): CoachDailyPlan {
  const state = buildAdaptiveUserState(answers, referenceDate);
  let rebalance = null;
  if (typeof window !== "undefined") {
    const events = collectOvereatingEventsForLast7Days(
      answers,
      referenceDate,
      locale,
    );
    rebalance = buildRebalancePlan(events);
  }
  return composeCoachDailyPlan(state, locale, rebalance);
}
