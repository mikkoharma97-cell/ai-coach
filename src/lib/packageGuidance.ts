/**
 * Today copy + weekly training indices from selected package (not UI).
 * Profiilin blueprintit voivat ohittaa paketin oletusrivit.
 */
import type { Locale } from "@/lib/i18n";
import { resolveNutritionBlueprint } from "@/lib/nutritionBlueprints";
import {
  resolveProgramBlueprint,
  trainingWeekdayIndices,
} from "@/lib/programBlueprints";
import type { OnboardingAnswers, ProgramPackageId } from "@/types/coach";
import { normalizeProgramPackageId } from "@/lib/programPackages";

const GUIDANCE: Record<
  ProgramPackageId,
  { workoutFi: string; workoutEn: string; foodFi: string; foodEn: string; activityFi: string; activityEn: string }
> = {
  steady_start: {
    workoutFi: "Koko keho kevyesti — perusliikkeet, 25–30 min",
    workoutEn: "Easy full body — basics, 25–30 min",
    foodFi: "Kolme ateriaa — sama rytmi, yksi kasvislisä tänään.",
    foodEn: "Three meals — same rhythm, add vegetables once today.",
    activityFi: "8 400 askelta",
    activityEn: "8,400 steps",
  },
  muscle_rhythm: {
    workoutFi: "Yläpainotteinen hypertrofia — 35–45 min",
    workoutEn: "Upper-biased hypertrophy — 35–45 min",
    foodFi: "Neljä ateriaa — lämpimät pääateriat tukevat treeniä.",
    foodEn: "Four meals — warm mains support training.",
    activityFi: "9 000 askelta",
    activityEn: "9,000 steps",
  },
  light_cut: {
    workoutFi: "Koko keho + kevyt syke — 30–40 min",
    workoutEn: "Full body + easy cardio — 30–40 min",
    foodFi: "Proteiini edellä — ilta pidetään kevyempänä.",
    foodEn: "Protein first — keep dinner lighter.",
    activityFi: "10 000 askelta",
    activityEn: "10,000 steps",
  },
  performance_block: {
    workoutFi: "Päivän päätreeni + palautumisen tuki",
    workoutEn: "Main session + recovery support",
    foodFi: "Viisi ateriaa — treenin ympärille rakennettu rytmi.",
    foodEn: "Five meals — rhythm built around training.",
    activityFi: "10 000 askelta + kevyt aerobinen",
    activityEn: "10,000 steps + light aerobic work",
  },
};

const TODAY_KICKER: Record<ProgramPackageId, { fi: string; en: string }> = {
  steady_start: {
    fi: "Rakennetaan sinulle selkeä viikko ilman että aloitat tyhjästä.",
    en: "A clear week without starting from zero.",
  },
  muscle_rhythm: {
    fi: "Rakennettu lihaskasvun rytmiin.",
    en: "Built for a muscle-growth rhythm.",
  },
  light_cut: {
    fi: "Proteiini edellä — rytmi pysyy hallinnassa.",
    en: "Protein first — rhythm stays in hand.",
  },
  performance_block: {
    fi: "Kuorma ja ruoka pidetään linjassa.",
    en: "Load and food stay aligned.",
  },
};

export type TodayGuidance = {
  workout: string;
  food: string;
  activity: string;
  todayKicker: string;
};

export function getTodayGuidanceFromPackage(
  packageId: string | null | undefined,
  _goal: OnboardingAnswers["goal"],
  _profile: OnboardingAnswers,
  locale: Locale,
): TodayGuidance {
  const id = normalizeProgramPackageId(packageId);
  const g = GUIDANCE[id];
  const k = TODAY_KICKER[id];
  const en = locale === "en";
  return {
    workout: en ? g.workoutEn : g.workoutFi,
    food: en ? g.foodEn : g.foodFi,
    activity: en ? g.activityEn : g.activityFi,
    todayKicker: en ? k.en : k.fi,
  };
}

/** Ma=0 … Su=6 */
export function getWeeklyPatternFromPackage(
  packageId: string | null | undefined,
): Set<number> {
  const id = normalizeProgramPackageId(packageId);
  switch (id) {
    case "steady_start":
      return new Set([0, 2, 5]);
    case "muscle_rhythm":
      return new Set([1, 3, 5, 6]);
    case "light_cut":
      return new Set([0, 2, 4, 5]);
    case "performance_block":
      return new Set([0, 1, 3, 4, 5]);
    default:
      return new Set([0, 2, 5]);
  }
}

/** Treenipäivät valitun treenirungon mukaan (blueprint kerros). */
export function getWeeklyPatternFromProfile(
  answers: OnboardingAnswers,
): Set<number> {
  const pb = resolveProgramBlueprint(answers);
  return trainingWeekdayIndices(pb);
}

/** Päivän ohjeet: treeni + ruoka blueprinteista, aktiviteetti paketista. */
export function getTodayGuidanceFromProfile(
  answers: OnboardingAnswers,
  locale: Locale,
): TodayGuidance {
  const base = getTodayGuidanceFromPackage(
    answers.selectedPackageId,
    answers.goal,
    answers,
    locale,
  );
  const pb = resolveProgramBlueprint(answers);
  const nb = resolveNutritionBlueprint(answers);
  const en = locale === "en";
  return {
    workout: en ? pb.planWorkoutLineEn : pb.planWorkoutLineFi,
    food: en ? nb.planFoodLineEn : nb.planFoodLineFi,
    activity: base.activity,
    todayKicker: en ? pb.benefitLineEn : pb.benefitLineFi,
  };
}
