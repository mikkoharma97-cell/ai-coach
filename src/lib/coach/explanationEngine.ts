/**
 * “Miksi näin” — lyhyet, ei-tekniset rivit (käännökset i18n:stä).
 */
import type { CoachProgramDecision } from "@/lib/coach/programDecisionEngine";
import type { WeeklyAdaptation } from "@/lib/coach/weekAdaptationEngine";
import { buildNutritionEngineSnapshot } from "@/lib/coach/nutritionEngine";
import { translate, type Locale } from "@/lib/i18n";
import type { OnboardingAnswers } from "@/types/coach";

export type CoachExplanation = {
  programWhy: string;
  foodWhy: string;
  weekWhy: string;
};

export function buildCoachExplanation(
  profile: OnboardingAnswers,
  decision: CoachProgramDecision,
  adaptation: WeeklyAdaptation | null,
  locale: Locale,
): CoachExplanation {
  const nut = buildNutritionEngineSnapshot(profile);
  const programWhy = translate(locale, decision.rationaleKey);
  const foodWhy = translate(locale, nut.structureRationaleKey);
  const weekWhy = adaptation
    ? translate(locale, adaptation.headlineKey)
    : translate(locale, "engine.week.neutralLine");

  return { programWhy, foodWhy, weekWhy };
}
