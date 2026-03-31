/**
 * Weekly review — aggregates streak, training, intake, recovery → coach analysis.
 */
import { buildWeeklyCoachAnalysis } from "@/lib/review/weeklyCoachAnalysis";
import type {
  ConsistencySignal,
  MacroSignal,
  RecoverySignal,
  StrengthSignal,
  WeeklyCoachAnalysisInput,
  WeightSignal,
} from "@/lib/review/weeklyCoachAnalysis";
import type { Locale } from "@/lib/i18n";
import { dateLocaleForUi, translate, type MessageKey } from "@/lib/i18n";
import { generateDailyPlan } from "@/lib/dailyEngine";
import { buildRebalancePlan } from "@/lib/nutrition/rebalance";
import { collectOvereatingEventsForCalendarWeek } from "@/lib/nutrition/rebalanceCollect";
import { loadPlannedEvents } from "@/lib/eventsStorage";
import { generatePersonalizedPlan, getMondayBasedIndex } from "@/lib/plan";
import {
  hasEverMarkedDayDone,
  isDayMarkedDone,
  loadOutcomeHint,
} from "@/lib/storage";
import { loadWorkShifts, normalizeShiftDateKey } from "@/lib/workShiftStorage";
import type {
  OnboardingAnswers,
  PlannedEvent,
  WeeklyReview,
} from "@/types/coach";

function mondayOfWeek(ref: Date): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const off = getMondayBasedIndex(ref);
  d.setDate(d.getDate() - off);
  return d;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function formatWeekRange(monday: Date, locale: Locale): string {
  const sun = addDays(monday, 6);
  const loc = dateLocaleForUi(locale);
  const m1 = monday.toLocaleDateString(loc, {
    month: "short",
    day: "numeric",
  });
  const m2 = sun.toLocaleDateString(loc, {
    month: "short",
    day: "numeric",
  });
  return `${m1}–${m2}, ${monday.getFullYear()}`;
}

function tr(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  return translate(locale, key, vars);
}

/** Consecutive days marked done counting back from ref (inclusive). */
function streakEndingOn(ref: Date): number {
  let n = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(ref);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    if (isDayMarkedDone(d)) n++;
    else break;
  }
  return n;
}

function parseEventDate(key: string): Date | null {
  const p = key.split("-").map((x) => parseInt(x, 10));
  if (p.length !== 3 || p.some((x) => Number.isNaN(x))) return null;
  return new Date(p[0], p[1] - 1, p[2]);
}

function isDateInRange(d: Date, start: Date, end: Date): boolean {
  const t = d.setHours(0, 0, 0, 0);
  const a = new Date(start).setHours(0, 0, 0, 0);
  const b = new Date(end).setHours(0, 0, 0, 0);
  return t >= a && t <= b;
}

function plannedEventsInWeek(monday: Date, events: PlannedEvent[]): boolean {
  const end = addDays(monday, 6);
  return events.some((e) => {
    const d = parseEventDate(e.dateKey);
    if (!d) return false;
    return isDateInRange(d, monday, end);
  });
}

/** Työvuoromerkintöjä kalenteriviikolla — palautteen rytmi ei vertaa 9–17-”normaaliin”. */
function shiftPlanTouchesWeek(monday: Date): boolean {
  if (typeof window === "undefined") return false;
  const end = addDays(monday, 6);
  for (const e of loadWorkShifts()) {
    const p = normalizeShiftDateKey(e.date)
      .split("-")
      .map((x) => parseInt(x, 10));
    if (p.length !== 3 || p.some((n) => Number.isNaN(n))) continue;
    const d = new Date(p[0], p[1] - 1, p[2]);
    if (isDateInRange(d, monday, end)) return true;
  }
  return false;
}

function deriveStrength(
  trainingScheduled: number,
  trainingHit: number,
): StrengthSignal {
  if (trainingScheduled <= 0) return "unknown";
  if (trainingHit === trainingScheduled) return "up";
  if (trainingHit === 0) return "down";
  return "flat";
}

function deriveWeightSignal(
  answers: OnboardingAnswers,
  calorieDriftDays: number,
): WeightSignal {
  if (answers.goal === "lose_weight" && calorieDriftDays >= 2) return "stuck";
  return "neutral";
}

function deriveMacros(
  calorieDriftDays: number,
  daysWithOutcomeHint: number,
): MacroSignal {
  if (calorieDriftDays >= 3) return "poor";
  if (calorieDriftDays === 0 && daysWithOutcomeHint >= 2) return "good";
  return "mixed";
}

function deriveRecovery(
  activityShortDays: number,
  skippedHintDays: number,
  trainingMissed: number,
): RecoverySignal {
  if (activityShortDays >= 2 || skippedHintDays >= 2) return "poor";
  if (activityShortDays === 0 && skippedHintDays === 0 && trainingMissed <= 1)
    return "good";
  return "mixed";
}

function deriveConsistency(
  trainingScheduled: number,
  trainingHit: number,
  trainingMissed: number,
  calorieDriftDays: number,
): ConsistencySignal {
  if (trainingScheduled > 0) {
    const rate = trainingHit / trainingScheduled;
    if (rate >= 0.85 && calorieDriftDays <= 1) return "high";
  }
  if (trainingMissed >= 2 || calorieDriftDays >= 4) return "low";
  return "mid";
}

function flexibilityAppendKey(
  f: OnboardingAnswers["flexibility"],
): MessageKey {
  const m: Record<OnboardingAnswers["flexibility"], MessageKey> = {
    structured: "review.gen.next.strict",
    balanced: "review.gen.next.balanced",
    flexible: "review.gen.next.flexible",
  };
  return m[f];
}

export type WeeklyReviewWeekMetrics = {
  trainingScheduled: number;
  trainingHit: number;
  trainingMissed: number;
  calorieDriftDays: number;
};

function computeWeekTrainingBlock(
  answers: OnboardingAnswers,
  referenceDate: Date,
  locale: Locale,
): {
  plan: ReturnType<typeof generatePersonalizedPlan>;
  daily: ReturnType<typeof generateDailyPlan>;
  weekDays: ReturnType<typeof generatePersonalizedPlan>["weeklyPlan"]["days"];
  monday: Date;
  events: PlannedEvent[];
  trainingScheduled: number;
  trainingHit: number;
  trainingMissed: number;
  calorieDriftDays: number;
  activityShortDays: number;
  skippedHintDays: number;
  daysWithOutcomeHint: number;
} {
  const plan = generatePersonalizedPlan(answers, referenceDate, locale);
  const daily = generateDailyPlan(answers, referenceDate, locale);
  const weekDays = plan.weeklyPlan.days;
  const monday = mondayOfWeek(referenceDate);
  const events = loadPlannedEvents();

  let trainingScheduled = 0;
  let trainingHit = 0;
  let trainingMissed = 0;
  let calorieDriftDays = 0;
  let activityShortDays = 0;
  let skippedHintDays = 0;
  let daysWithOutcomeHint = 0;

  for (let i = 0; i < 7; i++) {
    const day = addDays(monday, i);
    const entry = weekDays[i];
    const done = isDayMarkedDone(day);
    const hint = loadOutcomeHint(day);
    const h = hint ?? {};

    if (hint != null) daysWithOutcomeHint++;
    if (h.caloriesOver) calorieDriftDays++;
    if (h.activityUnder) activityShortDays++;
    if (h.skippedWorkout) skippedHintDays++;

    if (!entry.isRest) {
      trainingScheduled++;
      if (done) {
        trainingHit++;
      } else {
        trainingMissed++;
      }
    }
  }

  return {
    plan,
    daily,
    weekDays,
    monday,
    events,
    trainingScheduled,
    trainingHit,
    trainingMissed,
    calorieDriftDays,
    activityShortDays,
    skippedHintDays,
    daysWithOutcomeHint,
  };
}

/** For weekly truth line + external summaries — same week window as review. */
export function computeWeeklyReviewWeekMetrics(
  answers: OnboardingAnswers,
  referenceDate: Date = new Date(),
  locale: Locale = "fi",
): WeeklyReviewWeekMetrics {
  const b = computeWeekTrainingBlock(answers, referenceDate, locale);
  return {
    trainingScheduled: b.trainingScheduled,
    trainingHit: b.trainingHit,
    trainingMissed: b.trainingMissed,
    calorieDriftDays: b.calorieDriftDays,
  };
}

export function computeWeeklyReviewContextFlags(
  answers: OnboardingAnswers,
  referenceDate: Date,
): { exceptions: boolean } {
  const monday = mondayOfWeek(referenceDate);
  const events = loadPlannedEvents();
  return {
    exceptions:
      plannedEventsInWeek(monday, events) ||
      answers.eventDisruption === "loose" ||
      answers.socialEatingFrequency === "often",
  };
}

export function generateWeeklyReview(
  answers: OnboardingAnswers,
  referenceDate: Date = new Date(),
  locale: Locale = "fi",
): WeeklyReview {
  const engaged = hasEverMarkedDayDone();
  const block = computeWeekTrainingBlock(answers, referenceDate, locale);
  const { plan, daily, weekDays, monday, events } = block;
  const {
    trainingScheduled,
    trainingHit,
    trainingMissed,
    calorieDriftDays,
    activityShortDays,
    skippedHintDays,
    daysWithOutcomeHint,
  } = block;

  const streak = streakEndingOn(referenceDate);
  const strip = {
    streakDays: streak,
    consistency: deriveConsistency(
      trainingScheduled,
      trainingHit,
      trainingMissed,
      calorieDriftDays,
    ),
    proteinTargetG: daily.todayMacros.proteinG,
    avgSleepHours: null as number | null,
  };

  if (!engaged) {
    return {
      weekRangeLabel: formatWeekRange(monday, locale),
      coach: {
        headline: tr(locale, "review.coach.headline.noLog"),
        didWork: [tr(locale, "review.coach.noLog.did")],
        heldBack: [tr(locale, "review.coach.noLog.held")],
        nextMove: [tr(locale, "review.gen.noLog.nextWeek")],
        coachLine: null,
      },
      strip,
    };
  }

  const strength = deriveStrength(trainingScheduled, trainingHit);
  const weight = deriveWeightSignal(answers, calorieDriftDays);
  const macros = deriveMacros(calorieDriftDays, daysWithOutcomeHint);
  const recovery = deriveRecovery(
    activityShortDays,
    skippedHintDays,
    trainingMissed,
  );
  const consistency = deriveConsistency(
    trainingScheduled,
    trainingHit,
    trainingMissed,
    calorieDriftDays,
  );

  const exceptions =
    plannedEventsInWeek(monday, events) ||
    answers.eventDisruption === "loose" ||
    answers.socialEatingFrequency === "often";

  const input: WeeklyCoachAnalysisInput = {
    streak,
    strength,
    weight,
    macros,
    recovery,
    consistency,
    exceptions,
    locale,
  };

  const coach = buildWeeklyCoachAnalysis(input);

  let didWorkLines = [...coach.didWork];
  let heldBackLines = [...coach.heldBack];
  if (typeof window !== "undefined") {
    const weekEvents = collectOvereatingEventsForCalendarWeek(
      answers,
      monday,
      locale,
    );
    const weekExtraTotal = weekEvents.reduce((s, e) => s + e.extraCalories, 0);
    const weekRebalancePlan = buildRebalancePlan(weekEvents);
    if (calorieDriftDays > 0 && weekRebalancePlan) {
      didWorkLines = [
        tr(locale, "review.rebalanceHandled"),
        ...didWorkLines,
      ].slice(0, 6);
    }
    if (weekExtraTotal >= 1200 || calorieDriftDays >= 4) {
      heldBackLines = [
        tr(locale, "review.rebalanceTooMuch"),
        ...heldBackLines,
      ].slice(0, 6);
    }
  }

  const flexLine = tr(locale, flexibilityAppendKey(answers.flexibility));
  const trainMissLine =
    trainingMissed >= 2
      ? tr(locale, "review.gen.next.trainMiss", {
          n: Math.max(2, answers.daysPerWeek - 1),
        }).trim()
      : null;

  const shiftWeekLine =
    typeof window !== "undefined" && shiftPlanTouchesWeek(monday)
      ? tr(locale, "review.shift.nextMove")
      : null;

  const nextMove = [
    ...coach.nextMove,
    ...(trainMissLine ? [trainMissLine] : []),
    ...(shiftWeekLine ? [shiftWeekLine] : []),
    flexLine,
  ].slice(0, 5);

  return {
    weekRangeLabel: formatWeekRange(monday, locale),
    coach: {
      ...coach,
      didWork: didWorkLines,
      heldBack: heldBackLines,
      nextMove,
    },
    strip,
  };
}
