import { formatExerciseHistoryCompact } from "@/lib/coachDisplayLabels";
import { getDayKey, normalizeDayKey } from "@/lib/dayKey";
import type { Locale } from "@/lib/i18n";
import {
  getExerciseLogs,
  type WorkoutSetLogEntry,
} from "@/lib/workoutStore";

export type ExerciseHistoryRow = {
  id: string;
  /** Esim. "3 pv sitten" */
  dateLabel: string;
  /** Esim. "60 kg" */
  weightLabel: string;
  /** Esim. "8" tai useampi sarja myöhemmin */
  repsLabel: string;
};

export type ExerciseSessionDayRow = {
  dayKey: string;
  date: string;
  maxWeight: number;
  repsLabel: string;
  setCount: number;
  compactReps: number;
};

export type ExerciseHistoryStripResult = {
  /** Vakaa avain storageen */
  lookupKey: string;
  usedFallbackKey: boolean;
  rows: ExerciseHistoryRow[];
  /** Viimeisin kirjaus: "80kg x 8" log-vaihetta varten */
  lastCompactLine: string | null;
  progressionHint: string | null;
};

function slugKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9äöåü\-]/gi, "");
}

function formatKg(kg: number, locale: Locale): string {
  const s = Number.isInteger(kg) ? String(kg) : kg.toFixed(1);
  const num = locale === "fi" ? s.replace(".", ",") : s;
  return `${num} kg`;
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function formatRelativeDate(iso: string, locale: Locale): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "—";
  const now = new Date();
  const dayDiff = Math.round(
    (startOfDay(now) - startOfDay(then)) / (24 * 60 * 60 * 1000),
  );
  if (dayDiff === 0) {
    return locale === "en" ? "Today" : "Tänään";
  }
  if (dayDiff === 1) {
    return locale === "en" ? "Yesterday" : "Eilen";
  }
  if (locale === "en") {
    return dayDiff < 7 ? `${dayDiff} days ago` : `${Math.round(dayDiff / 7)} wk ago`;
  }
  return `${dayDiff} pv sitten`;
}

function dayKeyForLog(log: WorkoutSetLogEntry): string {
  const raw = log.dayKey?.trim();
  if (raw) return normalizeDayKey(raw);
  return getDayKey(new Date(log.date));
}

/**
 * Sarjat → kalenteripäiväsessiot (dayKey), uusin päivä ensin.
 * Yksi totuus progression-vihjeelle ja history-stripille.
 */
export function groupExerciseLogsByDay(
  logs: WorkoutSetLogEntry[],
): ExerciseSessionDayRow[] {
  const byDay = new Map<string, WorkoutSetLogEntry[]>();
  for (const log of logs) {
    const dk = dayKeyForLog(log);
    const arr = byDay.get(dk) ?? [];
    arr.push(log);
    byDay.set(dk, arr);
  }

  const rows: ExerciseSessionDayRow[] = [];
  for (const [dayKey, dayLogs] of byDay) {
    const sorted = [...dayLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const weights = sorted.map((l) => l.weight);
    const maxWeight = Math.max(...weights);
    const atMax = sorted.filter((l) => l.weight === maxWeight);
    const lastAtMax = atMax[atMax.length - 1]!;
    const compactReps = lastAtMax.reps;
    const latestDate = sorted[sorted.length - 1]!.date;
    rows.push({
      dayKey,
      date: latestDate,
      maxWeight,
      repsLabel: String(compactReps),
      setCount: sorted.length,
      compactReps,
    });
  }

  rows.sort((a, b) => b.dayKey.localeCompare(a.dayKey));
  return rows;
}

function sessionsToHistoryRows(
  sessions: ExerciseSessionDayRow[],
  locale: Locale,
): ExerciseHistoryRow[] {
  return sessions.map((s) => ({
    id: s.dayKey,
    dateLabel: formatRelativeDate(s.date, locale),
    weightLabel: formatKg(s.maxWeight, locale),
    repsLabel: s.repsLabel,
  }));
}

/**
 * Kolme viimeisintä **sessiopäivää** (ei kolmea viimeistä sarjaa).
 * Sama max-kuorma kolmella peräkkäisellä päivällä → vihje.
 */
function progressionHintFromSessions(
  sessions: ExerciseSessionDayRow[],
  locale: Locale,
): string | null {
  if (sessions.length < 3) return null;
  const s0 = sessions[0]!;
  const s1 = sessions[1]!;
  const s2 = sessions[2]!;
  if (
    !Number.isFinite(s0.maxWeight) ||
    !Number.isFinite(s1.maxWeight) ||
    !Number.isFinite(s2.maxWeight)
  ) {
    return null;
  }
  if (s0.maxWeight === s1.maxWeight && s1.maxWeight === s2.maxWeight) {
    return locale === "en"
      ? "Same top load on three sessions — watch reps; add weight when you top out."
      : "Sama huippukuorma kolmella treenillä — seuraa toistoja; nosta kuormaa kun yläraja täyttyy.";
  }
  return null;
}

/**
 * Palauttaa viimeisimmät kirjaukset (max 3 sessiopäivää), uusin ensin — ei synteettistä dataa.
 */
export function getExerciseHistoryForStrip(
  exerciseId: string,
  exerciseName: string,
  locale: Locale,
): ExerciseHistoryStripResult {
  const idTrim = exerciseId?.trim() || "";
  const nameTrim = exerciseName?.trim() || "exercise";

  let lookupKey = idTrim;
  let usedFallbackKey = false;

  if (!idTrim) {
    lookupKey = `name:${slugKey(nameTrim) || "unknown"}`;
    usedFallbackKey = true;
  }

  const logs = getExerciseLogs(lookupKey);
  const sessions = groupExerciseLogsByDay(logs);
  const topSessions = sessions.slice(0, 3);
  const rows = sessionsToHistoryRows(topSessions, locale);
  const last = sessions[0];
  const lastCompactLine = last
    ? formatExerciseHistoryCompact(last.maxWeight, last.compactReps, locale)
    : null;

  return {
    lookupKey,
    usedFallbackKey,
    rows,
    lastCompactLine,
    progressionHint: progressionHintFromSessions(sessions, locale),
  };
}
