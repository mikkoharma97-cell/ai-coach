import type { MessageKey } from "@/lib/i18n";
import type { CoachFeatureToggles } from "@/types/coachPreferences";
import type { LimitationTag } from "@/types/exercise";
import type { RebalancePlan } from "@/types/rebalance";
import type { UserSupplementEntry } from "@/types/supplements";
import type { WorkShiftEntry, WorkShiftType } from "@/types/workShifts";

export type Goal = "lose_weight" | "build_muscle" | "improve_fitness";

export type Level = "beginner" | "intermediate" | "advanced";

export type DaysPerWeek = 1 | 2 | 3 | 4 | 5 | 6;

export type EatingHabits = "irregular" | "okay" | "good";

export type BiggestChallenge =
  | "motivation"
  | "lack_of_time"
  | "dont_know_what_to_do"
  | "fall_off_after_starting";

/** Social / events — drives adaptive “balance the week” copy */
export type SocialEatingFrequency = "rare" | "sometimes" | "often";

export type MealStructurePreference =
  | "three_meals"
  | "lighter_evening"
  | "snack_forward";

/** How rigid vs flexible the system should be */
export type FlexibilityPreference = "structured" | "balanced" | "flexible";

/** Onboarding — psychological context (plan engine may use later) */
export type LastBestShape =
  | "within_6m"
  | "within_2y"
  | "long_ago"
  | "not_sure";

export type TrainingVenue = "gym" | "home" | "outdoor" | "mixed";

export type RecentTrainingFreq =
  | "rare"
  | "weekly_few"
  | "weekly_most"
  | "daily";

/** Arjen rytmi — ohjaa ruoka- ja treenirunkoa kun ei käsin valittua blueprintia */
export type LifeSchedule =
  | "regular"
  | "shift_work"
  | "busy_day"
  | "late_schedule"
  | "student";

/** Meal engine — explicit override; if omitted, derived from habits / challenge */
export type CookingTimePreference = "fast" | "normal" | "any";

/** When the week disrupts — steers adaptive tone (proof lines, not medical advice). */
export type EventDisruptionStyle = "snap_back" | "reset" | "loose";

/** Matches app UI locale — synced with `coach-locale` when saved from preferences */
export type UiLocale = "fi" | "en";

/** App layer: guided = valmis ohjaus, pro = oma runko + järjestelmän kehitys */
export type CoachMode = "guided" | "pro";

export type ProgramPackageId =
  | "steady_start"
  | "muscle_rhythm"
  | "light_cut"
  | "performance_block";

/** Valmis treenirunko — moottorin blueprint-kerros */
export type ProgramBlueprintId =
  | "steady_begin"
  | "base_strength"
  | "hypertrophy_4"
  | "hypertrophy_5"
  | "fat_loss_light"
  | "tight_block"
  | "shift_flex"
  | "pro_training";

/** Valmis ruokarunko — ateriarytmi ja moottoripainotukset */
export type NutritionBlueprintId =
  | "easy_daily"
  | "steady_meals"
  | "muscle_fuel"
  | "light_cut_meal"
  | "train_vs_rest"
  | "shift_clock"
  | "event_balance"
  | "pro_nutrition";

/** Harjoittelun taso — näkyy Aloittelija / Keskitaso / Pro; engine käyttää `effectiveTrainingLevel` */
export type TrainingLevel = Level;

/** Tavoitepäivän luonne — copy ja rytmi */
export type TargetReason =
  | "general"
  | "wedding"
  | "event"
  | "summer"
  | "performance";

/**
 * Ohjelmasuunta — engine-kerros (rytmi, copy, kevyet kertoimet), ei erillinen kirjasto.
 */
export type ProgramTrackId =
  | "basic_strength"
  | "muscle_growth"
  | "light_fat_loss"
  | "performance"
  | "daily_rhythm"
  | "milestone_day"
  | "returning"
  | "tight_block";

export interface OnboardingAnswers {
  goal: Goal;
  level: Level;
  /** Jos asetettu, ohjaa moottoria; oletus sama kuin `level` */
  trainingLevel?: TrainingLevel;
  daysPerWeek: DaysPerWeek;
  eatingHabits: EatingHabits;
  biggestChallenge: BiggestChallenge;
  /** Mid-week surprises — how you prefer the system to respond */
  eventDisruption: EventDisruptionStyle;
  socialEatingFrequency: SocialEatingFrequency;
  mealStructure: MealStructurePreference;
  flexibility: FlexibilityPreference;
  /** When set, drives meal pools; otherwise inferred */
  cookingTimePreference?: CookingTimePreference;
  /** Lowercase keywords — generated meal ideas avoid these (no recipe DB). */
  foodDislikes?: string[];
  /** Optional bias tags for suggestions — inferred from goal if omitted. */
  foodPreferences?: string[];
  /** Persisted from preferences; falls back to localStorage locale on first load */
  uiLocale?: UiLocale;
  /** Ready-made program package — drives defaults + engine modifiers */
  selectedPackageId?: ProgramPackageId;
  /**
   * Ohjelmakirjasto: lukittu preset — `resolveProgramPresetId` palauttaa tämän.
   * Tyhjä = automaattinen päätös profiilista.
   */
  forcedPresetId?: string;
  /** Ohjelmakirjaston valinnan id (näyttö / audit) */
  selectedProgramLibraryId?: string;
  /** Moottorin suositus (askel 9) — näyttö; ei korvaa valittua */
  recommendedProgramLibraryId?: string;
  /** Ruokarakenteen kirjaston valinta */
  selectedNutritionLibraryId?: string;
  /** Moottorin suositus (askel 10) */
  recommendedNutritionLibraryId?: string;
  /** Valinnainen treenirunko; tyhjä = paketti + Pro-tilan oletus */
  programBlueprintId?: ProgramBlueprintId;
  /** Valinnainen ruokarunko; tyhjä = paketti + Pro-tilan oletus */
  nutritionBlueprintId?: NutritionBlueprintId;
  /**
   * Oletus `guided` — päivän moottori (`dailyEngine` ym.) ei lue tätä; vain Pro-UI.
   * `pro` = valinnainen työkalukerros, ei korvaa ohjattua päivälistaa.
   */
  mode?: CoachMode;
  /** Tavoitepaino (kg) — valinnainen */
  targetWeight?: number;
  /** ISO YYYY-MM-DD */
  targetDate?: string;
  targetReason?: TargetReason;
  /** Lähtöpaino aikajanalle (kg) — valinnainen; ilman tätä näytetään vain viikkoluku */
  currentWeight?: number;
  programTrackId?: ProgramTrackId;
  /** Treenirajoitteet — moottori suodattaa / vaihtaa liikkeitä */
  limitations?: LimitationTag[];
  lastBestShape?: LastBestShape;
  trainingVenue?: TrainingVenue;
  recentTrainingFreq?: RecentTrainingFreq;
  /** Valinnainen; puuttuessa päätellään haasteesta / ruokarytmistä */
  lifeSchedule?: LifeSchedule;
  /** Oma valmentaja — mitä näytetään (oletus täydet). */
  coachFeatureToggles?: CoachFeatureToggles;
  /** Vuorotyö — käyttäjä on aktivoinut vuorosuunnittelun (synkassa workShiftStorage) */
  shiftMode?: boolean;
  /** Valinnainen peilaus / export; lähde: `workShiftStorage` */
  workShifts?: WorkShiftEntry[];
  /** Lisäravinteet — proteiinilisät vähentävät ruoasta tarvittavaa proteiinia */
  supplementStack?: UserSupplementEntry[];
}

export interface WeekDayEntry {
  label: string;
  workoutLine: string;
  isRest: boolean;
}

export interface WeeklyPlan {
  days: WeekDayEntry[];
}

/** Output from the plan generator — ready for the dashboard UI. */
export interface CoachPlan {
  weeklyPlan: WeeklyPlan;
  todayWorkout: string;
  todayFoodTask: string;
  todayActivityTask: string;
  coachMessage: string;
  /**
   * Kun käyttäjällä on työvuoro tälle päivälle — `composeCoachDailyPlan` täyttää.
   * Myöhemmin: kalenterisynk voi kirjoittaa samaan rakenteeseen.
   */
  shiftToday?: {
    shiftType: WorkShiftType;
    badgeKey: MessageKey;
    rationaleKey: MessageKey;
  } | null;
}

/** Optional same-day log — used when present; no UI required for hints to stay unused. */
export interface DayOutcomeHint {
  caloriesOver?: boolean;
  skippedWorkout?: boolean;
  activityUnder?: boolean;
  /** Pikainen tekstimuistiinpano (esim. äänellä kirjattu) */
  quickNote?: string;
}

export interface TodayWithAdjustments {
  todayWorkout: string;
  todayFoodTask: string;
  todayActivityTask: string;
  /** Subtle system line near Today — single secondary message max */
  systemLine: string | null;
}

export interface DailyMacros {
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/**
 * Central daily output — mobile Today / Food / Plan / Adjustments consume this.
 */
export interface CoachDailyPlan extends CoachPlan, TodayWithAdjustments {
  todayCalories: number;
  todayMacros: DailyMacros;
  /** g — proteiinijauheet yms.; ruoka-engine käyttää `foodProteinTargetG` */
  supplementProteinG?: number;
  /** g — proteiinitavoite aterioista kun lisäravinteet vähentävät tarvetta */
  foodProteinTargetG?: number;
  /** Extra kcal nudge from logged daily movement (client localStorage); 0 on server. */
  activityEnergyBonusKcal: number;
  /** Short proof lines — personalization visible in-app */
  personalizationProof: string[];
  /** Food screen secondary line (may mirror systemLine or food-specific) */
  foodAdjustmentNote: string | null;
  /** Hallittu ylisyöntitasapaino — näkyy Today / Food / Review / Progress */
  rebalancePlan: RebalancePlan | null;
}

export interface PlannedEvent {
  id: string;
  /** YYYY-M-D */
  dateKey: string;
  label: string;
  kind: "flexible_intake" | "social" | "travel";
}

/** Row for /adjustments — premium copy, no clutter */
export interface AdjustmentRow {
  id: string;
  title: string;
  detail: string;
  section: "upcoming" | "applied" | "why";
}

export interface UserStateSnapshot {
  answers: OnboardingAnswers;
  referenceDate: Date;
  plannedEvents: PlannedEvent[];
}

/** Weekly reflection — coach analysis + compact strip, no charts. */
export interface WeeklyCoachAnalysis {
  headline: string;
  didWork: string[];
  heldBack: string[];
  nextMove: string[];
  coachLine?: string | null;
}

/** Shown under review hero — streak, consistency, one metric (protein target or future sleep). */
export interface WeeklyReviewDataStrip {
  streakDays: number;
  consistency: "high" | "mid" | "low";
  /** Plan protein g/day; food log does not expose macros per item yet. */
  proteinTargetG: number | null;
  /** Reserved — no sleep log in V1; when set, strip prefers sleep over protein. */
  avgSleepHours: number | null;
}

export interface WeeklyReview {
  weekRangeLabel: string;
  coach: WeeklyCoachAnalysis;
  strip: WeeklyReviewDataStrip;
}

/** Local food log — rough kcal only; macros stay plan-level. */
export type MealSlot = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodLogItem {
  id: string;
  label: string;
  kcal: number;
  slot: MealSlot;
}

export interface SavedMeal {
  id: string;
  label: string;
  kcal: number;
}

/** One day of user-observed signal — built from storage or tests (adaptive core input). */
export interface RecentDayRecord {
  /** YYYY-M-D */
  dateKey: string;
  markedDone?: boolean;
  caloriesOver?: boolean;
  skippedWorkout?: boolean;
  activityUnder?: boolean;
}

/**
 * Core adaptive input — profile fields + recent signal + calendar.
 * Optional extras keep parity with full onboarding when provided.
 */
export interface AdaptiveUserState {
  referenceDate: Date;
  goal: Goal;
  level: Level;
  daysPerWeek: DaysPerWeek;
  eatingHabits: EatingHabits;
  flexibilityPreference: FlexibilityPreference;
  recentDays: RecentDayRecord[];
  upcomingEvents: PlannedEvent[];
  profileExtras?: Pick<
    OnboardingAnswers,
    | "biggestChallenge"
    | "mealStructure"
    | "socialEatingFrequency"
    | "eventDisruption"
    | "foodPreferences"
    | "foodDislikes"
    | "selectedPackageId"
    | "programBlueprintId"
    | "nutritionBlueprintId"
    | "trainingLevel"
    | "programTrackId"
    | "targetWeight"
    | "targetDate"
    | "targetReason"
    | "currentWeight"
    | "mode"
  >;
}

/** Narrow output for composition — maps to CoachDailyPlan fields. */
export interface AdaptiveDailyCore {
  todayWorkout: string;
  todayCalories: number;
  todayActivity: string;
  adjustmentNote: string | null;
  personalizationProof: string[];
}
