/**
 * Kevyt “valmennus”-palaute treenin lopussa — pelkkä heuristiikka lokeista.
 */
import { formatExerciseHistoryCompact } from "@/lib/coachDisplayLabels";
import { normalizeDayKey } from "@/lib/dayKey";
import type { Locale } from "@/lib/i18n";
import type { ProExercise } from "@/types/pro";
import { groupExerciseLogsByDay } from "@/lib/workoutHistory";
import { getExerciseLogs } from "@/lib/workoutStore";

type ExerciseSessionDayRow = ReturnType<
  typeof groupExerciseLogsByDay
>[number];

function sessionsForExercise(
  ex: ProExercise,
): ExerciseSessionDayRow[] {
  const id = ex.id?.trim();
  if (!id) return [];
  const logs = getExerciseLogs(id);
  return groupExerciseLogsByDay(logs);
}

/**
 * Viimeisin sessio, joka ei ole tämä päivä — max kg × toistot (kompakti).
 */
export function getPreviousSessionCompactLine(
  exercise: ProExercise,
  todayDayKey: string,
  locale: Locale,
): string | null {
  const sessions = sessionsForExercise(exercise);
  const dk = normalizeDayKey(todayDayKey);
  const prev = sessions.find((s) => s.dayKey !== dk);
  if (!prev) return null;
  return formatExerciseHistoryCompact(prev.maxWeight, prev.compactReps, locale);
}

/** Edellisen session (ei tänään) max kg + toistot — progression-vihjeitä varten. */
export function getPreviousSessionNumbers(
  exercise: ProExercise,
  todayDayKey: string,
): { maxWeight: number; compactReps: number } | null {
  const sessions = sessionsForExercise(exercise);
  const dk = normalizeDayKey(todayDayKey);
  const prev = sessions.find((s) => s.dayKey !== dk);
  if (!prev) return null;
  return { maxWeight: prev.maxWeight, compactReps: prev.compactReps };
}

export type ProgressionHintKind =
  | "bump"
  | "hold"
  | "lighter"
  | "up"
  | "no_history";

/**
 * Yksi lyhyt vihje sarjalokituksessa: vertaa luonnoksen painoa edelliseen maxiin.
 */
export function progressionHintKind(
  prev: { maxWeight: number; compactReps: number } | null,
  draftKgStr: string,
): ProgressionHintKind {
  if (!prev) return "no_history";
  const raw = draftKgStr.replace(",", ".").trim();
  if (!raw) return "bump";
  const kg = parseFloat(raw);
  if (!Number.isFinite(kg)) return "hold";
  if (kg > prev.maxWeight + 0.25) return "up";
  if (kg < prev.maxWeight - 0.25) return "lighter";
  return "hold";
}

export type SessionFinishCoachKind = "default" | "weight_up" | "hold";

export function computeSessionFinishCoachFeel(
  blocks: ProExercise[],
  todayDayKey: string,
  _locale: Locale,
): SessionFinishCoachKind {
  if (blocks.length === 0) return "default";
  const dk = normalizeDayKey(todayDayKey);
  let anyUp = false;
  let anyComparable = false;
  let allHold = true;

  for (const ex of blocks) {
    const sessions = sessionsForExercise(ex);
    const todayS = sessions.find((s) => s.dayKey === dk);
    const prevS = sessions.find((s) => s.dayKey !== dk);
    if (!todayS || !prevS) {
      allHold = false;
      continue;
    }
    anyComparable = true;
    if (todayS.maxWeight > prevS.maxWeight) anyUp = true;
    if (todayS.maxWeight !== prevS.maxWeight) allHold = false;
  }

  if (anyUp) return "weight_up";
  if (anyComparable && allHold) return "hold";
  return "default";
}
