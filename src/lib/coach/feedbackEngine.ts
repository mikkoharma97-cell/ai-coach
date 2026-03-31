/**
 * Valmentajan ääni — suora, ammattimainen; sama sävy kaikilla näkymillä.
 */
import type { CoachProgramDecision } from "@/lib/coach/programDecisionEngine";
import type { WeeklyAdaptation } from "@/lib/coach/weekAdaptationEngine";
import type { CoachExplanation } from "@/lib/coach/explanationEngine";
import { translate, type Locale } from "@/lib/i18n";

export function buildTodayCoachLine(
  locale: Locale,
  explanation: CoachExplanation,
): string {
  return translate(locale, "engine.feedback.today", {
    week: explanation.weekWhy,
    program: explanation.programWhy,
  });
}

export function buildFoodCoachLine(
  locale: Locale,
  explanation: CoachExplanation,
): string {
  return translate(locale, "engine.feedback.food", {
    food: explanation.foodWhy,
    program: explanation.programWhy,
  });
}

export function buildWorkoutCoachLine(
  locale: Locale,
  decision: CoachProgramDecision,
): string {
  return translate(locale, "engine.feedback.workout", {
    track: translate(locale, decision.presetNameKey),
  });
}

export function buildReviewCoachLine(
  locale: Locale,
  adaptation: WeeklyAdaptation | null,
): string {
  if (!adaptation) return translate(locale, "engine.feedback.reviewNeutral");
  return translate(locale, "engine.feedback.review", {
    line: translate(locale, adaptation.detailKey),
  });
}
