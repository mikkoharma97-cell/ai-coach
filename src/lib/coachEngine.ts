/**
 * Coach Engine V1C — yksi päivämalli + resolver (mock-lähteet).
 * Workout/Food/Today jakavat saman moodin; workoutContextLine treeninäkymän päiväkontekstille.
 */
import {
  foodPlanFallbackLabel,
  formatWorkoutPlanLabel,
} from "@/lib/coachDisplayLabels";
import {
  coachFoodSituationLine,
  getCoachProgramContent,
  getFoodDayContent,
  getWorkoutDayContent,
} from "@/lib/coachContentResolver";
import { resolveFoodDayMock } from "@/data/foodContent.mock";
import { resolveTodayDisplayMock } from "@/data/todayContent.mock";
import { getProgramPackage, normalizeProgramPackageId } from "@/lib/programPackages";
import type { Locale, MessageKey } from "@/lib/i18n";
import type { OnboardingAnswers } from "@/types/coach";
import type { TodayDisplayKind } from "@/data/todayContent.mock";
import type { TodayFlowUiState, TodaySkipKind } from "@/lib/todayFlowStorage";

export type CoachDayMode =
  | "training"
  | "rest"
  | "food_only"
  | "completed"
  | "light"
  | "recovery";

export type CoachNextAction =
  | "workout"
  | "food"
  | "complete_day"
  | "rest"
  | "none";

export type CoachDayModel = {
  mode: CoachDayMode;
  heroTitle: string;
  heroGuidance: string;
  workoutPlanLabel: string;
  foodPlanLabel: string;
  programFocusLabel: string;
  nextAction: CoachNextAction;
  /** Pää-CTA — null = ei nappia (completed tms.) */
  primaryCta: { href: string; label: string } | null;
  /** Lyhyt tilaviesti (esim. päivä valmis) tai null */
  inlineStatus: string | null;
  /** Tilanne-rivi kun ruokalogeja ei ole (mock resolverista) */
  situationFoodWhenNoLogs: string;
  /** “Tila”-sarakkeen arvo — sama totuus kuin mode (+ alitila) */
  statusValue: string;
  /** Yksi rivi Workout-näkymälle — linjassa moodin kanssa */
  workoutContextLine: string;
};

export type CoachEngineInput = {
  locale: Locale;
  t: (key: MessageKey) => string;
  profile: OnboardingAnswers;
  todayIdx: number;
  foodOnly: boolean;
  isRestDay: boolean;
  /** Treenipäivä ohjelmassa (ei lepo, ei food-only) */
  hasWorkoutToday: boolean;
  resolvedFlow: TodayFlowUiState;
  flowSkipKind?: TodaySkipKind;
  hasWorkoutLoggedToday: boolean;
  hasSetLogsToday: boolean;
  isCompleted: boolean;
  justFinishedWorkoutSession: boolean;
  /** Lokissa olevien merkintöjen määrä (päivän moodi / myöhempi logiikka) */
  foodLogCount: number;
  now: Date;
};

function displayKind(
  foodOnly: boolean,
  isRestDay: boolean,
): TodayDisplayKind {
  if (foodOnly) return "food_only";
  if (isRestDay) return "rest";
  return "training";
}

function deriveMode(input: CoachEngineInput): CoachDayMode {
  void input.foodLogCount;
  if (
    input.resolvedFlow === "skipped" &&
    input.flowSkipKind === "light"
  ) {
    return "light";
  }
  if (
    input.resolvedFlow === "skipped" &&
    input.flowSkipKind === "tomorrow"
  ) {
    return "recovery";
  }
  if (input.isCompleted) return "completed";
  if (input.foodOnly) return "food_only";
  if (input.isRestDay) return "rest";
  return "training";
}

/** Tilanne nyt -rivi: moodi ensin, training/rest/food_only tarkentaa resolvedFlowlla */
function deriveStatusValue(
  input: CoachEngineInput,
  mode: CoachDayMode,
  t: (key: MessageKey) => string,
): string {
  const { resolvedFlow } = input;
  switch (mode) {
    case "completed":
      return t("todayView.progressAriaCompleted");
    case "light":
      return t("todayView.situationStatusLight");
    case "recovery":
      return t("todayView.situationStatusRecovery");
    case "food_only":
      return resolvedFlow === "in_progress"
        ? t("todayView.progressAriaInProgress")
        : t("todayView.situationStatusFoodDay");
    case "rest":
      return resolvedFlow === "in_progress"
        ? t("todayView.progressAriaInProgress")
        : t("todayView.situationStatusRestDay");
    case "training":
    default:
      return resolvedFlow === "in_progress"
        ? t("todayView.progressAriaInProgress")
        : t("todayView.progressAriaNotStarted");
  }
}

function deriveWorkoutContextLine(
  mode: CoachDayMode,
  workoutPlanLabel: string,
  foodPlanLabel: string,
  heroTitle: string,
  statusValue: string,
): string {
  switch (mode) {
    case "completed":
      return statusValue;
    case "rest":
      return heroTitle;
    case "food_only":
      return foodPlanLabel;
    case "training":
    case "light":
    case "recovery":
      return workoutPlanLabel;
    default:
      return workoutPlanLabel;
  }
}

export function getCoachNextActionRoute(model: CoachDayModel): string | null {
  const h = model.primaryCta?.href?.trim();
  return h ? h : null;
}

export function getCoachNextActionLabel(model: CoachDayModel): string {
  return model.primaryCta?.label ?? "";
}

function primaryCtaFromState(input: CoachEngineInput): {
  href: string | null;
  labelKey: MessageKey;
  next: CoachNextAction;
} {
  if (input.isCompleted) {
    return {
      href: null,
      labelKey: "todayView.cta",
      next: "none",
    };
  }
  if (input.resolvedFlow === "skipped") {
    return {
      href: "/food/day",
      labelKey: "todayView.ctaGoFood",
      next: "food",
    };
  }
  if (input.foodOnly) {
    if (input.resolvedFlow === "in_progress") {
      return {
        href: "/food",
        labelKey: "todayView.ctaContinueFood",
        next: "food",
      };
    }
    return { href: "/food", labelKey: "todayView.ctaGoFood", next: "food" };
  }
  if (input.isRestDay) {
    if (input.resolvedFlow === "in_progress") {
      return {
        href: "/food",
        labelKey: "todayView.ctaContinueFood",
        next: "food",
      };
    }
    return { href: "/food", labelKey: "todayView.ctaGoFood", next: "food" };
  }
  if (input.hasWorkoutLoggedToday || input.hasSetLogsToday) {
    return { href: "/food", labelKey: "todayView.ctaGoFood", next: "food" };
  }
  if (input.resolvedFlow === "in_progress") {
    return {
      href: "/workout",
      labelKey: "todayView.ctaContinueWorkout",
      next: "workout",
    };
  }
  return { href: "/workout", labelKey: "todayView.cta", next: "workout" };
}

/**
 * Yksi resolver: moodi, hero, plan-rivit, seuraava askel — today + food mock.
 */
export function resolveCoachDayModel(input: CoachEngineInput): CoachDayModel {
  const {
    locale,
    t,
    profile,
    todayIdx,
    foodOnly,
    isRestDay,
    resolvedFlow,
    flowSkipKind,
    hasWorkoutLoggedToday,
    hasSetLogsToday,
    isCompleted,
    justFinishedWorkoutSession,
  } = input;

  const pkg = getProgramPackage(profile.selectedPackageId);
  const kind = displayKind(foodOnly, isRestDay);

  const todayDisplay = resolveTodayDisplayMock({
    locale,
    packageId: normalizeProgramPackageId(profile.selectedPackageId),
    planBias: pkg.planBias,
    mealCount: pkg.mealCount,
    mealStyle: pkg.mealStyle,
    todayIdx,
    kind,
    goal: profile.goal,
  });

  const foodDay = resolveFoodDayMock({
    mealCount: pkg.mealCount,
    style: pkg.mealStyle,
    goal: profile.goal,
    locale,
    packageId: profile.selectedPackageId,
    planBias: pkg.planBias,
    now: input.now,
  });

  const realProg = getCoachProgramContent(profile.selectedPackageId);
  const realWorkout = getWorkoutDayContent(profile.selectedPackageId, todayIdx);
  const realFood = getFoodDayContent(profile.selectedPackageId, todayIdx);

  let heroTitle = todayDisplay.heroTitle;
  let heroGuidance = todayDisplay.heroGuidance;
  let planWorkoutLabel = todayDisplay.planWorkoutLabel;
  let planFoodLabel = foodDay.foodPlanLabel;
  let programFocusLabel = todayDisplay.programSituationFocus;
  let situationFoodWhenNoLogs = todayDisplay.situationFoodWhenNoLogs;

  const skipWorkoutRelabel =
    resolvedFlow === "skipped" &&
    (flowSkipKind === "light" || flowSkipKind === "tomorrow");

  if (resolvedFlow === "skipped" && flowSkipKind === "light") {
    heroTitle = t("todayView.focusTitleLightDay");
    heroGuidance = t("todayView.heroSkippedLight");
    planWorkoutLabel = locale === "fi" ? "Kevyt päivä" : "Light day";
  } else if (resolvedFlow === "skipped" && flowSkipKind === "tomorrow") {
    heroTitle = t("todayView.focusTitleDefer");
    heroGuidance = t("todayView.heroSkippedTomorrow");
    planWorkoutLabel = locale === "fi" ? "Siirto huomiselle" : "Moved to tomorrow";
  }

  if (!skipWorkoutRelabel && realProg) {
    programFocusLabel = realProg.programFocusLabel;
  }

  if (!skipWorkoutRelabel && realWorkout) {
    heroTitle = realWorkout.title;
    heroGuidance = realWorkout.guidance;
    planWorkoutLabel = realWorkout.focus.trim()
      ? realWorkout.focus
      : realWorkout.title;
  }

  if (realFood) {
    planFoodLabel = realFood.foodPlanLabel;
    situationFoodWhenNoLogs = coachFoodSituationLine(realFood);
  }

  if (!skipWorkoutRelabel) {
    planWorkoutLabel = formatWorkoutPlanLabel({
      locale,
      mockPlanLine: planWorkoutLabel,
      hasSessionLogToday: hasWorkoutLoggedToday,
      hasSetLogsToday,
    });
  }

  if (!planFoodLabel.trim()) {
    planFoodLabel = foodPlanFallbackLabel(locale);
  }

  const cta = primaryCtaFromState(input);
  const mode = deriveMode(input);

  const inlineStatus =
    justFinishedWorkoutSession && isCompleted
      ? t("todayView.workoutJustDoneLine")
      : isCompleted
        ? t("todayView.dayCompletedHint")
        : null;

  const primaryCta: { href: string; label: string } | null =
    isCompleted || !cta.href?.trim()
      ? null
      : { href: cta.href, label: t(cta.labelKey) };

  const statusValue = deriveStatusValue(input, mode, t);

  const workoutContextLine = deriveWorkoutContextLine(
    mode,
    planWorkoutLabel,
    planFoodLabel,
    heroTitle,
    statusValue,
  );

  return {
    mode,
    heroTitle,
    heroGuidance,
    workoutPlanLabel: planWorkoutLabel,
    foodPlanLabel: planFoodLabel,
    programFocusLabel,
    nextAction: cta.next,
    primaryCta,
    inlineStatus,
    situationFoodWhenNoLogs,
    statusValue,
    workoutContextLine,
  };
}
