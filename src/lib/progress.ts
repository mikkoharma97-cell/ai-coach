/**
 * Progress view — aggregates local logs + profile (weight curve only when enough weigh-ins).
 */
import { calendarDayKey } from "@/lib/dateKeys";
import { loadFoodLog } from "@/lib/foodStorage";
import { calorieTargetForUser, macrosFromBodyWeight } from "@/lib/nutrition";
import { buildDayRecordMap } from "@/lib/streaks";
import { getWeeklyPatternFromProfile } from "@/lib/packageGuidance";
import { getMondayBasedIndex } from "@/lib/plan";
import type { OnboardingAnswers } from "@/types/coach";
import type { ExerciseProgressionState } from "@/types/pro";
import type { MessageKey } from "@/lib/i18n";
import type { StreakSummary } from "@/lib/streaks";
import { loadProWorkspace } from "@/lib/proWorkspace";

const WEIGHT_SERIES_KEY = "ai-coach-weight-series-v1";

/** Kun painodata päivittyy — Progress-näkymä voi päivittää käyrän */
export const WEIGHT_LOG_CHANGED = "coach-weight-log-changed";

/**
 * Lisää tai korvaa tämän päivän painomerkinnän (kg). Max ~120 merkintää.
 */
export function appendWeightLogEntry(kg: number, date: Date = new Date()): void {
  if (typeof window === "undefined") return;
  if (!Number.isFinite(kg) || kg < 30 || kg > 250) return;
  const dateKey = calendarDayKey(date);
  try {
    const s = localStorage.getItem(WEIGHT_SERIES_KEY);
    const arr = (s ? JSON.parse(s) : []) as { dateKey: string; kg: number }[];
    const base = Array.isArray(arr) ? arr : [];
    const next = [
      ...base.filter((x) => x?.dateKey !== dateKey),
      { dateKey, kg: Math.round(kg * 10) / 10 },
    ];
    next.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    localStorage.setItem(WEIGHT_SERIES_KEY, JSON.stringify(next.slice(-120)));
    window.dispatchEvent(new Event(WEIGHT_LOG_CHANGED));
  } catch {
    /* ignore */
  }
}

export type TrendDir = "up" | "down" | "flat";

export type ChartPoint = { dateKey: string; value: number };

export function linearTrendDirection(values: number[]): TrendDir {
  const v = values.filter((x) => Number.isFinite(x));
  if (v.length < 2) return "flat";
  const first = v[0]!;
  const last = v[v.length - 1]!;
  const delta = last - first;
  const tol = Math.max(0.15 * Math.abs(first), 0.2);
  if (delta > tol) return "up";
  if (delta < -tol) return "down";
  return "flat";
}

export type WeightSeriesResult = {
  points: ChartPoint[];
  synthetic: boolean;
};

/** JSON array in localStorage: `{ dateKey, kg }[]`; vähintään kaksi pistettä ikkunassa → käyrä. */
export function loadWeightSeries(
  weeks: 3 | 4 | 6 | 12,
  answers: OnboardingAnswers | null,
): WeightSeriesResult {
  const days = weeks * 7;
  const raw: { dateKey: string; kg: number }[] = [];
  if (typeof window !== "undefined") {
    try {
      const s = localStorage.getItem(WEIGHT_SERIES_KEY);
      if (s) {
        const p = JSON.parse(s) as { dateKey: string; kg: number }[];
        if (Array.isArray(p)) raw.push(...p);
      }
    } catch {
      /* ignore */
    }
  }

  const ref = new Date();
  ref.setHours(12, 0, 0, 0);
  const cutoff = new Date(ref);
  cutoff.setDate(cutoff.getDate() - days);

  const filtered = raw
    .filter((x) => x?.dateKey && Number.isFinite(x.kg))
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  const inWindow = filtered.filter((x) => {
    const [y, m, d] = x.dateKey.split("-").map(Number);
    const dt = new Date(y!, (m ?? 1) - 1, d ?? 1);
    return dt >= cutoff && dt <= ref;
  });

  if (inWindow.length >= 2) {
    return {
      points: inWindow.map((x) => ({ dateKey: x.dateKey, value: x.kg })),
      synthetic: false,
    };
  }

  return { points: [], synthetic: true };
}

export type MacroDay = {
  dateKey: string;
  kcal: number;
  proteinModelG: number;
};

export function loadMacroDays(
  answers: OnboardingAnswers,
  referenceDate: Date,
  dayCount: number,
): MacroDay[] {
  const out: MacroDay[] = [];
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const items = loadFoodLog(d);
    const kcal = items.reduce((s, x) => s + (x.kcal || 0), 0);
    const proteinModelG =
      kcal > 0 ? macrosFromBodyWeight(answers, kcal).proteinG : 0;
    out.push({ dateKey: calendarDayKey(d), kcal: kcal > 0 ? kcal : 0, proteinModelG });
  }
  return out;
}

export function macroAverages(days: MacroDay[], answers: OnboardingAnswers) {
  const logged = days.filter((d) => d.kcal > 0);
  if (logged.length === 0) {
    const t = calorieTargetForUser(answers);
    return {
      avgKcal: t,
      avgProteinG: macrosFromBodyWeight(answers, t).proteinG,
      loggedDays: 0,
    };
  }
  const sumK = logged.reduce((s, d) => s + d.kcal, 0);
  const sumP = logged.reduce(
    (s, d) => s + macrosFromBodyWeight(answers, d.kcal).proteinG,
    0,
  );
  return {
    avgKcal: Math.round(sumK / logged.length),
    avgProteinG: Math.round(sumP / logged.length),
    loggedDays: logged.length,
  };
}

/** Coefficient of variation of non-zero kcal days — low = stable rhythm. */
export function macroRhythmStable(days: MacroDay[], threshold = 0.14): boolean {
  const vals = days.map((d) => d.kcal).filter((k) => k > 0);
  if (vals.length < 4) return true;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  if (mean <= 0) return true;
  const varc =
    vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
  const cv = Math.sqrt(varc) / mean;
  return cv < threshold;
}

export type StrengthRow = {
  exerciseId: string;
  name: string;
  sessions: { label: string; load?: number; reps?: number }[];
  trend: TrendDir;
};

function trendFromLoads(loads: number[]): TrendDir {
  const finite = loads.filter((x) => Number.isFinite(x));
  return linearTrendDirection(finite);
}

/** Primary lifts: compounds from Pro program when set up; otherwise empty. */
export function buildStrengthRows(_locale: "fi" | "en"): StrengthRow[] {
  const ws = loadProWorkspace();
  const program = ws.trainingProgram;

  const rows: StrengthRow[] = [];
  if (program) {
    let added = 0;
    for (const day of program.days) {
      if (added >= 3) break;
      const ex = day.exercises[0];
      if (!ex) continue;
      const st: ExerciseProgressionState | undefined =
        ws.exerciseProgress[ex.id];
      const sessions: { label: string; load?: number; reps?: number }[] = [];
      if (st?.lastSession) {
        sessions.push({
          label: st.lastSession.dateKey,
          load: st.lastSession.load,
          reps: st.lastSession.reps,
        });
      }
      while (sessions.length < 3) sessions.push({ label: "—" });
      const loads = sessions.map((s) => s.load).filter((x): x is number => typeof x === "number");
      rows.push({
        exerciseId: ex.id,
        name: ex.name,
        sessions: sessions.slice(0, 3),
        trend: loads.length >= 2 ? trendFromLoads(loads) : "flat",
      });
      added++;
    }
  }

  return rows.slice(0, 3);
}

export type ConsistencySnapshot = {
  windowDays: number;
  plannedTrainingDays: number;
  completedTrainingDays: number;
  pct: number;
};

export function computeConsistency(
  answers: OnboardingAnswers,
  referenceDate: Date,
  windowDays = 14,
): ConsistencySnapshot {
  const train = getWeeklyPatternFromProfile(answers);
  const records = buildDayRecordMap(referenceDate, windowDays + 1);
  let planned = 0;
  let completed = 0;
  for (let i = 0; i < windowDays; i++) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const idx = getMondayBasedIndex(d);
    if (!train.has(idx)) continue;
    planned++;
    const rec = records.get(calendarDayKey(d));
    if (rec?.markedDone && !rec?.skippedWorkout) completed++;
  }
  const pct = planned > 0 ? Math.round((completed / planned) * 100) : 0;
  return {
    windowDays,
    plannedTrainingDays: planned,
    completedTrainingDays: completed,
    pct,
  };
}

/** Placeholder sleep hours for chart when no wearable (narrow band). */
/** Weeks between first and last weight sample (floor). */
export function weightSeriesWeekSpan(points: ChartPoint[]): number {
  if (points.length < 2) return 0;
  const first = points[0]!.dateKey;
  const last = points[points.length - 1]!.dateKey;
  const [y0, m0, d0] = first.split("-").map(Number);
  const [y1, m1, d1] = last.split("-").map(Number);
  const t0 = new Date(y0!, (m0 ?? 1) - 1, d0 ?? 1).getTime();
  const t1 = new Date(y1!, (m1 ?? 1) - 1, d1 ?? 1).getTime();
  const days = Math.abs(t1 - t0) / 86400000;
  return Math.floor(days / 7);
}

export type ProgressHeroInsight = {
  headlineKey: MessageKey;
  proofKey: MessageKey;
  proofParams: Record<string, string | number>;
};

/** One headline + one proof line for Progress hero — combines strength, weight, macros, consistency. */
export function computeProgressHeroInsight(
  answers: OnboardingAnswers,
  streaks: StreakSummary,
  strengthRows: StrengthRow[],
  weightResult: WeightSeriesResult,
  macroDays7: MacroDay[],
  consistency: ConsistencySnapshot,
): ProgressHeroInsight {
  const stable7 = macroRhythmStable(macroDays7);
  const strengthUp = strengthRows.filter((r) => r.trend === "up").length;
  const strengthDown = strengthRows.filter((r) => r.trend === "down").length;
  const wVals = weightResult.points.map((p) => p.value);
  const wDir = linearTrendDirection(wVals);

  function weightAlignedWithGoal(): boolean {
    if (wVals.length < 2) return true;
    if (answers.goal === "lose_weight") {
      return wDir === "down" || wDir === "flat";
    }
    if (answers.goal === "build_muscle") {
      return wDir === "up" || wDir === "flat";
    }
    return wDir === "flat" || wDir === "up";
  }

  let headlineKey: MessageKey = "progress.heroDirectionGood";
  if (strengthUp >= 2 && !stable7) {
    headlineKey = "progress.heroStrengthUpLockFood";
  } else if (streaks.combined >= 5 && !stable7) {
    headlineKey = "progress.heroRhythmRecoveryGap";
  } else if (
    weightAlignedWithGoal() &&
    consistency.pct >= 58 &&
    !weightResult.synthetic &&
    wVals.length >= 2
  ) {
    headlineKey = "progress.heroWeightFineRhythm";
  } else if (strengthUp >= 1 && !stable7) {
    headlineKey = "progress.heroStrengthUpLockFood";
  } else if (consistency.pct >= 52 && stable7 && strengthDown < 2) {
    headlineKey = "progress.heroDirectionGood";
  }

  const logged7 = macroDays7.filter((d) => d.kcal > 0).length;
  const wkSpan = weightSeriesWeekSpan(weightResult.points);

  let proofKey: MessageKey = "progress.heroProofStreak";
  let proofParams: Record<string, string | number> = {
    n: Math.max(1, streaks.combined),
  };

  if (streaks.workout >= 2) {
    proofKey = "progress.heroProofWorkouts";
    proofParams = { n: streaks.workout };
  } else if (logged7 >= 3) {
    proofKey = "progress.heroProofMacroDays";
    proofParams = { logged: logged7, total: 7 };
  } else if (!weightResult.synthetic && wkSpan >= 3) {
    proofKey = "progress.heroProofWeightWeeks";
    proofParams = { n: Math.min(12, wkSpan) };
  } else if (streaks.combined >= 1) {
    proofKey = "progress.heroProofStreak";
    proofParams = { n: streaks.combined };
  } else {
    proofKey = "progress.heroProofConsistency";
    proofParams = {
      pct: consistency.pct,
      done: consistency.completedTrainingDays,
      plan: consistency.plannedTrainingDays,
    };
  }

  return { headlineKey, proofKey, proofParams };
}

export function buildRecoverySleepSeries(
  referenceDate: Date,
  days: number,
  avgHours: number | null,
): ChartPoint[] {
  const base = avgHours ?? 7.2;
  const out: ChartPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const jitter = Math.sin(i * 1.1) * 0.12;
    out.push({
      dateKey: calendarDayKey(d),
      value: Math.round((base + jitter) * 10) / 10,
    });
  }
  return out;
}
