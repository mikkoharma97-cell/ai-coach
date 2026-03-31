/**
 * Weekly coach analysis — streak, training, intake, recovery signals → concise narrative.
 * Copy lives in i18n (`review.coach.*`); logic stays deterministic.
 */
import type { WeeklyCoachAnalysis } from "@/types/coach";
import type { Locale } from "@/lib/i18n";
import { translate, type MessageKey } from "@/lib/i18n";

export type StrengthSignal = "up" | "flat" | "down" | "unknown";
export type WeightSignal =
  | "stuck"
  | "down"
  | "up"
  | "neutral"
  | "unknown";
export type MacroSignal = "good" | "mixed" | "poor";
export type RecoverySignal = "good" | "mixed" | "poor";
export type ConsistencySignal = "high" | "mid" | "low";

export type WeeklyCoachAnalysisInput = {
  streak: number;
  strength: StrengthSignal;
  weight: WeightSignal;
  macros: MacroSignal;
  recovery: RecoverySignal;
  consistency: ConsistencySignal;
  exceptions: boolean;
  locale: Locale;
};

function tr(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  return translate(locale, key, vars);
}

type HeadlineKind =
  | "stuckRhythm"
  | "recoveryLag"
  | "rhythmHeld"
  | "streakCarry"
  | "exceptionWeek"
  | "mixed";

function pickHeadlineKind(input: WeeklyCoachAnalysisInput): HeadlineKind {
  const {
    streak,
    strength,
    weight,
    macros,
    recovery,
    consistency,
    exceptions,
  } = input;

  const weightStuckFoodMess =
    weight === "stuck" && (macros === "poor" || macros === "mixed");
  if (weightStuckFoodMess) return "stuckRhythm";

  const strongLoadWeakRecovery =
    strength === "up" && (recovery === "poor" || recovery === "mixed");
  if (strongLoadWeakRecovery) return "recoveryLag";

  if (consistency === "high" && macros === "good") return "rhythmHeld";

  if (exceptions && consistency !== "high") return "exceptionWeek";

  if (streak >= 5 && consistency !== "low") return "streakCarry";

  return "mixed";
}

function headlineFor(
  kind: HeadlineKind,
  locale: Locale,
  streak: number,
): string {
  const keys: Record<HeadlineKind, MessageKey> = {
    stuckRhythm: "review.coach.headline.stuckRhythm",
    recoveryLag: "review.coach.headline.recoveryLag",
    rhythmHeld: "review.coach.headline.rhythmHeld",
    streakCarry: "review.coach.headline.streakCarry",
    exceptionWeek: "review.coach.headline.exceptionWeek",
    mixed: "review.coach.headline.mixed",
  };
  if (kind === "streakCarry") {
    return tr(locale, keys.streakCarry, { n: streak });
  }
  return tr(locale, keys[kind]);
}

function coachLineFor(
  kind: HeadlineKind,
  recovery: RecoverySignal,
  macros: MacroSignal,
  locale: Locale,
): string | null {
  if (kind === "recoveryLag" || recovery === "poor") {
    return tr(locale, "review.coach.line.recovery");
  }
  if (kind === "stuckRhythm" || macros === "poor") {
    return tr(locale, "review.coach.line.rhythm");
  }
  if (kind === "rhythmHeld" || kind === "streakCarry") {
    return tr(locale, "review.coach.line.hold");
  }
  return tr(locale, "review.coach.line.default");
}

function buildDidWork(
  input: WeeklyCoachAnalysisInput,
  headlineKind: HeadlineKind,
): string[] {
  const out: string[] = [];
  const { strength, consistency, macros, streak, recovery, locale } = input;

  if (strength === "up") {
    out.push(tr(locale, "review.coach.did.strengthUp"));
  } else if (strength === "flat" && consistency !== "low") {
    out.push(tr(locale, "review.coach.did.strengthFlat"));
  }

  if (macros === "good") {
    out.push(tr(locale, "review.coach.did.macrosGood"));
  }

  if (consistency === "high") {
    out.push(tr(locale, "review.coach.did.consistencyHigh"));
  }

  if (streak >= 3 && headlineKind !== "streakCarry") {
    out.push(tr(locale, "review.coach.did.streak", { n: streak }));
  }

  if (recovery === "good" && strength === "up") {
    out.push(tr(locale, "review.coach.did.recoveryOk"));
  }

  if (out.length === 0) {
    out.push(tr(locale, "review.coach.did.fallback"));
  }

  return out.slice(0, 3);
}

function buildHeldBack(
  input: WeeklyCoachAnalysisInput,
  headlineKind: HeadlineKind,
): string[] {
  const out: string[] = [];
  const { strength, weight, macros, recovery, exceptions, locale } = input;

  if (recovery === "poor" || recovery === "mixed") {
    out.push(
      tr(
        locale,
        recovery === "poor"
          ? "review.coach.held.recoveryPoor"
          : "review.coach.held.recoveryMixed",
      ),
    );
  }

  if (macros === "poor" || macros === "mixed") {
    out.push(
      tr(
        locale,
        macros === "poor"
          ? "review.coach.held.macrosPoor"
          : "review.coach.held.macrosMixed",
      ),
    );
  }

  if (weight === "stuck") {
    out.push(tr(locale, "review.coach.held.weightStuck"));
  }

  if (strength === "down") {
    out.push(tr(locale, "review.coach.held.strengthDown"));
  }

  if (exceptions && headlineKind === "exceptionWeek") {
    out.push(tr(locale, "review.coach.held.exceptions"));
  }

  if (out.length === 0) {
    out.push(tr(locale, "review.coach.held.fallback"));
  }

  return out.slice(0, 3);
}

function buildNextMove(
  input: WeeklyCoachAnalysisInput,
  headlineKind: HeadlineKind,
): string[] {
  const out: string[] = [];
  const { recovery, macros, strength, consistency, locale } = input;

  if (recovery === "poor" || headlineKind === "recoveryLag") {
    out.push(tr(locale, "review.coach.next.recovery"));
  }

  if (
    macros === "poor" ||
    (headlineKind === "stuckRhythm" && macros !== "good")
  ) {
    out.push(tr(locale, "review.coach.next.intakeRhythm"));
  }

  if (strength === "down" || consistency === "low") {
    out.push(tr(locale, "review.coach.next.trainingAnchor"));
  }

  if (out.length === 0) {
    out.push(tr(locale, "review.coach.next.default"));
  }

  return out.slice(0, 3);
}

export function buildWeeklyCoachAnalysis(
  input: WeeklyCoachAnalysisInput,
): WeeklyCoachAnalysis {
  const headlineKind = pickHeadlineKind(input);
  const headline = headlineFor(
    headlineKind,
    input.locale,
    input.streak,
  );

  const didWork = buildDidWork(input, headlineKind);
  const heldBack = buildHeldBack(input, headlineKind);
  const nextMove = buildNextMove(input, headlineKind);

  const coachLine = coachLineFor(
    headlineKind,
    input.recovery,
    input.macros,
    input.locale,
  );

  return {
    headline,
    didWork,
    heldBack,
    nextMove,
    coachLine,
  };
}
