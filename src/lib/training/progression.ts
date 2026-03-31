import type { Level } from "@/types/coach";
import type { Intensity1To10, Progression } from "@/types/progression";

/** Blueprintin progressiotyyli — sama sykli, eri etenemisnopeus */
export type ProgressionStyle =
  | "linear"
  | "double_progression"
  | "adaptive";

/**
 * Viikkopohjainen progressio (4 viikon sykli, toistuu).
 * Kuten esimerkkitaulukko: setit nousevat, toistot tiukentuvat, intensiteetti nousee.
 */
const CYCLE: Array<Pick<Progression, "sets" | "reps" | "intensity">> = [
  { sets: 3, reps: 12, intensity: 7 },
  { sets: 3, reps: 10, intensity: 8 },
  { sets: 4, reps: 8, intensity: 8 },
  { sets: 4, reps: 6, intensity: 9 },
];

function cycleIndexForWeek(
  week: number,
  style: ProgressionStyle | undefined,
): number {
  const w = Number.isFinite(week) && week >= 1 ? Math.floor(week) : 1;
  const linear = (w - 1) % CYCLE.length;
  if (style === "adaptive") {
    return Math.floor((w - 1) / 3) % CYCLE.length;
  }
  if (style === "double_progression") {
    return Math.floor((w - 1) / 2) % CYCLE.length;
  }
  return linear;
}

export function generateProgression(
  week: number,
  opts?: {
    level?: Level;
    intensityDelta?: number;
    progressionStyle?: ProgressionStyle;
  },
): Progression {
  const w = Number.isFinite(week) && week >= 1 ? Math.floor(week) : 1;
  const idx = cycleIndexForWeek(w, opts?.progressionStyle);
  const row = CYCLE[idx];
  let sets = row.sets;
  let extraDelta = opts?.intensityDelta ?? 0;
  if (opts?.progressionStyle === "double_progression") {
    extraDelta -= 0.5;
  }
  let intensity = row.intensity + extraDelta;
  if (opts?.level === "beginner") {
    intensity = Math.max(1, intensity - 1);
    sets = Math.max(2, sets - 1);
  } else if (opts?.level === "advanced") {
    intensity = Math.min(10, intensity + 1);
  }
  return {
    week: w,
    sets,
    reps: row.reps,
    intensity: intensity as Intensity1To10,
  };
}

export function repsRangeLabel(p: Progression): string {
  const r = p.reps;
  const low = Math.max(4, r - 2);
  const high = r + 2;
  return `${low}–${high}`;
}
