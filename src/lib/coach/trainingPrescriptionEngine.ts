/**
 * Resepti-moottori V1 — liikekohtainen reps / kuorma / RPE / intensifierit.
 * Käyttää: exerciseClassification + intensifierRules + progression-sykli.
 */
import { classifyExercise, inferCompoundVsIsolation } from "@/lib/exerciseClassification";
import { resolveIntensifiers } from "@/lib/intensifierRules";
import type { ProgressionStyle } from "@/lib/training/progression";
import type { Exercise } from "@/types/exercise";
import type { Goal, Level } from "@/types/coach";
import type { IntensifierPolicyId } from "@/types/intensifierRules";
import type { Intensity1To10, Progression } from "@/types/progression";
import type { TrainingPrescription } from "@/types/trainingPrescription";

export type ExercisePrescription = {
  sets: number;
  repsLabelFi: string;
  repsLabelEn: string;
  effort: string;
  rest: string;
  prescriptionLineFi: string | null;
  prescriptionLineEn: string | null;
  loadBiasFi?: string;
  loadBiasEn?: string;
};

export function isDeloadWeek(week: number): boolean {
  const w = Number.isFinite(week) && week >= 1 ? Math.floor(week) : 1;
  return w > 0 && w % 4 === 0;
}

export function rotationBlockIndex(week: number): number {
  const w = Number.isFinite(week) && week >= 1 ? Math.floor(week) : 1;
  return Math.floor((w - 1) / 6) % 4;
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

function repRangeForClass(
  goal: Goal,
  cls: ReturnType<typeof classifyExercise>["trainingClass"],
  deload: boolean,
): { fi: string; en: string; min: number; max: number } {
  if (deload) return { fi: "8–12", en: "8–12", min: 8, max: 12 };
  switch (cls) {
    case "compound_strength":
      if (goal === "lose_weight") return { fi: "5–8", en: "5–8", min: 5, max: 8 };
      return { fi: "4–6", en: "4–6", min: 4, max: 6 };
    case "compound_hypertrophy":
      return { fi: "6–10", en: "6–10", min: 6, max: 10 };
    case "machine_hypertrophy":
      return { fi: "8–12", en: "8–12", min: 8, max: 12 };
    case "isolation":
      if (goal === "lose_weight") return { fi: "12–18", en: "12–18", min: 12, max: 18 };
      return { fi: "10–15", en: "10–15", min: 10, max: 15 };
    case "accessory":
      return { fi: "10–20", en: "10–20", min: 10, max: 20 };
    case "conditioning_finisher":
      return { fi: "12–20", en: "12–20", min: 12, max: 20 };
    case "skill_or_power":
      return { fi: "3–5", en: "3–5", min: 3, max: 5 };
    default:
      return { fi: "8–12", en: "8–12", min: 8, max: 12 };
  }
}

function loadBiasLabel(
  cls: ReturnType<typeof classifyExercise>["trainingClass"],
  deload: boolean,
): { fi: string; en: string } {
  if (deload) return { fi: "kevyt", en: "light" };
  if (cls === "compound_strength") return { fi: "raskas / tekniikka", en: "heavy / quality" };
  if (cls === "isolation" || cls === "accessory") {
    return { fi: "kohtalainen", en: "moderate" };
  }
  return { fi: "kohtuullinen", en: "moderate" };
}

function progressionRuleFromStyle(
  style: ProgressionStyle,
  deload: boolean,
): TrainingPrescription["progressionRule"] {
  if (deload) return "deload_wave";
  if (style === "double_progression") return "double_progression";
  if (style === "adaptive") return "volume_first";
  return "linear_load";
}

export function buildTrainingPrescription(
  ex: Exercise,
  ctx: {
    goal: Goal;
    week: number;
    level: Level;
    exerciseIndex: number;
    exerciseCount: number;
    baseProgression: Progression;
    progressionStyle: ProgressionStyle;
    intensifierPolicyId: IntensifierPolicyId;
  },
): TrainingPrescription {
  const meta = classifyExercise(ex);
  const deload = isDeloadWeek(ctx.week);
  const range = repRangeForClass(ctx.goal, meta.trainingClass, deload);
  let sets = ex.defaultSets ?? ctx.baseProgression.sets;
  if (deload) sets = Math.max(2, sets - 1);
  if (meta.trainingClass === "isolation" && !deload) sets = Math.min(4, sets);

  const rpe = rpeForProgression(ctx.baseProgression, deload, ctx.level);
  const effort = `RPE ${rpe}`;
  const pattern = inferCompoundVsIsolation(ex);
  const rest =
    pattern === "compound" && !deload ? "2–4 min" : deload ? "1.5–2 min" : "1–2 min";

  const int = resolveIntensifiers(meta, ctx.intensifierPolicyId, ctx.level);
  const allowDrop =
    int.allowed.includes("drop_set") &&
    !deload &&
    ctx.exerciseIndex === ctx.exerciseCount - 1;

  const lb = loadBiasLabel(meta.trainingClass, deload);
  const loadBias =
    lb.fi.includes("raskas") || lb.en === "heavy"
      ? "heavy"
      : lb.fi.includes("kevyt") || lb.en === "light"
        ? "light"
        : "moderate";

  const fi: string[] = [];
  const en: string[] = [];
  fi.push(`Kuorma: ${lb.fi}.`);
  en.push(`Load: ${lb.en}.`);

  if (deload) {
    fi.push("Deload-viikko: volyymi alas, sama tekniikka.");
    en.push("Deload week: lower volume, same technique.");
  }

  if (int.allowed.includes("failure_last_set") && ctx.level !== "beginner") {
    fi.push("Ei joka sarjaa loppuun — viimeinen voi olla tiukka.");
    en.push("Not every set to failure — the last can be hard.");
  } else if (ctx.level === "beginner") {
    fi.push("Pidä toistot hallittuina — jätä varaa.");
    en.push("Keep reps controlled — leave room in the tank.");
  }

  if (allowDrop) {
    fi.push("Viimeinen setti: pudotussarja vain jos turvallista.");
    en.push("Last set: drop only if it stays safe.");
  }

  if (int.allowed.includes("rest_pause") && meta.trainingClass === "isolation") {
    fi.push("Rest-pause mahdollinen viimeisessä sarjassa.");
    en.push("Rest-pause optional on the last set.");
  }

  const progressionRule = progressionRuleFromStyle(ctx.progressionStyle, deload);

  return {
    sets,
    repsLabelFi: range.fi,
    repsLabelEn: range.en,
    targetRepRange: { min: range.min, max: range.max },
    loadBias,
    effortLabelFi: `Tuntuma ${rpe}/10 (RPE)`,
    effortLabelEn: `Feel ${rpe}/10 (RPE)`,
    effortRpe: effort,
    rest,
    progressionStyle: ctx.progressionStyle,
    progressionRule,
    allowedIntensifiers: int.allowed,
    prescriptionLineFi: fi.join(" "),
    prescriptionLineEn: en.join(" "),
  };
}

/** Generaattorille yhteensopiva muoto (Workout / ProExercise). */
export function buildExercisePrescription(
  ex: Exercise,
  ctx: {
    goal: Goal;
    week: number;
    level: Level;
    exerciseIndex: number;
    exerciseCount: number;
    baseProgression: Progression;
    progressionStyle: ProgressionStyle;
    intensifierPolicyId: IntensifierPolicyId;
  },
): ExercisePrescription {
  const full = buildTrainingPrescription(ex, ctx);
  return {
    sets: full.sets,
    repsLabelFi: full.repsLabelFi,
    repsLabelEn: full.repsLabelEn,
    effort: full.effortRpe,
    rest: full.rest,
    prescriptionLineFi: full.prescriptionLineFi,
    prescriptionLineEn: full.prescriptionLineEn,
    loadBiasFi:
      full.loadBias === "heavy"
        ? "Raskas / laatu"
        : full.loadBias === "light"
          ? "Kevyt"
          : "Kohtuullinen",
    loadBiasEn:
      full.loadBias === "heavy"
        ? "Heavy / quality"
        : full.loadBias === "light"
          ? "Light"
          : "Moderate",
  };
}

export { inferCompoundVsIsolation as inferMovementPattern } from "@/lib/exerciseClassification";
