/**
 * Ready packages — app-native presets (engine + UI labels).
 *
 * Treenikuormitus V1:
 * - `steady_start` + matala daysPerWeek → aloittelijalle / paluuseen (ei “advanced split” ilman tasoa).
 * - `muscle_rhythm` / `performance_block` → enemmän päiviä ja hypertrofia-/suorituspainotus.
 * - `light_cut` → rasvanpoltto, ei samoja volyymeja kuin performance-blokissa.
 * Konkreettiset liikkeet ja split tulevat `programBlueprint` + `generateWorkoutDay` — tasovahti
 * `exerciseAllowedForTrainingLevel` estää advanced-liikkeet beginnerille.
 */
import type {
  DaysPerWeek,
  EatingHabits,
  FlexibilityPreference,
  Goal,
  Level,
  MealStructurePreference,
  OnboardingAnswers,
  ProgramPackageId,
} from "@/types/coach";
import { defaultTrackForPackage } from "@/lib/programTracks";

export type ProgramPackage = {
  id: ProgramPackageId;
  nameFi: string;
  nameEn: string;
  shortFi: string;
  shortEn: string;
  summaryFi: string;
  summaryEn: string;
  trainingDays: DaysPerWeek;
  mealCount: number;
  trainingStyle: "balanced" | "hypertrophy" | "fatloss" | "performance";
  mealStyle: "easy" | "warm" | "high_protein" | "performance";
  activityBase: number;
  cardioMode: "none" | "light" | "moderate";
  workoutSupport: boolean;
  planBias: "steady" | "muscle" | "cut" | "performance";
};

export const DEFAULT_PACKAGE_ID: ProgramPackageId = "steady_start";

const LEGACY_IDS: Record<string, ProgramPackageId> = {
  aurora_steady: "steady_start",
  forge_pulse: "muscle_rhythm",
  ember_soft_cut: "light_cut",
  apex_block: "performance_block",
};

export const PROGRAM_PACKAGES: ProgramPackage[] = [
  {
    id: "steady_start",
    nameFi: "Vakaa aloitus",
    nameEn: "Steady start",
    shortFi: "Aloittelijalle ja paluuseen treeniin",
    shortEn: "For beginners and returning to training",
    summaryFi:
      "Rakennetaan sinulle selkeä viikko ilman että aloitat tyhjästä.",
    summaryEn: "Build a clear week without starting from zero.",
    trainingDays: 3,
    mealCount: 3,
    trainingStyle: "balanced",
    mealStyle: "easy",
    activityBase: 8000,
    cardioMode: "light",
    workoutSupport: false,
    planBias: "steady",
  },
  {
    id: "muscle_rhythm",
    nameFi: "Voima & rytmi",
    nameEn: "Muscle rhythm",
    shortFi: "Lihaskasvuun ja säännölliseen nostoon",
    shortEn: "For muscle gain and consistent lifting",
    summaryFi:
      "Rakennettu lihaskasvun rytmiin — viikko pysyy kasassa.",
    summaryEn: "Built for muscle rhythm — the whole week stays together.",
    trainingDays: 4,
    mealCount: 4,
    trainingStyle: "hypertrophy",
    mealStyle: "warm",
    activityBase: 9000,
    cardioMode: "light",
    workoutSupport: true,
    planBias: "muscle",
  },
  {
    id: "light_cut",
    nameFi: "Pehmeä kevennys",
    nameEn: "Light cut",
    shortFi: "Painonhallintaan ilman nälkäkireitä",
    shortEn: "For weight control without over-restriction",
    summaryFi:
      "Treeni ja ruoka kulkevat samaan suuntaan — nälkä pysyy hallittuna.",
    summaryEn: "Training and food move together — hunger stays under control.",
    trainingDays: 4,
    mealCount: 4,
    trainingStyle: "fatloss",
    mealStyle: "high_protein",
    activityBase: 10000,
    cardioMode: "moderate",
    workoutSupport: false,
    planBias: "cut",
  },
  {
    id: "performance_block",
    nameFi: "Tiukka blokki",
    nameEn: "Performance block",
    shortFi: "Kokeneelle tavoitteelliselle käyttäjälle",
    shortEn: "For a more advanced goal-driven user",
    summaryFi:
      "Treeniä useampana päivänä — ruoka ja kuorma pidetään linjassa.",
    summaryEn: "More training days — food and load stay aligned.",
    trainingDays: 5,
    mealCount: 5,
    trainingStyle: "performance",
    mealStyle: "performance",
    activityBase: 10000,
    cardioMode: "moderate",
    workoutSupport: true,
    planBias: "performance",
  },
];

export function normalizeProgramPackageId(
  id?: string | null,
): ProgramPackageId {
  if (!id) return DEFAULT_PACKAGE_ID;
  if (LEGACY_IDS[id]) return LEGACY_IDS[id];
  if (PROGRAM_PACKAGES.some((p) => p.id === id)) {
    return id as ProgramPackageId;
  }
  return DEFAULT_PACKAGE_ID;
}

export function getProgramPackage(id?: string | null): ProgramPackage {
  const n = normalizeProgramPackageId(id);
  return PROGRAM_PACKAGES.find((p) => p.id === n) ?? PROGRAM_PACKAGES[0];
}

function mapCoachGoal(ts: ProgramPackage["trainingStyle"]): Goal {
  if (ts === "hypertrophy") return "build_muscle";
  if (ts === "fatloss") return "lose_weight";
  return "improve_fitness";
}

function mapLevel(ts: ProgramPackage["trainingStyle"]): Level {
  if (ts === "balanced") return "beginner";
  if (ts === "performance") return "advanced";
  return "intermediate";
}

function mapMealStructure(pkg: ProgramPackage): MealStructurePreference {
  if (pkg.mealCount >= 4) return "snack_forward";
  if (pkg.mealStyle === "high_protein") return "lighter_evening";
  return "three_meals";
}

function mapFlexibility(pkg: ProgramPackage): FlexibilityPreference {
  if (pkg.planBias === "performance") return "structured";
  if (pkg.planBias === "cut") return "flexible";
  return "balanced";
}

function mapEating(pkg: ProgramPackage): EatingHabits {
  if (pkg.mealStyle === "performance") return "good";
  return "okay";
}

function mealStyleLabel(ms: ProgramPackage["mealStyle"], fi: boolean): string {
  if (fi) {
    const m: Record<ProgramPackage["mealStyle"], string> = {
      easy: "helppo rytmi",
      warm: "lämpimät pääateriat",
      high_protein: "proteiini edellä",
      performance: "tarkka rytmi",
    };
    return m[ms];
  }
  const m: Record<ProgramPackage["mealStyle"], string> = {
    easy: "easy rhythm",
    warm: "warm plates",
    high_protein: "protein first",
    performance: "tight rhythm",
  };
  return m[ms];
}

export function packageLabel(
  pkg: ProgramPackage,
  locale: "fi" | "en",
): { name: string; benefit: string; audience: string; rhythm: string } {
  const fi = locale === "fi";
  return {
    name: fi ? pkg.nameFi : pkg.nameEn,
    benefit: fi ? pkg.summaryFi : pkg.summaryEn,
    audience: fi ? pkg.shortFi : pkg.shortEn,
    rhythm: fi
      ? `${pkg.mealCount} ateriaa · ${mealStyleLabel(pkg.mealStyle, true)}`
      : `${pkg.mealCount} meals · ${mealStyleLabel(pkg.mealStyle, false)}`,
  };
}

export function applyPackageToAnswers(
  packageId: string,
): Partial<OnboardingAnswers> {
  const pkg = getProgramPackage(packageId);
  const lv = mapLevel(pkg.trainingStyle);
  return {
    selectedPackageId: pkg.id,
    goal: mapCoachGoal(pkg.trainingStyle),
    level: lv,
    trainingLevel: lv,
    programTrackId: defaultTrackForPackage(pkg.id),
    daysPerWeek: pkg.trainingDays,
    mealStructure: mapMealStructure(pkg),
    flexibility: mapFlexibility(pkg),
    eatingHabits: mapEating(pkg),
    biggestChallenge:
      pkg.trainingStyle === "balanced"
        ? "dont_know_what_to_do"
        : "motivation",
  };
}

export function packageNutritionMultipliers(
  packageId: string | undefined,
): { kcal: number; protein: number } {
  const id = normalizeProgramPackageId(packageId);
  switch (id) {
    case "steady_start":
      return { kcal: 0.98, protein: 1.0 };
    case "muscle_rhythm":
      return { kcal: 1.04, protein: 1.1 };
    case "light_cut":
      return { kcal: 0.93, protein: 1.14 };
    case "performance_block":
      return { kcal: 1.02, protein: 1.08 };
    default:
      return { kcal: 1, protein: 1 };
  }
}

export function packageActivityStepDelta(
  packageId: string | undefined,
): number {
  const id = normalizeProgramPackageId(packageId);
  switch (id) {
    case "steady_start":
      return 400;
    case "muscle_rhythm":
      return 0;
    case "light_cut":
      return 1000;
    case "performance_block":
      return 500;
    default:
      return 0;
  }
}
