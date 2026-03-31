/**
 * Suoritusanalyysi — trendi, plateau, väsymys (heuristiikka).
 */
import type {
  ExercisePerformanceMemory,
  FatigueLevel,
  ProgressionTrend,
  UserPerformanceState,
  WorkoutSessionLog,
} from "@/types/adaptiveCoaching";

function sessionVolume(ex: WorkoutSessionLog["exercises"][0]): number {
  let v = 0;
  for (const s of ex.sets) {
    const w = s.weightKg ?? 0;
    const r = s.reps ?? 0;
    v += w * r;
  }
  return v;
}

function sessionAvgRpe(ex: WorkoutSessionLog["exercises"][0]): number | null {
  const rpes = ex.sets.map((s) => s.rpe).filter((x): x is number => x != null);
  if (rpes.length === 0) return null;
  return rpes.reduce((a, b) => a + b, 0) / rpes.length;
}

/** Viimeisimmät sessiot jotka sisältävät liikkeen */
export function sessionsForExercise(
  exerciseId: string,
  sessions: WorkoutSessionLog[],
  limit = 6,
): WorkoutSessionLog[] {
  const out: WorkoutSessionLog[] = [];
  for (const ses of sessions) {
    const ex = ses.exercises.find((e) => e.exerciseId === exerciseId);
    if (ex && ex.sets.length > 0) {
      out.push({
        ...ses,
        exercises: [ex],
      });
    }
    if (out.length >= limit) break;
  }
  return out;
}

/** volumes[0] = uusin sessio */
export function trendForVolumes(volumes: number[]): ProgressionTrend {
  if (volumes.length < 2) return "unknown";
  const newest = volumes[0]!;
  const older = volumes[1]!;
  if (volumes.length >= 3) {
    const oldest = volumes[2]!;
    const near = (x: number, y: number) =>
      Math.abs(x - y) / Math.max(1, Math.max(x, y)) < 0.06;
    if (near(newest, older) && near(older, oldest)) return "plateau";
  }
  if (newest > older * 1.03) return "progressing";
  if (newest < older * 0.9) return "regressing";
  return "plateau";
}

export function buildExerciseMemory(
  exerciseId: string,
  sessions: WorkoutSessionLog[],
): ExercisePerformanceMemory {
  const relevant = sessionsForExercise(exerciseId, sessions, 8);
  const volumes: number[] = [];
  let bestW: number | null = null;
  let bestR: number | null = null;
  const lastSessions: ExercisePerformanceMemory["lastSessions"] = [];

  for (const ses of relevant) {
    const ex = ses.exercises[0]!;
    const vol = sessionVolume(ex);
    volumes.push(vol);
    for (const s of ex.sets) {
      if (s.weightKg != null && (bestW == null || s.weightKg > bestW)) {
        bestW = s.weightKg;
      }
      if (s.reps != null && (bestR == null || s.reps > bestR)) {
        bestR = s.reps;
      }
    }
    lastSessions.push({
      completedAt: ses.completedAt,
      estimatedVolume: vol,
      avgRpe: sessionAvgRpe(ex),
    });
  }

  const trend = trendForVolumes(volumes);

  return {
    exerciseId,
    bestWeightKg: bestW,
    bestReps: bestR,
    lastSessions,
    trend,
  };
}

export function buildUserPerformanceState(
  sessions: WorkoutSessionLog[],
  daysPerWeek: number,
): UserPerformanceState {
  const exerciseIds = new Set<string>();
  for (const s of sessions) {
    for (const e of s.exercises) {
      exerciseIds.add(e.exerciseId);
    }
  }

  const exerciseMemory: Record<string, ExercisePerformanceMemory> = {};
  for (const id of exerciseIds) {
    exerciseMemory[id] = buildExerciseMemory(id, sessions);
  }

  let progressing = 0;
  let plateau = 0;
  let regressing = 0;
  for (const m of Object.values(exerciseMemory)) {
    if (m.trend === "progressing") progressing++;
    else if (m.trend === "plateau") plateau++;
    else if (m.trend === "regressing") regressing++;
  }

  let progressionTrend: ProgressionTrend = "unknown";
  if (progressing > regressing && progressing >= plateau) {
    progressionTrend = "progressing";
  } else if (regressing > progressing) {
    progressionTrend = "regressing";
  } else if (plateau >= progressing && plateau >= regressing && plateau > 0) {
    progressionTrend = "plateau";
  }

  /** Yksinkertainen väsymys: regressio + nouseva RPE */
  let fatigueLevel: FatigueLevel = "low";
  if (sessions.length >= 3) {
    const recent = sessions.slice(0, 3);
    const older = sessions.slice(3, 6);
    let volDrop = 0;
    let rpeUp = 0;
    for (const id of exerciseIds) {
      const rv = recent
        .map((s) => s.exercises.find((e) => e.exerciseId === id))
        .filter(Boolean)
        .map((ex) => sessionVolume(ex!));
      const ov = older
        .map((s) => s.exercises.find((e) => e.exerciseId === id))
        .filter(Boolean)
        .map((ex) => sessionVolume(ex!));
      if (rv.length && ov.length) {
        const rAvg = rv.reduce((a, b) => a + b, 0) / rv.length;
        const oAvg = ov.reduce((a, b) => a + b, 0) / ov.length;
        if (oAvg > 0 && rAvg < oAvg * 0.88) volDrop++;
      }
      const rr = recent
        .map((s) => {
          const ex = s.exercises.find((e) => e.exerciseId === id);
          return ex ? sessionAvgRpe(ex) : null;
        })
        .filter((x): x is number => x != null);
      const or = older
        .map((s) => {
          const ex = s.exercises.find((e) => e.exerciseId === id);
          return ex ? sessionAvgRpe(ex) : null;
        })
        .filter((x): x is number => x != null);
      if (rr.length && or.length) {
        const rA = rr.reduce((a, b) => a + b, 0) / rr.length;
        const oA = or.reduce((a, b) => a + b, 0) / or.length;
        if (rA > oA + 0.8) rpeUp++;
      }
    }
    if (volDrop >= 2 && rpeUp >= 1) fatigueLevel = "high";
    else if (volDrop >= 1 || rpeUp >= 2 || progressionTrend === "regressing") {
      fatigueLevel = "moderate";
    }
  }

  /** consistency: treenit / 14 pv vs odotettu */
  const expected = Math.max(2, Math.round((daysPerWeek / 7) * 14));
  const last14 = new Set(
    sessions.filter((s) => {
      const d = new Date(s.completedAt);
      const diff = (Date.now() - d.getTime()) / 86400000;
      return diff <= 14;
    }).map((s) => s.dayKey),
  ).size;
  const consistencyScore = Math.min(
    100,
    Math.round(expected > 0 ? (last14 / expected) * 100 : last14 * 14),
  );

  return {
    lastWorkouts: sessions.slice(0, 12),
    progressionTrend,
    fatigueLevel,
    consistencyScore,
    exerciseMemory,
  };
}
