/**
 * Aggregates local signals for Reality Score (client-side).
 */
import { calendarDayKey } from "@/lib/dateKeys";
import { loadOffPlanMealsForDay } from "@/lib/food/offPlanStorage";
import { loadPlannedEvents } from "@/lib/eventsStorage";
import { computeConsistency } from "@/lib/progress";
import { getMondayBasedIndex, dayKeyForMondayOffset } from "@/lib/plan";
import { getWeeklyPatternFromProfile } from "@/lib/packageGuidance";
import { buildDayRecordMap, computeStreakSummary } from "@/lib/streaks";
import type { OnboardingAnswers } from "@/types/coach";

function parseDayKey(dayKey: string): Date | null {
  const p = dayKey.split("-").map((x) => parseInt(x, 10));
  if (p.length !== 3 || p.some((x) => Number.isNaN(x))) return null;
  return new Date(p[0]!, p[1]! - 1, p[2]!);
}

function mondayOf(ref: Date): Date {
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

/** Rolling 14d training adherence vs scheduled (0–100). */
function workoutsHitRatio14(
  answers: OnboardingAnswers,
  ref: Date,
  records: ReturnType<typeof buildDayRecordMap>,
): number {
  const train = getWeeklyPatternFromProfile(answers);
  let sched = 0;
  let hit = 0;
  for (let i = 0; i < 14; i++) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    if (!train.has(getMondayBasedIndex(d))) continue;
    sched++;
    const rec = records.get(calendarDayKey(d));
    if (rec?.markedDone && !rec?.skippedWorkout) hit++;
  }
  return sched > 0 ? hit / sched : 0.5;
}

/** Last 7d: days without calorie drift / days with any close signal (0–1). */
function macrosOnTrackRatio7(
  ref: Date,
  records: ReturnType<typeof buildDayRecordMap>,
): number {
  let tracked = 0;
  let onTrack = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    const rec = records.get(calendarDayKey(d));
    if (!rec?.markedDone) continue;
    tracked++;
    if (!rec.caloriesOver) onTrack++;
  }
  if (tracked === 0) return 0.55;
  return onTrack / tracked;
}

function recoverySignalFromHints(
  ref: Date,
  records: ReturnType<typeof buildDayRecordMap>,
): "good" | "mixed" | "poor" {
  let short = 0;
  let skip = 0;
  for (let i = 1; i <= 5; i++) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    const rec = records.get(calendarDayKey(d));
    if (rec?.activityUnder) short++;
    if (rec?.skippedWorkout) skip++;
  }
  if (short >= 2 || skip >= 2) return "poor";
  if (short === 1 || skip === 1) return "mixed";
  return "good";
}

export type RealityScoreContext = {
  consistency: number;
  streak: number;
  macrosOnTrackRatio: number;
  workoutsHitRatio: number;
  exceptionsCount: number;
  offPlanCount: number;
  recoverySignal?: "good" | "mixed" | "poor";
};

export function gatherRealityScoreContext(
  answers: OnboardingAnswers,
  referenceDate: Date,
): RealityScoreContext {
  const records = buildDayRecordMap(referenceDate, 120);
  const streaks = computeStreakSummary(answers, referenceDate);

  const mon = mondayOf(referenceDate);
  const events = loadPlannedEvents();
  let exceptionsCount = 0;
  for (let i = 0; i < 7; i++) {
    const dk = dayKeyForMondayOffset(referenceDate, i);
    const ev = events.find((e) => e.dateKey === dk);
    if (ev && (ev.kind === "travel" || ev.kind === "social")) exceptionsCount++;
  }

  let offPlanCount = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(mon, i);
    const dk = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    offPlanCount += loadOffPlanMealsForDay(parseDayKey(dk) ?? d).length;
  }

  const recoverySignal = recoverySignalFromHints(referenceDate, records);

  return {
    consistency: computeConsistency(answers, referenceDate, 14).pct,
    streak: streaks.combined,
    macrosOnTrackRatio: macrosOnTrackRatio7(referenceDate, records),
    workoutsHitRatio: workoutsHitRatio14(answers, referenceDate, records),
    exceptionsCount,
    offPlanCount,
    recoverySignal,
  };
}
