/**
 * HÄRMÄ4 — valmennuslogiikka: toistoalueet (voima / hypertrofia / kestävyys),
 * deload, pudotussarja vain eristyksissä (ei perus compoundeissa),
 * epäonnistuminen ei joka sarjassa.
 *
 * Polku: `generator.exerciseToProExercise` → tämä moduuli.
 */
import type { Exercise } from "@/types/exercise";
import type { Goal, Level } from "@/types/coach";
import type { Intensity1To10, Progression } from "@/types/progression";

const NO_DROP_SET_IDS = new Set<string>([
  "back_squat",
  "smith_squat",
  "rdl",
  "deadlift",
  "barbell_row",
]);

const COMPOUND_IDS = new Set<string>([
  "bench_press",
  "dumbbell_flat_press",
  "incline_db_press",
  "ohp",
  "dip",
  "pull_up",
  "lat_pulldown",
  "barbell_row",
  "dumbbell_row",
  "t_bar_row",
  "seated_cable_row",
  "close_grip_bench",
  "back_squat",
  "smith_squat",
  "hack_squat",
  "leg_press",
  "lunge",
  "bulgarian_split_squat",
  "rdl",
  "hip_thrust",
  "deadlift",
]);

export function inferMovementPattern(ex: Exercise): "compound" | "isolation" {
  if (ex.category === "conditioning") return "compound";
  return COMPOUND_IDS.has(ex.id) ? "compound" : "isolation";
}

export function isDeloadWeek(week: number): boolean {
  const w = Number.isFinite(week) && week >= 1 ? Math.floor(week) : 1;
  return w > 0 && w % 4 === 0;
}

/** 6 vk välein vaihtuva seed-komponentti (4–8 vk rotaatio). */
export function rotationBlockIndex(week: number): number {
  const w = Number.isFinite(week) && week >= 1 ? Math.floor(week) : 1;
  return Math.floor((w - 1) / 6) % 4;
}

export type ExercisePrescription = {
  sets: number;
  repsLabelFi: string;
  repsLabelEn: string;
  effort: string;
  rest: string;
  prescriptionLineFi: string | null;
  prescriptionLineEn: string | null;
};

function repRangeForGoalAndPattern(
  goal: Goal,
  pattern: "compound" | "isolation",
  deload: boolean,
): { fi: string; en: string } {
  if (deload) return { fi: "8–12", en: "8–12" };
  if (pattern === "compound") {
    if (goal === "build_muscle") return { fi: "6–10", en: "6–10" };
    if (goal === "lose_weight") return { fi: "8–12", en: "8–12" };
    return { fi: "8–12", en: "8–12" };
  }
  if (goal === "build_muscle") return { fi: "10–15", en: "10–15" };
  if (goal === "lose_weight") return { fi: "12–18", en: "12–18" };
  return { fi: "12–20", en: "12–20" };
}

function clampRpe(n: number): Intensity1To10 {
  const x = Math.round(n);
  return Math.min(10, Math.max(1, x)) as Intensity1To10;
}

function rpeForProgression(
  p: Progression,
  deload: boolean,
  level: Level,
): Intensity1To10 {
  let v = p.intensity;
  if (deload) v = clampRpe(v - 2);
  if (level === "beginner") v = clampRpe(v - 1);
  if (level === "advanced" && !deload) v = clampRpe(v + 1);
  return v;
}

export function buildExercisePrescription(
  ex: Exercise,
  ctx: {
    goal: Goal;
    week: number;
    level: Level;
    exerciseIndex: number;
    exerciseCount: number;
    baseProgression: Progression;
  },
): ExercisePrescription {
  const pattern = inferMovementPattern(ex);
  const deload = isDeloadWeek(ctx.week);
  const range = repRangeForGoalAndPattern(ctx.goal, pattern, deload);

  let sets = ex.defaultSets ?? ctx.baseProgression.sets;
  if (deload) sets = Math.max(2, sets - 1);
  if (pattern === "isolation" && !deload) sets = Math.min(4, sets);

  const rpe = rpeForProgression(ctx.baseProgression, deload, ctx.level);
  const effort = `RPE ${rpe}`;
  const rest =
    pattern === "compound" && !deload ? "2–4 min" : deload ? "1.5–2 min" : "1–2 min";

  const fi: string[] = [];
  const en: string[] = [];

  if (deload) {
    fi.push("Deload-viikko: kevyempi volyymi, tekniikka edellä.");
    en.push("Deload week: lower volume, technique first.");
  }

  if (pattern === "compound") {
    fi.push(
      "Ei joka sarjaa epäonnistumiseen — viimeinen setti saa olla tiukka.",
    );
    en.push(
      "Don’t grind every set to failure — only the last set can be very hard.",
    );
  } else {
    fi.push("Eristys: kontrolloitu tempo.");
    en.push("Isolation: controlled tempo.");
  }

  const allowDrop =
    pattern === "isolation" &&
    !deload &&
    !NO_DROP_SET_IDS.has(ex.id) &&
    ctx.exerciseIndex === ctx.exerciseCount - 1;

  if (allowDrop) {
    fi.push(
      "Viimeinen setti: pudotussarja kevyempään (vain tässä liikkeessä).",
    );
    en.push("Last set: drop set to lighter load (this exercise only).");
  }

  return {
    sets,
    repsLabelFi: range.fi,
    repsLabelEn: range.en,
    effort,
    rest,
    prescriptionLineFi: fi.length ? fi.join(" ") : null,
    prescriptionLineEn: en.length ? en.join(" ") : null,
  };
}
