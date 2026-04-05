import { getDayKey, getTodayDayKey, normalizeDayKey } from "@/lib/dayKey";
import { emitCoachEvent, TODAY_STATE_CHANGED, WORKOUT_LOG_CHANGED } from "@/lib/coachEvents";

/** Kanoninen sarjaloki — V1-muoto; avain erotettu vanhasta pelkistä riveistä. */
const STORAGE_KEY = "workout_logs_v2";
const LEGACY_KEY = "workout_logs_v1";

export type WorkoutSetLogEntry = {
  exerciseId: string;
  exerciseName: string;
  dayKey: string;
  date: string;
  setIndex: number;
  weight: number;
  reps: number;
};

type LegacyRow = { date: string; weight: number; reps: number };
type StoreShape = Record<string, WorkoutSetLogEntry[]>;

function readRaw(): StoreShape {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return parsed as StoreShape;
  } catch {
    return {};
  }
}

function writeRaw(data: StoreShape): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* */
  }
}

function migrateLegacyV1IfNeeded(): void {
  if (typeof window === "undefined") return;
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return;
    const parsed = JSON.parse(legacy) as Record<string, unknown>;
    if (typeof parsed !== "object" || parsed === null) {
      localStorage.removeItem(LEGACY_KEY);
      return;
    }
    const current = readRaw();
    for (const [exId, rows] of Object.entries(parsed)) {
      if (!Array.isArray(rows)) continue;
      const list = [...(current[exId] ?? [])];
      rows.forEach((r, i) => {
        const row = r as LegacyRow;
        if (!row?.date || !Number.isFinite(row.weight)) return;
        list.push({
          exerciseId: exId,
          exerciseName: "",
          dayKey: getDayKey(new Date(row.date)),
          date: row.date,
          setIndex: i,
          weight: row.weight,
          reps: Math.round(Number(row.reps)),
        });
      });
      current[exId] = list;
    }
    writeRaw(current);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* */
  }
}

function readAll(): StoreShape {
  migrateLegacyV1IfNeeded();
  return readRaw();
}

/**
 * Tallenna yksi kirjattu sarja (set-taso).
 */
export function saveSetLog(entry: Omit<WorkoutSetLogEntry, "dayKey"> & { dayKey?: string }): void {
  const id = entry.exerciseId.trim();
  if (!id || typeof window === "undefined") return;
  if (!Number.isFinite(entry.weight) || !Number.isFinite(entry.reps)) return;

  const dayKey = entry.dayKey ?? getTodayDayKey();
  const row: WorkoutSetLogEntry = {
    exerciseId: id,
    exerciseName: entry.exerciseName.trim() || "—",
    dayKey: normalizeDayKey(dayKey),
    date: entry.date,
    setIndex: entry.setIndex,
    weight: entry.weight,
    reps: Math.round(entry.reps),
  };

  const all = readAll();
  const prev = Array.isArray(all[id]) ? all[id] : [];
  all[id] = [...prev, row];
  writeRaw(all);
  emitCoachEvent(WORKOUT_LOG_CHANGED);
  emitCoachEvent(TODAY_STATE_CHANGED, { kind: "workout_set" });
}

/**
 * Palauttaa kaikki kirjaukset liikkeelle, uusin ensin.
 */
export function getExerciseLogs(exerciseId: string): WorkoutSetLogEntry[] {
  const id = exerciseId.trim();
  if (!id) return [];
  const all = readAll();
  const list = all[id];
  if (!Array.isArray(list)) return [];
  return [...list]
    .map((e) => ({
      ...e,
      dayKey: e.dayKey ? normalizeDayKey(e.dayKey) : getDayKey(new Date(e.date)),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Viimeisimmät merkinnät (oletus 10), uusin ensin. */
export function getLatestExerciseLogs(
  exerciseId: string,
  limit = 10,
): WorkoutSetLogEntry[] {
  const n = Math.max(1, Math.min(100, limit));
  return getExerciseLogs(exerciseId).slice(0, n);
}

/** Onko tälle kalenteripäivälle tallennettu yhtään sarjaa (mikä tahansa liike). */
export function hasSetLogsForDay(dayKey: string): boolean {
  const dk = normalizeDayKey(dayKey);
  const all = readAll();
  for (const list of Object.values(all)) {
    if (!Array.isArray(list)) continue;
    for (const e of list) {
      if (normalizeDayKey(e.dayKey ?? getDayKey(new Date(e.date))) === dk) {
        return true;
      }
    }
  }
  return false;
}
