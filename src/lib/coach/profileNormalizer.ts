/**
 * Profiilin normalisointi — moottori saa aina täyden, turvallisen rakenteen.
 *
 * | Kenttä | Kun puuttuu / virheellinen | Oletus |
 * |--------|---------------------------|--------|
 * | goal | ei tunnettu arvo | improve_fitness |
 * | level | — | beginner |
 * | trainingLevel | — | sama kuin level |
 * | trainingVenue | — | mixed |
 * | daysPerWeek | ei 1–6 | 3 |
 * | lifeSchedule | — | regular (tai päätellään) |
 * | socialEatingFrequency | — | sometimes |
 * | flexibility | — | balanced |
 * | biggestChallenge | — | motivation |
 * | eatingHabits | — | okay |
 * | eventDisruption | — | snap_back |
 * | mealStructure | — | three_meals |
 * | currentWeight / targetWeight | ei 40–200 | undefined |
 * | mode | — | guided |
 * | selectedPackageId | — | normalizeProgramPackageId |
 * | programTrackId | — | paketin oletusrata |
 * | recentTrainingFreq | — | weekly_few |
 * | lastBestShape | — | not_sure |
 * | foodDislikes / foodPreferences | — | [] |
 * | limitations | — | [] |
 * | coachFeatureToggles | — | täydennetään oletuksiin |
 */
import { emptyAnswers } from "@/lib/plan";
import { normalizeProgramPackageId } from "@/lib/programPackages";
import { defaultTrackForPackage } from "@/lib/programTracks";
import type {
  BiggestChallenge,
  DaysPerWeek,
  EatingHabits,
  EventDisruptionStyle,
  FlexibilityPreference,
  Goal,
  LastBestShape,
  Level,
  LifeSchedule,
  MealStructurePreference,
  OnboardingAnswers,
  RecentTrainingFreq,
  SocialEatingFrequency,
  TrainingVenue,
  UiLocale,
} from "@/types/coach";
import {
  DEFAULT_COACH_FEATURE_TOGGLES,
  type CoachFeatureToggles,
} from "@/types/coachPreferences";

const GOALS: Goal[] = ["lose_weight", "build_muscle", "improve_fitness"];
const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];
const VENUES: TrainingVenue[] = ["gym", "home", "outdoor", "mixed"];
const LIFE: LifeSchedule[] = [
  "regular",
  "shift_work",
  "busy_day",
  "late_schedule",
  "student",
];
const SOCIAL: SocialEatingFrequency[] = ["rare", "sometimes", "often"];
const FLEX: FlexibilityPreference[] = ["structured", "balanced", "flexible"];
const CHALLENGES: BiggestChallenge[] = [
  "motivation",
  "lack_of_time",
  "dont_know_what_to_do",
  "fall_off_after_starting",
];
const EATING: EatingHabits[] = ["irregular", "okay", "good"];
const DISRUPT: EventDisruptionStyle[] = ["snap_back", "reset", "loose"];
const MEALS: MealStructurePreference[] = [
  "three_meals",
  "lighter_evening",
  "snack_forward",
];
const FREQ: RecentTrainingFreq[] = [
  "rare",
  "weekly_few",
  "weekly_most",
  "daily",
];
const SHAPE: LastBestShape[] = [
  "within_6m",
  "within_2y",
  "long_ago",
  "not_sure",
];

function clampDays(n: unknown): DaysPerWeek {
  const x = Number(n);
  if (!Number.isFinite(x)) return 3;
  const r = Math.round(x);
  if (r < 1) return 1;
  if (r > 6) return 6;
  return r as DaysPerWeek;
}

function numWeight(w: unknown): number | undefined {
  if (w == null) return undefined;
  const n = Number(w);
  if (!Number.isFinite(n) || n < 40 || n > 200) return undefined;
  return Math.round(n * 10) / 10;
}

function inferLifeSchedule(
  raw: LifeSchedule | undefined,
  challenge: BiggestChallenge,
  eating: EatingHabits,
): LifeSchedule {
  if (raw && LIFE.includes(raw)) return raw;
  if (challenge === "lack_of_time") return "busy_day";
  if (eating === "irregular") return "shift_work";
  return "regular";
}

export type ProfileNormalizationReport = {
  normalizedKeys: string[];
  defaultsUsed: Record<string, string>;
};

export function normalizeProfileForEngine(
  profile: OnboardingAnswers | null | undefined,
): OnboardingAnswers {
  const base = emptyAnswers();
  if (!profile) return base;

  const goal = GOALS.includes(profile.goal as Goal)
    ? (profile.goal as Goal)
    : base.goal;
  const level = LEVELS.includes(profile.level as Level)
    ? (profile.level as Level)
    : base.level;
  const trainingLevel = LEVELS.includes(
    (profile.trainingLevel ?? level) as Level,
  )
    ? (profile.trainingLevel ?? level)
    : level;

  const trainingVenue = VENUES.includes(profile.trainingVenue as TrainingVenue)
    ? (profile.trainingVenue as TrainingVenue)
    : "mixed";

  const daysPerWeek =
    profile.daysPerWeek != null ? clampDays(profile.daysPerWeek) : 3;

  const eatingHabits = EATING.includes(profile.eatingHabits as EatingHabits)
    ? (profile.eatingHabits as EatingHabits)
    : "okay";

  const biggestChallenge = CHALLENGES.includes(
    profile.biggestChallenge as BiggestChallenge,
  )
    ? (profile.biggestChallenge as BiggestChallenge)
    : "motivation";

  const eventDisruption = DISRUPT.includes(
    profile.eventDisruption as EventDisruptionStyle,
  )
    ? (profile.eventDisruption as EventDisruptionStyle)
    : "snap_back";

  const socialEatingFrequency = SOCIAL.includes(
    profile.socialEatingFrequency as SocialEatingFrequency,
  )
    ? (profile.socialEatingFrequency as SocialEatingFrequency)
    : "sometimes";

  const mealStructure = MEALS.includes(
    profile.mealStructure as MealStructurePreference,
  )
    ? (profile.mealStructure as MealStructurePreference)
    : "three_meals";

  const flexibility = FLEX.includes(
    profile.flexibility as FlexibilityPreference,
  )
    ? (profile.flexibility as FlexibilityPreference)
    : "balanced";

  const lifeSchedule = inferLifeSchedule(
    profile.lifeSchedule,
    biggestChallenge,
    eatingHabits,
  );

  const recentTrainingFreq = FREQ.includes(
    profile.recentTrainingFreq as RecentTrainingFreq,
  )
    ? (profile.recentTrainingFreq as RecentTrainingFreq)
    : "weekly_few";

  const lastBestShape = SHAPE.includes(profile.lastBestShape as LastBestShape)
    ? (profile.lastBestShape as LastBestShape)
    : "not_sure";

  const selectedPackageId = normalizeProgramPackageId(profile.selectedPackageId);

  const programTrackId =
    profile.programTrackId ?? defaultTrackForPackage(selectedPackageId);

  const mode = profile.mode === "pro" || profile.mode === "guided"
    ? profile.mode
    : "guided";

  const uiLocale: UiLocale | undefined =
    profile.uiLocale === "fi" || profile.uiLocale === "en"
      ? profile.uiLocale
      : undefined;

  const foodDislikes = Array.isArray(profile.foodDislikes)
    ? profile.foodDislikes
    : [];
  const foodPreferences = Array.isArray(profile.foodPreferences)
    ? profile.foodPreferences
    : [];
  const limitations = Array.isArray(profile.limitations)
    ? profile.limitations
    : [];

  const cw = numWeight(profile.currentWeight);
  const tw = numWeight(profile.targetWeight);

  const coachFeatureToggles: CoachFeatureToggles = {
    ...DEFAULT_COACH_FEATURE_TOGGLES,
    ...profile.coachFeatureToggles,
  };

  const out: OnboardingAnswers = {
    ...base,
    ...profile,
    goal,
    level,
    trainingLevel,
    trainingVenue,
    daysPerWeek,
    eatingHabits,
    biggestChallenge,
    eventDisruption,
    socialEatingFrequency,
    mealStructure,
    flexibility,
    lifeSchedule,
    recentTrainingFreq,
    lastBestShape,
    selectedPackageId,
    programTrackId,
    mode,
    foodDislikes,
    foodPreferences,
    limitations,
    coachFeatureToggles,
    currentWeight: cw,
    targetWeight: tw,
    programBlueprintId: profile.programBlueprintId,
    nutritionBlueprintId: profile.nutritionBlueprintId,
    cookingTimePreference: profile.cookingTimePreference,
    targetDate: profile.targetDate,
    targetReason: profile.targetReason,
  };
  if (uiLocale !== undefined) out.uiLocale = uiLocale;

  return out;
}

/** Testit / debug: mitä muuttui suhteessa lähtöprofiiliin */
export function peekProfileNormalization(
  profile: OnboardingAnswers | null | undefined,
): ProfileNormalizationReport {
  const before = profile ?? emptyAnswers();
  const after = normalizeProfileForEngine(profile);
  const normalizedKeys: string[] = [];
  const defaultsUsed: Record<string, string> = {};
  const keys = new Set([
    ...Object.keys(before),
    ...Object.keys(after),
  ] as string[]);
  for (const k of keys) {
    const b = (before as unknown as Record<string, unknown>)[k];
    const a = (after as unknown as Record<string, unknown>)[k];
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      normalizedKeys.push(k);
      defaultsUsed[k] = JSON.stringify(a);
    }
  }
  return { normalizedKeys, defaultsUsed };
}
