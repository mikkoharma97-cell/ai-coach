/**
 * Coach Engine — viestipinta: yksi sisään, neljä slottia ulos (Today / Food / Workout / Review).
 * Rakentaa saman ketjun kuin `coachEngineBundle` (normalisointi → päätös → adaptaatio → selitys → rivit).
 */
import { buildCoachEngineBundle } from "@/lib/coach/coachEngineBundle";
import type { Locale } from "@/lib/i18n";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";

export type CoachMessageSlot = "today" | "food" | "workout" | "review";

export type CoachMessages = Record<CoachMessageSlot, string>;

export type CoachMessageBuildInput = {
  profile: OnboardingAnswers;
  locale: Locale;
  now: Date;
  plan: CoachDailyPlan | null;
  activeException: boolean;
};

export type CoachMessageResult = {
  messages: CoachMessages;
  locale: Locale;
  /** Snapshot-aika (analytics / debug) */
  referenceIso: string;
};

export function buildCoachMessages(input: CoachMessageBuildInput): CoachMessageResult {
  const bundle = buildCoachEngineBundle(input);
  return {
    messages: {
      today: bundle.lines.today,
      food: bundle.lines.food,
      workout: bundle.lines.workout,
      review: bundle.lines.review,
    },
    locale: input.locale,
    referenceIso: input.now.toISOString(),
  };
}

export function coachMessageAt(messages: CoachMessages, slot: CoachMessageSlot): string {
  return messages[slot];
}

// --- Today coach strip (kevyt heuristiikka, ei erillistä moottoria) ---

export type CoachMessageContext = {
  hasWorkoutToday: boolean;
  workoutDone: boolean;
  mealsLogged: number;
  dayComplete: boolean;
  isRestDay?: boolean;
  /** Ruokapainotteinen käyttö — erottuu lepopäivästä */
  foodOnly?: boolean;
};

type CoachStripCopy = {
  dayDone: string;
  restDay: string;
  foodOnlyLog: string;
  foodOnlyGood: string;
  startWorkout: string;
  workoutDoneFood: string;
  goodRhythm: string;
  fallback: string;
};

const COACH_STRIP_FI: CoachStripCopy = {
  dayDone: "Hyvä päivä. Teit sen mitä piti. Jatketaan huomenna.",
  restDay: "Tänään keskityt palautumiseen. Pidä rytmi kasassa.",
  foodOnlyLog: "Kirjaa ateriat. Pidä päivän linja näkyvänä.",
  foodOnlyGood: "Ruoassa on rytmi. Pidä tämä linja.",
  startWorkout: "Aloita treeni. Se määrittää tämän päivän suunnan.",
  workoutDoneFood: "Hyvä treeni. Varmista nyt että syöt tarpeeksi.",
  goodRhythm: "Hyvä rytmi. Jatka näin.",
  fallback: "Yksi askel kerrallaan. Pidä linja.",
};

const COACH_STRIP_EN: CoachStripCopy = {
  dayDone: "Solid day. You did what mattered. Continue tomorrow.",
  restDay: "Recovery today. Keep the rhythm steady.",
  foodOnlyLog: "Log your meals. Keep today's line visible.",
  foodOnlyGood: "Food rhythm is on. Hold this line.",
  startWorkout: "Start the session. It sets the tone for today.",
  workoutDoneFood: "Good session. Now lock in enough food.",
  goodRhythm: "Good rhythm. Hold this line.",
  fallback: "One step at a time. Hold the line.",
};

function stripCopy(locale: Locale): CoachStripCopy {
  return locale === "en" ? COACH_STRIP_EN : COACH_STRIP_FI;
}

/**
 * Lyhyt valmentajan huomio Today-näkymään — sama data kuin TodayView:ssä, ei uutta tilaa.
 */
export function getCoachMessage(
  ctx: CoachMessageContext,
  locale: Locale = "fi",
): string {
  const L = stripCopy(locale);

  if (ctx.dayComplete) {
    return L.dayDone;
  }

  if (ctx.foodOnly) {
    if (ctx.mealsLogged >= 2) return L.foodOnlyGood;
    return L.foodOnlyLog;
  }

  if (!ctx.hasWorkoutToday) {
    return ctx.isRestDay === false ? L.fallback : L.restDay;
  }

  if (!ctx.workoutDone) {
    return L.startWorkout;
  }

  if (ctx.mealsLogged < 2) {
    return L.workoutDoneFood;
  }

  return L.goodRhythm;
}

/** @deprecated Käytä `CoachMessageContext` */
export type CoachContext = CoachMessageContext;
