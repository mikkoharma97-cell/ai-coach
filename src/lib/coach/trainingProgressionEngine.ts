/**
 * Treenin progressiivinen ohjaus — ohjelma pysyy, muutos hallittu.
 * Ei vaihda preset-id:tä kevyesti; suosittelee kuormaa / deload / jatkoa.
 */
import {
  getDailyCoachDecisionV2,
  type CoachDecisionV2,
} from "@/lib/coach/decisionEngineV2";
import { normalizeProfileForEngine } from "@/lib/coach/profileNormalizer";
import { buildCoachProgramDecision } from "@/lib/coach/programDecisionEngine";
import type { Locale } from "@/lib/i18n";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";

export type TrainingProgressionVerb =
  | "continueProgram"
  | "deload"
  | "rotateExercise"
  | "progressLoad"
  | "holdSteady"
  | "switchProgramOnlyIfNeeded";

export type TrainingProgressionResult = {
  primary: TrainingProgressionVerb;
  continueProgram: boolean;
  deload: boolean;
  rotateExercise: boolean;
  progressLoad: boolean;
  holdSteady: boolean;
  switchProgramOnlyIfNeeded: boolean;
  /** Lyhyt perustelu (avain) */
  reasonKey:
    | "engine.progression.train.holdBlock"
    | "engine.progression.train.microLoad"
    | "engine.progression.train.deloadWeek"
    | "engine.progression.train.keepProgram"
    | "engine.progression.train.stayOnProgram"
    | "engine.progression.train.reviewProgram";
  weeksOnProgramEstimate: number;
};

/**
 * Treenipäätös: viikkoadaptaatio + V2-signaalit.
 */
export function buildTrainingProgressionResult(input: {
  profile: OnboardingAnswers;
  locale: Locale;
  plan: CoachDailyPlan;
  now: Date;
  decisionV2?: CoachDecisionV2;
}): TrainingProgressionResult {
  const p = normalizeProfileForEngine(input.profile);
  const decision = buildCoachProgramDecision(p);
  const v2 =
    input.decisionV2 ??
    getDailyCoachDecisionV2({
      profile: p,
      referenceDate: input.now,
      locale: input.locale,
      plan: input.plan,
    });
  const weeks = Math.max(1, Math.min(24, Math.floor(v2.signals.streakN / 7) + 1));

  let primary: TrainingProgressionVerb = "continueProgram";
  let reason: TrainingProgressionResult["reasonKey"] =
    "engine.progression.train.keepProgram";

  const missed = v2.signals.missedTrainingDay || v2.signals.missedWorkoutLogged;
  const highStreak = v2.signals.streakN >= 10;

  if (weeks >= 6 && highStreak && !missed) {
    primary = "progressLoad";
    reason = "engine.progression.train.microLoad";
  } else if (missed && weeks >= 5) {
    primary = "deload";
    reason = "engine.progression.train.deloadWeek";
  } else if (missed && weeks >= 2) {
    primary = "holdSteady";
    reason = "engine.progression.train.holdBlock";
  } else if (decision.confidenceLevel === "low" && weeks >= 8) {
    primary = "switchProgramOnlyIfNeeded";
    reason = "engine.progression.train.reviewProgram";
  } else if (weeks < 6 && !missed) {
    primary = "continueProgram";
    reason = "engine.progression.train.stayOnProgram";
  } else {
    primary = "continueProgram";
    reason = "engine.progression.train.keepProgram";
  }

  return {
    primary,
    continueProgram: primary === "continueProgram" || primary === "progressLoad",
    deload: primary === "deload",
    rotateExercise: false,
    progressLoad: primary === "progressLoad",
    holdSteady: primary === "holdSteady",
    switchProgramOnlyIfNeeded: primary === "switchProgramOnlyIfNeeded",
    reasonKey: reason,
    weeksOnProgramEstimate: weeks,
  };
}
