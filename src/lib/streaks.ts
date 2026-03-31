/**
 * Streak summaries — calendar training pattern + day marks from storage.
 */
import { calendarDayKey } from "@/lib/dateKeys";
import { getWeeklyPatternFromProfile } from "@/lib/packageGuidance";
import { getMondayBasedIndex } from "@/lib/plan";
import { isDayMarkedDone, loadOutcomeHint } from "@/lib/storage";
import type { OnboardingAnswers, RecentDayRecord } from "@/types/coach";

export function buildDayRecordMap(
  referenceDate: Date,
  daysBack: number,
): Map<string, RecentDayRecord> {
  const map = new Map<string, RecentDayRecord>();
  if (typeof window === "undefined") return map;
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const k = calendarDayKey(d);
    const hint = loadOutcomeHint(d);
    map.set(k, {
      dateKey: k,
      markedDone: isDayMarkedDone(d),
      ...(hint ?? {}),
    });
  }
  return map;
}

function isTrainingDay(answers: OnboardingAnswers, date: Date): boolean {
  const train = getWeeklyPatternFromProfile(answers);
  return train.has(getMondayBasedIndex(date));
}

/** Consecutive scheduled training days hit going backward from yesterday (rest days skipped). */
export function workoutStreakFrom(
  answers: OnboardingAnswers,
  referenceDate: Date,
  records: Map<string, RecentDayRecord>,
  maxDays = 120,
): number {
  let n = 0;
  for (let i = 1; i <= maxDays; i++) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    if (!isTrainingDay(answers, d)) continue;
    const rec = records.get(calendarDayKey(d));
    const ok = Boolean(rec?.markedDone && !rec?.skippedWorkout);
    if (ok) n++;
    else break;
  }
  return n;
}

/** Consecutive days with closed day and no calorie-over flag. */
export function nutritionStreakFrom(
  referenceDate: Date,
  records: Map<string, RecentDayRecord>,
  maxDays = 120,
): number {
  let n = 0;
  for (let i = 1; i <= maxDays; i++) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const rec = records.get(calendarDayKey(d));
    const ok = Boolean(rec?.markedDone && !rec?.caloriesOver);
    if (ok) n++;
    else break;
  }
  return n;
}

/** Both food rhythm and training (when scheduled) satisfied, counting calendar days back. */
export function combinedStreakFrom(
  answers: OnboardingAnswers,
  referenceDate: Date,
  records: Map<string, RecentDayRecord>,
  maxDays = 120,
): number {
  let n = 0;
  for (let i = 1; i <= maxDays; i++) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const k = calendarDayKey(d);
    const rec = records.get(k);
    const foodOk = Boolean(rec?.markedDone && !rec?.caloriesOver);
    if (!foodOk) break;
    if (isTrainingDay(answers, d)) {
      const trainOk = Boolean(rec?.markedDone && !rec?.skippedWorkout);
      if (!trainOk) break;
    }
    n++;
  }
  return n;
}

export type StreakSummary = {
  combined: number;
  workout: number;
  nutrition: number;
};

export function computeStreakSummary(
  answers: OnboardingAnswers,
  referenceDate: Date,
): StreakSummary {
  const records = buildDayRecordMap(referenceDate, 120);
  return {
    combined: combinedStreakFrom(answers, referenceDate, records),
    workout: workoutStreakFrom(answers, referenceDate, records),
    nutrition: nutritionStreakFrom(referenceDate, records),
  };
}
