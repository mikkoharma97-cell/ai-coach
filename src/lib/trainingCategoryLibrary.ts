/**
 * Treenirunko-kirjasto — kategoriajako viikkoon (V1).
 * Täydentää blueprintia kun tarvitaan selkeä aloittelija/keskitaso -malli.
 */
import type { Goal, Level } from "@/types/coach";
import type { ExerciseCategory } from "@/types/exercise";

/** Aloittelija: koko keho 3× — jalka (squat/hinge), työntö, veto, core vuorotellen */
const BEGINNER_DAYS: ExerciseCategory[][] = [
  ["legs", "push", "core"],
  ["pull", "legs", "core"],
  ["push", "pull", "legs"],
];

/** Keskitaso: upper / lower 4 päivää */
const INTERMEDIATE_DAYS: ExerciseCategory[][] = [
  ["push", "pull", "core"],
  ["legs", "legs"],
  ["pull", "push", "core"],
  ["legs", "core"],
];

/** Edistynyt: hypertrophy-tyylinen 5–6 päivän kierto */
const ADVANCED_DAYS: ExerciseCategory[][] = [
  ["push", "push", "core"],
  ["pull", "pull"],
  ["legs", "legs", "core"],
  ["push", "pull", "core"],
  ["legs", "push"],
  ["pull", "legs"],
];

export function libraryCategoriesForSlot(
  level: Level,
  goal: Goal,
  slotIndex: number,
): ExerciseCategory[] | null {
  const mod =
    level === "beginner"
      ? BEGINNER_DAYS
      : level === "intermediate"
        ? INTERMEDIATE_DAYS
        : ADVANCED_DAYS;
  if (mod.length === 0) return null;
  const idx = slotIndex % mod.length;
  const cats = [...mod[idx]!];
  if (goal === "lose_weight" && level === "beginner") {
    return ["legs", "push", "core"];
  }
  return cats.length >= 2 ? cats : null;
}

/** 1) blueprint jos määritelty, 2) ohjelmakirjasto, 3) generaattorin fallback */
export function getLibraryCategoriesOrFallback(
  level: Level,
  goal: Goal,
  trainingSlotIndex: number,
  blueprintCategories: ExerciseCategory[] | undefined,
  fallback: ExerciseCategory[],
): ExerciseCategory[] {
  if (blueprintCategories && blueprintCategories.length >= 2) {
    return blueprintCategories;
  }
  const lib = libraryCategoriesForSlot(level, goal, trainingSlotIndex);
  if (lib && lib.length >= 2) return lib;
  return fallback;
}
