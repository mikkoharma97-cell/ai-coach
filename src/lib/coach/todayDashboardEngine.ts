/**
 * HÄRMÄ46 — Today-näkymän päätökset yhdestä paikasta (ei hajautettua UI-heuristiikkaa).
 * Polku: engine → UI.
 */
import { shouldSuppressWorkoutLink } from "@/lib/coach/exceptionEngine";
import {
  buildGeneratedWorkoutDayFromCoachContent,
  getWorkoutDayContent,
} from "@/lib/coachContentResolver";
import { getMondayBasedIndex } from "@/lib/plan";
import { normalizeProgramPackageId } from "@/lib/programPackages";
import { effectiveTrainingLevel } from "@/lib/profileTraining";
import { applyExerciseOverridesToProExercises } from "@/lib/training/exerciseOverrides";
import {
  generateWorkoutDay,
  type GeneratedWorkoutDay,
} from "@/lib/training/generator";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";
import type { ActiveExceptionState } from "@/types/exceptions";
import type { Locale } from "@/lib/i18n";

export type TodayPrimaryAnchor = "workout" | "focus";

export function resolveTodaySuppressWorkout(
  activeException: ActiveExceptionState | null,
): boolean {
  return Boolean(activeException && shouldSuppressWorkoutLink(activeException));
}

/** Viikkosuunnitelman mukaan: tänäänkö treenipäivä (ei generaattorin lepoa). */
export function resolveWeeklyPlanHasTrainingToday(
  plan: CoachDailyPlan | null,
  referenceDate: Date,
): boolean {
  if (!plan) return false;
  const idx = getMondayBasedIndex(referenceDate);
  return !plan.weeklyPlan.days[idx]?.isRest;
}

export function buildTodayWorkoutForUi(input: {
  profile: OnboardingAnswers;
  now: Date;
  locale: Locale;
}): GeneratedWorkoutDay | null {
  const todayIdx = getMondayBasedIndex(input.now);
  const raw = generateWorkoutDay({
    package: normalizeProgramPackageId(input.profile.selectedPackageId),
    goal: input.profile.goal,
    level: input.profile.level,
    week: 1,
    dayIndex: todayIdx,
    locale: input.locale,
    trainingLevel: effectiveTrainingLevel(input.profile),
    limitations: input.profile.limitations,
    coachMode: input.profile.mode ?? "guided",
    programBlueprintId: input.profile.programBlueprintId,
    sourceProfile: input.profile,
  });
  return {
    ...raw,
    exercises: applyExerciseOverridesToProExercises(
      raw.exercises,
      input.profile.exerciseIdOverrides,
      input.locale,
    ),
  };
}

/** Valmennussisältö ensisijainen; puuttuva päivä → generaattori + override-sarjat. */
export function buildTodayWorkoutForUiWithContent(input: {
  profile: OnboardingAnswers;
  now: Date;
  locale: Locale;
}): GeneratedWorkoutDay | null {
  const todayIdx = getMondayBasedIndex(input.now);
  const dayContent = getWorkoutDayContent(
    input.profile.selectedPackageId,
    todayIdx,
  );
  if (!dayContent) {
    return buildTodayWorkoutForUi(input);
  }
  const raw = buildGeneratedWorkoutDayFromCoachContent({
    profile: input.profile,
    day: dayContent,
    locale: input.locale,
  });
  return {
    ...raw,
    exercises: applyExerciseOverridesToProExercises(
      raw.exercises,
      input.profile.exerciseIdOverrides,
      input.locale,
    ),
  };
}

export function resolveTodayPrimaryAnchor(input: {
  workout: GeneratedWorkoutDay | null;
  suppressWorkout: boolean;
}): TodayPrimaryAnchor {
  const w = input.workout;
  if (!w || w.isRestDay || w.exercises.length === 0 || input.suppressWorkout) {
    return "focus";
  }
  return "workout";
}

/** Sama logiikka kuin primary anchor — ei erillistä “quick”-haarautumista. */
export function resolveTodayQuickDoneHref(input: {
  workout: GeneratedWorkoutDay | null;
  suppressWorkout: boolean;
}): "/workout" | "/food" {
  return resolveTodayPrimaryAnchor(input) === "workout" ? "/workout" : "/food";
}

export function resolveTodayStartWorkoutHref(input: {
  workout: GeneratedWorkoutDay | null;
  suppressWorkout: boolean;
}): "/workout" | undefined {
  return resolveTodayPrimaryAnchor(input) === "workout" ? "/workout" : undefined;
}

/** Pro-tilan rakennelista: näytä kun tänään on generoitu liike (CTA voi olla piilossa poikkeuksella). */
export function resolveProWorkoutStructureEligible(
  mode: string | undefined,
  workout: GeneratedWorkoutDay | null,
): boolean {
  if (mode !== "pro" || !workout) return false;
  return !workout.isRestDay && workout.exercises.length > 0;
}
