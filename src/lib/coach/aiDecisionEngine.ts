/**
 * HÄRMÄ19 — yksi päätöspolku: tavoite + edistyminen + ruoka + treeni → tänään + seuraava säätö.
 * Kokoaa `generateDailyPlan` → `CoachDailyPlan` -pinnan päälle V2-päätöksen ja viikkoadaptaation.
 */
import { buildCoachEngineBundle, type CoachEngineBundle } from "@/lib/coach/coachEngineBundle";
import {
  getDailyCoachDecisionV2,
  type CoachDecisionV2,
} from "@/lib/coach/decisionEngineV2";
import { getGoalTimeline } from "@/lib/goalTimeline";
import type { Locale, MessageKey } from "@/lib/i18n";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";
import type { WeeklyAdaptationPrimary } from "@/lib/coach/weekAdaptationEngine";

export type CoachAiInputsEcho = {
  goal: OnboardingAnswers["goal"];
  goalPaceKey: string | null;
  workoutTodayLine: string;
  foodSurface: {
    todayFoodTask: string;
    foodAdjustmentNote: string | null;
    rebalanceActive: boolean;
  };
  progressSignals: CoachDecisionV2["signals"];
};

/** Seuraava moottorin liike — näkyy hero + viikkorivi + ruoka-säätö */
export type CoachNextAdjustment = {
  priority: CoachDecisionV2["priority"];
  weeklyHeadlineKey: MessageKey;
  weeklyPrimary: WeeklyAdaptationPrimary;
  foodLine: string | null;
  heroMain: string;
  heroDirection: string;
};

export type CoachAiEngineResult = {
  todayPlan: CoachDailyPlan;
  nextAdjustment: CoachNextAdjustment;
  decisionV2: CoachDecisionV2;
  bundle: CoachEngineBundle;
  inputsEcho: CoachAiInputsEcho;
};

/**
 * Yksi kutsu kun `CoachDailyPlan` on jo laskettu (esim. `generateDailyPlan` + exception).
 */
export function buildCoachAiEngineResult(input: {
  profile: OnboardingAnswers;
  locale: Locale;
  now: Date;
  plan: CoachDailyPlan;
  activeException: boolean;
}): CoachAiEngineResult {
  const { profile, locale, now, plan, activeException } = input;

  const bundle = buildCoachEngineBundle({
    profile,
    locale,
    now,
    plan,
    activeException,
  });

  const decisionV2 = getDailyCoachDecisionV2({
    profile,
    referenceDate: now,
    locale,
    plan,
  });

  const gt = getGoalTimeline(profile, now);
  const en = locale === "en";

  const foodLine = plan.foodAdjustmentNote ?? plan.systemLine;

  const nextAdjustment: CoachNextAdjustment = {
    priority: decisionV2.priority,
    weeklyHeadlineKey: bundle.adaptation.headlineKey,
    weeklyPrimary: bundle.adaptation.primary,
    foodLine,
    heroMain: en ? decisionV2.mainMessageEn : decisionV2.mainMessageFi,
    heroDirection: en ? decisionV2.directionEn : decisionV2.directionFi,
  };

  const inputsEcho: CoachAiInputsEcho = {
    goal: profile.goal,
    goalPaceKey: gt.hasTarget ? gt.paceKey : null,
    workoutTodayLine: plan.todayWorkout,
    foodSurface: {
      todayFoodTask: plan.todayFoodTask,
      foodAdjustmentNote: plan.foodAdjustmentNote,
      rebalanceActive: Boolean(plan.rebalancePlan),
    },
    progressSignals: decisionV2.signals,
  };

  return {
    todayPlan: plan,
    nextAdjustment,
    decisionV2,
    bundle,
    inputsEcho,
  };
}
