import type {
  BiggestChallenge,
  CoachPlan,
  OnboardingAnswers,
  WeekDayEntry,
} from "@/types/coach";
import type { Locale, MessageKey } from "@/lib/i18n";
import { translate } from "@/lib/i18n";
import {
  getTodayGuidanceFromProfile,
  getWeeklyPatternFromProfile,
} from "@/lib/packageGuidance";
import { DEFAULT_PACKAGE_ID } from "@/lib/programPackages";
import { defaultTrackForPackage } from "@/lib/programTracks";

const WD_KEYS = [
  "plan.base.wd0",
  "plan.base.wd1",
  "plan.base.wd2",
  "plan.base.wd3",
  "plan.base.wd4",
  "plan.base.wd5",
  "plan.base.wd6",
] as const;

/** Monday = 0 … Sunday = 6 */
export function getMondayBasedIndex(date: Date): number {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

/** Calendar key for Mon=0 … Sun=6 within the week of `ref`. */
export function dayKeyForMondayOffset(ref: Date, mondayIndex: number): string {
  const day = new Date(ref);
  const offset = getMondayBasedIndex(ref);
  day.setDate(day.getDate() - offset + mondayIndex);
  return `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
}

function buildWeekDays(answers: OnboardingAnswers, locale: Locale): WeekDayEntry[] {
  const trainDays = getWeeklyPatternFromProfile(answers);
  const g = getTodayGuidanceFromProfile(answers, locale);
  return WD_KEYS.map((wk, i) => {
    if (!trainDays.has(i)) {
      return {
        label: translate(locale, wk),
        workoutLine: translate(locale, "plan.base.work.rest"),
        isRest: true,
      };
    }
    return {
      label: translate(locale, wk),
      workoutLine: g.workout,
      isRest: false,
    };
  });
}

function coachLine(challenge: BiggestChallenge, locale: Locale): string {
  const m: Record<BiggestChallenge, MessageKey> = {
    motivation: "plan.base.coach.motivation",
    lack_of_time: "plan.base.coach.time",
    dont_know_what_to_do: "plan.base.coach.unsure",
    fall_off_after_starting: "plan.base.coach.falloff",
  };
  return translate(locale, m[challenge]);
}

export function generatePersonalizedPlan(
  answers: OnboardingAnswers,
  referenceDate: Date = new Date(),
  locale: Locale = "fi",
): CoachPlan {
  const days = buildWeekDays(answers, locale);
  const todayIdx = getMondayBasedIndex(referenceDate);
  const today = days[todayIdx] ?? days[0];
  const g = getTodayGuidanceFromProfile(answers, locale);

  return {
    weeklyPlan: { days },
    todayWorkout: today.workoutLine,
    todayFoodTask: g.food,
    todayActivityTask: g.activity,
    coachMessage: coachLine(answers.biggestChallenge, locale),
  };
}

export function countTrainingDays(plan: { days: WeekDayEntry[] }): number {
  return plan.days.filter((d) => !d.isRest).length;
}

export function emptyAnswers(): OnboardingAnswers {
  return {
    goal: "improve_fitness",
    level: "beginner",
    trainingLevel: "beginner",
    programTrackId: defaultTrackForPackage(DEFAULT_PACKAGE_ID),
    daysPerWeek: 3,
    eatingHabits: "okay",
    biggestChallenge: "motivation",
    eventDisruption: "snap_back",
    socialEatingFrequency: "sometimes",
    mealStructure: "three_meals",
    flexibility: "balanced",
    foodDislikes: [],
    foodPreferences: [],
    selectedPackageId: DEFAULT_PACKAGE_ID,
    mode: "guided",
    programBlueprintId: undefined,
    nutritionBlueprintId: undefined,
    forcedPresetId: undefined,
    selectedProgramLibraryId: undefined,
    selectedNutritionLibraryId: undefined,
    lastBestShape: "not_sure",
    trainingVenue: "mixed",
    recentTrainingFreq: "weekly_few",
  };
}
