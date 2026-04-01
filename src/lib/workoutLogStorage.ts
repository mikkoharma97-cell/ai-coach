/**
 * Treenilokien tallennus — localStorage, append-only sessiot.
 */
import type {
  WorkoutLogExercise,
  WorkoutSessionCompletionType,
  WorkoutSessionLog,
  WorkoutSessionMode,
} from "@/types/adaptiveCoaching";

/** Yhteensopiva WorkoutView-rivien kanssa (completed setissä) */
export type SerializableExercise = {
  id: string;
  name: string;
  sets: {
    reps: string;
    weight?: string;
    rpe?: string;
    completed?: boolean;
  }[];
};

const KEY = "ai-coach-workout-sessions-v1";
const MAX_SESSIONS = 40;

export const WORKOUT_LOG_CHANGED = "coach-workout-log-changed";

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function parseNum(s: string | undefined): number | null {
  if (!s || !s.trim()) return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function parseReps(s: string | undefined): number | null {
  if (!s || !s.trim()) return null;
  const m = s.match(/(\d+)/);
  if (!m) return null;
  const n = parseInt(m[1]!, 10);
  return Number.isFinite(n) ? n : null;
}

export type WorkoutSessionSerializeMeta = {
  sessionMode: WorkoutSessionMode;
  usedExerciseSwaps: boolean;
  completionType: WorkoutSessionCompletionType;
  volumeModifier: number;
};

/**
 * Muuntaa WorkoutView-rivit tallennettavaksi sessioksi (vain merkityt setit).
 */
export function serializeWorkoutSession(
  exercises: SerializableExercise[],
  referenceDate = new Date(),
  meta?: WorkoutSessionSerializeMeta,
): WorkoutSessionLog {
  const outEx: WorkoutLogExercise[] = [];
  for (const ex of exercises) {
    const sets = ex.sets
      .map((row, setIndex) => {
        const weightKg = parseNum(row.weight);
        const reps = parseReps(row.reps);
        const rpe = parseNum(row.rpe);
        return {
          setIndex,
          weightKg,
          reps,
          rpe,
          completed: Boolean((row as { completed?: boolean }).completed),
        };
      })
      .filter((s) => s.completed);

    if (sets.length === 0) continue;
    outEx.push({
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets,
    });
  }

  return {
    id: newId(),
    completedAt: referenceDate.toISOString(),
    dayKey: dayKey(referenceDate),
    exercises: outEx,
    ...(meta
      ? {
          sessionMode: meta.sessionMode,
          usedExerciseSwaps: meta.usedExerciseSwaps,
          completionType: meta.completionType,
          volumeModifier: meta.volumeModifier,
        }
      : {}),
  };
}

export function loadWorkoutSessions(): WorkoutSessionLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WorkoutSessionLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWorkoutSession(log: WorkoutSessionLog): void {
  if (typeof window === "undefined") return;
  if (log.exercises.length === 0) return;
  try {
    const prev = loadWorkoutSessions();
    const next = [log, ...prev].slice(0, MAX_SESSIONS);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(WORKOUT_LOG_CHANGED));
  } catch {
    /* ignore */
  }
}

export function clearWorkoutSessions(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
