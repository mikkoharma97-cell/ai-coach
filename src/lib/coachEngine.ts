/**
 * Coach Engine V1A — yksi päivämalli + resolver (mock-lähteet).
 * UI voi kytkeä myöhemmin; resolver on ajettavissa erikseen.
 */
import {
  foodPlanFallbackLabel,
  formatWorkoutPlanLabel,
} from "@/lib/coachDisplayLabels";
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
  /** Valmis CTA-teksti (käännös tehty resolverissa) */
  nextActionLabel: string;
  /** Lyhyt tilaviesti (esim. treeni juuri tehty) tai null */
  inlineStatus: string | null;
  /** Pää-CTA:n reitti — `none` / tyhjä → getCoachNextActionRoute palauttaa null */
  ctaHref: string | null;
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

export function getCoachNextActionRoute(model: CoachDayModel): string | null {
  const h = model.ctaHref?.trim();
  return h ? h : null;
}

export function getCoachNextActionLabel(model: CoachDayModel): string {
  return model.nextActionLabel;
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

  let heroTitle = todayDisplay.heroTitle;
  let heroGuidance = todayDisplay.heroGuidance;
  let planWorkoutLabel = todayDisplay.planWorkoutLabel;
  let planFoodLabel = foodDay.foodPlanLabel;

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

  return {
    mode,
    heroTitle,
    heroGuidance,
    workoutPlanLabel: planWorkoutLabel,
    foodPlanLabel: planFoodLabel,
    programFocusLabel: todayDisplay.programSituationFocus,
    nextAction: cta.next,
    nextActionLabel: isCompleted ? "" : t(cta.labelKey),
    inlineStatus,
    ctaHref: cta.href,
  };
}
