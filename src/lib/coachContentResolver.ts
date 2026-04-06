/**
 * Valmennussisällön haku ja mappaus UI-tyyppeihin (ei importtaa coachEngine — vältä sykliä).
 */
import { COACH_CONTENT_BY_PACKAGE } from "@/data/coachContent.real";
import { nextMealSlotIndex } from "@/data/foodContent.mock";
import { normalizeProgramPackageId } from "@/lib/programPackages";
import type { Locale } from "@/lib/i18n";
import type { GeneratedWorkoutDay } from "@/lib/training/generator";
import { generateProgression } from "@/lib/training/progression";
import type { Goal, OnboardingAnswers } from "@/types/coach";
import type {
  CoachFoodDay,
  CoachProgramContent,
  CoachWorkoutDay,
  CoachWorkoutExercise,
} from "@/types/coachContent";
import type { FoodDayPlan, FoodDayStyle } from "@/types/foodPlan";
import type { ProExercise } from "@/types/pro";
import type { ProgramPackage } from "@/lib/programPackages";

export function getCoachProgramContent(
  packageId: string | null | undefined,
): CoachProgramContent | null {
  const id = normalizeProgramPackageId(packageId);
  return COACH_CONTENT_BY_PACKAGE[id] ?? null;
}

export function getWorkoutDayContent(
  packageId: string | null | undefined,
  todayIdx: number,
): CoachWorkoutDay | null {
  const prog = getCoachProgramContent(packageId);
  if (!prog) return null;
  return prog.workoutDays[((todayIdx % 7) + 7) % 7] ?? null;
}

export function getFoodDayContent(
  packageId: string | null | undefined,
  todayIdx: number,
): CoachFoodDay | null {
  const prog = getCoachProgramContent(packageId);
  if (!prog) return null;
  return prog.foodDays[((todayIdx % 7) + 7) % 7] ?? null;
}

export function coachWorkoutExerciseToPro(
  ex: CoachWorkoutExercise,
  _locale: Locale,
): ProExercise {
  const tip = ex.coachTip;
  const focus = ex.coachFocus;
  const load = ex.loadGuidance ?? "";
  return {
    id: ex.id,
    name: ex.name,
    target: `${ex.sets}×${ex.reps}`,
    sets: ex.sets,
    reps: ex.reps,
    rest: ex.rest ?? "90 s",
    alternatives: [],
    coachTipFi: tip,
    coachTipEn: tip,
    coachFocusFi: focus,
    coachFocusEn: focus,
    prescriptionLineFi: load,
    prescriptionLineEn: load,
  };
}

export function buildGeneratedWorkoutDayFromCoachContent(args: {
  profile: OnboardingAnswers;
  day: CoachWorkoutDay;
  locale: Locale;
}): GeneratedWorkoutDay {
  const pkgId = normalizeProgramPackageId(args.profile.selectedPackageId);
  const prog = getCoachProgramContent(pkgId);
  const isRest =
    args.day.dayType === "rest" || args.day.exercises.length === 0;
  const exercises = isRest
    ? []
    : args.day.exercises.map((e) => coachWorkoutExerciseToPro(e, args.locale));
  return {
    packageId: pkgId,
    goal: args.profile.goal,
    level: args.profile.level,
    durationLabel: args.day.durationLabel,
    workout: args.day.title,
    food: prog?.defaultFoodLabel ?? "",
    activity: "",
    todayKicker: args.day.focus,
    exercises,
    progression: generateProgression(1, { level: args.profile.level }),
    isRestDay: isRest,
  };
}

function truncateGuidance(s: string, max = 160): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

export function coachFoodDayToFoodDayPlan(
  cf: CoachFoodDay,
  args: {
    locale: Locale;
    mealCount: number;
    goal: Goal;
    style: FoodDayStyle;
    planBias: ProgramPackage["planBias"];
    now: Date;
  },
): FoodDayPlan {
  void args.goal;
  void args.planBias;
  const { locale, mealCount, now } = args;
  const capped = Math.min(Math.max(mealCount, 3), 5);
  const mealsRaw = cf.meals.slice(0, capped);
  const nextBadge = locale === "fi" ? "Seuraava ateria" : "Next meal";
  const nextIdx = nextMealSlotIndex(now, mealsRaw.length);
  const meals = mealsRaw.map((m, mealIndex) => {
    const isNext = mealIndex === nextIdx;
    return {
      id: m.id,
      name: m.name,
      timingLabel: m.timingLabel,
      items: m.items,
      emphasis: isNext ? nextBadge : m.emphasis,
    };
  });
  const nextMealId = meals[nextIdx]?.id ?? meals[0]?.id ?? "";
  return {
    dayLabel: cf.dayLabel ?? (locale === "fi" ? "Tänään" : "Today"),
    mealCount: meals.length,
    styleLabel: cf.styleLabel,
    foodPlanLabel: cf.foodPlanLabel,
    guidanceLine: cf.guidance,
    meals,
    nextMealId,
  };
}

export function coachFoodSituationLine(cf: CoachFoodDay, maxLen = 140): string {
  return truncateGuidance(cf.guidance, maxLen);
}
