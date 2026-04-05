"use client";

import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { Container } from "@/components/ui/Container";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useTranslation } from "@/hooks/useTranslation";
import { isFoodOnlyMode } from "@/lib/appUsageMode";
import {
  buildCoachDailyPlanForSession,
  normalizeProfileForEngine,
} from "@/lib/coach";
import {
  FOOD_LOG_CHANGED,
  subscribeCoachEvent,
  TODAY_STATE_CHANGED,
} from "@/lib/coachEvents";
import {
  foodPlanFallbackLabel,
  formatWorkoutPlanLabel,
} from "@/lib/coachDisplayLabels";
import { dayKeyFromDate, normalizeDayKey } from "@/lib/dateKey";
import { getMondayBasedIndex } from "@/lib/plan";
import { isDayMarkedDone, setPaywallV1Ack } from "@/lib/storage";
import { setSubscribed } from "@/lib/subscription";
import { shouldShowTodayPaywallOverlay } from "@/lib/paywallPolicy";
import { PaywallV1Panel } from "@/components/paywall/PaywallV1Panel";
import { TodayFocusCard } from "@/components/today/TodayFocusCard";
import { trackEvent } from "@/lib/analytics";
import {
  EXCEPTION_STATE_CHANGED,
  loadActiveExceptionForDay,
  saveActiveException,
} from "@/lib/exceptionStorage";
import { loadMinimumDayForDay, saveMinimumDayForDay } from "@/lib/minimumDayStorage";
import { MINIMUM_DAY_CHANGED } from "@/lib/minimumDayStorage";
import { loadWorkoutSessions, WORKOUT_LOG_CHANGED } from "@/lib/workoutLogStorage";
import {
  completedTrainingDaysThisWeek,
  plannedTrainingDaysThisWeek,
} from "@/lib/todayBrief";
import { getProgramPackage, normalizeProgramPackageId } from "@/lib/programPackages";
import { resolveTodayDisplayMock } from "@/data/todayContent.mock";
import type { Locale } from "@/lib/i18n";
import { loadFoodLog } from "@/lib/foodStorage";
import { hasSetLogsForDay } from "@/lib/workoutStore";
import { consumeJustCompletedWorkoutFlag } from "@/lib/workoutFlowFlags";
import {
  clearFeedbackForDay,
  loadTodayFlowRecord,
  markTodaySkipped,
  readActiveFeedback,
  setPrimaryCtaTapped,
  TODAY_FLOW_CHANGED,
} from "@/lib/todayFlowStorage";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { TodayFlowUiState } from "@/lib/todayFlowStorage";

function resolveTodayFlowUi(args: {
  isDayDone: boolean;
  hasWorkoutLog: boolean;
  isRest: boolean;
  foodOnly: boolean;
  dayKey: string;
}): TodayFlowUiState {
  const { isDayDone, hasWorkoutLog, isRest, foodOnly, dayKey } = args;
  if (isDayDone) return "completed";
  const rec = loadTodayFlowRecord(dayKey);
  if (rec?.flowState === "skipped") return "skipped";
  if (foodOnly || isRest) {
    if (rec?.primaryTapped) return "in_progress";
    return "not_started";
  }
  if (hasWorkoutLog) return "in_progress";
  if (rec?.flowState === "in_progress" || rec?.primaryTapped) {
    return "in_progress";
  }
  return "not_started";
}

export function TodayView() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const paywallOpenTracked = useRef(false);
  const profile = useClientProfile();
  const [now] = useState(() => new Date());
  const [isCompleted, setIsCompleted] = useState(() => isDayMarkedDone(now));
  const [paywallGate, setPaywallGate] = useState(0);
  const [paywallOverlayDismissed, setPaywallOverlayDismissed] =
    useState(false);
  const [workoutLogTick, setWorkoutLogTick] = useState(0);
  const [flowTick, setFlowTick] = useState(0);
  const [notTodayOpen, setNotTodayOpen] = useState(false);
  const [workoutFeedbackOn, setWorkoutFeedbackOn] = useState(false);
  const lastWorkoutFbDay = useRef<string | null>(null);
  const [justFinishedWorkoutSession, setJustFinishedWorkoutSession] =
    useState(false);
  const workoutFlagConsumedRef = useRef(false);
  const [coachDataTick, setCoachDataTick] = useState(0);

  useLayoutEffect(() => {
    if (workoutFlagConsumedRef.current) return;
    workoutFlagConsumedRef.current = true;
    setJustFinishedWorkoutSession(consumeJustCompletedWorkoutFlag());
  }, []);

  useEffect(() => {
    const bump = () => setCoachDataTick((x) => x + 1);
    const u1 = subscribeCoachEvent(FOOD_LOG_CHANGED, bump);
    const u2 = subscribeCoachEvent(TODAY_STATE_CHANGED, bump);
    return () => {
      u1();
      u2();
    };
  }, []);

  const dayKeyToday = useMemo(() => dayKeyFromDate(now), [now]);

  useEffect(() => {
    setIsCompleted(isDayMarkedDone(now));
  }, [now, pathname]);

  useEffect(() => {
    const up = () => setWorkoutLogTick((x) => x + 1);
    window.addEventListener(WORKOUT_LOG_CHANGED, up);
    return () => window.removeEventListener(WORKOUT_LOG_CHANGED, up);
  }, []);

  useEffect(() => {
    const bump = () => setFlowTick((x) => x + 1);
    window.addEventListener(TODAY_FLOW_CHANGED, bump);
    window.addEventListener(MINIMUM_DAY_CHANGED, bump);
    window.addEventListener(EXCEPTION_STATE_CHANGED, bump);
    return () => {
      window.removeEventListener(TODAY_FLOW_CHANGED, bump);
      window.removeEventListener(MINIMUM_DAY_CHANGED, bump);
      window.removeEventListener(EXCEPTION_STATE_CHANGED, bump);
    };
  }, []);

  useEffect(() => {
    const r = loadTodayFlowRecord(dayKeyToday);
    if (r?.feedbackUntil && Date.now() > r.feedbackUntil) {
      clearFeedbackForDay(dayKeyToday);
      setFlowTick((x) => x + 1);
    }
  }, [dayKeyToday, flowTick]);

  const normalizedProfile = useMemo(
    () => (profile ? normalizeProfileForEngine(profile) : null),
    [profile],
  );

  const activeException = useMemo(
    () => loadActiveExceptionForDay(dayKeyToday),
    [dayKeyToday, flowTick],
  );

  const minimumDayActive = useMemo(
    () => loadMinimumDayForDay(dayKeyToday),
    [dayKeyToday, flowTick],
  );

  const plan = useMemo(() => {
    if (!normalizedProfile) return null;
    return buildCoachDailyPlanForSession({
      profile: normalizedProfile,
      now,
      locale,
      activeException,
      minimumDayActive,
    });
  }, [normalizedProfile, now, locale, activeException, minimumDayActive]);

  const todayIdx = useMemo(() => getMondayBasedIndex(now), [now]);
  const isRestDay = useMemo(() => {
    if (!plan) return true;
    return Boolean(plan.weeklyPlan.days[todayIdx]?.isRest);
  }, [plan, todayIdx]);

  const foodOnly = Boolean(profile && isFoodOnlyMode(profile));

  const hasWorkoutLoggedToday = useMemo(() => {
    void workoutLogTick;
    void coachDataTick;
    const dk = normalizeDayKey(dayKeyToday);
    return loadWorkoutSessions().some(
      (s) => normalizeDayKey(s.dayKey) === dk,
    );
  }, [dayKeyToday, workoutLogTick, coachDataTick]);

  const hasSetLogsToday = useMemo(() => {
    void coachDataTick;
    void workoutLogTick;
    return hasSetLogsForDay(dayKeyToday);
  }, [dayKeyToday, coachDataTick, workoutLogTick]);

  const foodLogs = useMemo(() => {
    void workoutLogTick;
    void flowTick;
    void coachDataTick;
    return loadFoodLog(now);
  }, [now, workoutLogTick, flowTick, coachDataTick]);

  const todayDisplayBase = useMemo(() => {
    if (!profile) return null;
    const pkg = getProgramPackage(profile.selectedPackageId);
    const kind = foodOnly
      ? ("food_only" as const)
      : isRestDay
        ? ("rest" as const)
        : ("training" as const);
    return resolveTodayDisplayMock({
      locale: locale as Locale,
      packageId: normalizeProgramPackageId(profile.selectedPackageId),
      planBias: pkg.planBias,
      mealCount: pkg.mealCount,
      mealStyle: pkg.mealStyle,
      todayIdx,
      kind,
      goal: profile.goal,
    });
  }, [profile, foodOnly, isRestDay, todayIdx, locale]);

  const todayBriefRows = useMemo(() => {
    if (!profile) return [];
    void workoutLogTick;
    void coachDataTick;
    const sessions = loadWorkoutSessions();
    const weekValue = foodOnly
      ? t("todayView.briefWeekFoodOnly")
      : t("todayView.briefWeekValue", {
          done: completedTrainingDaysThisWeek(sessions, now),
          plan: plannedTrainingDaysThisWeek(profile, now),
        });
    const foodValue =
      foodLogs.length > 0
        ? t("todayView.briefFoodLogs", { n: foodLogs.length })
        : (todayDisplayBase?.situationFoodWhenNoLogs ??
          t("todayView.briefFoodLogs", { n: 0 }));
    return [
      { label: t("todayView.briefWeek"), value: weekValue },
      {
        label: t("todayView.briefFood"),
        value: foodValue,
      },
    ];
  }, [
    profile,
    now,
    foodOnly,
    t,
    workoutLogTick,
    foodLogs,
    todayDisplayBase,
    coachDataTick,
  ]);

  const programBlockInfo = useMemo(() => {
    if (!profile) return { title: "", focus: "" };
    const pkg = getProgramPackage(profile.selectedPackageId);
    const title = locale === "en" ? pkg.nameEn : pkg.nameFi;
    const focus = todayDisplayBase?.programSituationFocus ?? "";
    return { title, focus };
  }, [profile, locale, todayDisplayBase]);

  const showPaywallV1 = useMemo(
    () => shouldShowTodayPaywallOverlay(paywallOverlayDismissed),
    [paywallOverlayDismissed, isCompleted, pathname, paywallGate],
  );

  useEffect(() => {
    if (!showPaywallV1 || paywallOpenTracked.current) return;
    paywallOpenTracked.current = true;
    trackEvent("paywall_open", { reason: "engagement_milestone" });
  }, [showPaywallV1]);

  const onPaywallContinue = useCallback(() => {
    trackEvent("paywall_convert");
    setSubscribed(true);
    setPaywallV1Ack();
    setPaywallOverlayDismissed(false);
    setPaywallGate((x) => x + 1);
  }, []);

  const onPaywallBack = useCallback(() => {
    setPaywallOverlayDismissed(true);
    router.push("/settings");
  }, [router]);

  const flowRecord = useMemo(
    () => loadTodayFlowRecord(dayKeyToday),
    [dayKeyToday, flowTick],
  );

  const resolvedFlow = useMemo(
    () =>
      resolveTodayFlowUi({
        isDayDone: isCompleted,
        hasWorkoutLog: hasWorkoutLoggedToday || hasSetLogsToday,
        isRest: isRestDay,
        foodOnly,
        dayKey: dayKeyToday,
      }),
    [
      isCompleted,
      hasWorkoutLoggedToday,
      hasSetLogsToday,
      isRestDay,
      foodOnly,
      dayKeyToday,
      flowTick,
    ],
  );

  useEffect(() => {
    if (!hasWorkoutLoggedToday || isRestDay || foodOnly) return;
    if (lastWorkoutFbDay.current === dayKeyToday) return;
    lastWorkoutFbDay.current = dayKeyToday;
    setWorkoutFeedbackOn(true);
    const id = window.setTimeout(() => setWorkoutFeedbackOn(false), 8000);
    return () => window.clearTimeout(id);
  }, [hasWorkoutLoggedToday, dayKeyToday, isRestDay, foodOnly]);

  const activeStorageFeedback = useMemo(
    () => readActiveFeedback(dayKeyToday),
    [dayKeyToday, flowTick],
  );

  const feedbackLine = useMemo(() => {
    if (activeStorageFeedback) {
      return activeStorageFeedback.kind === "good_continue"
        ? t("todayView.feedbackGoodContinue")
        : t("todayView.feedbackDoneDay");
    }
    if (workoutFeedbackOn) return t("todayView.feedbackGoodContinue");
    return null;
  }, [activeStorageFeedback, workoutFeedbackOn, t]);

  const flowStatusLine = useMemo(() => {
    switch (resolvedFlow) {
      case "not_started":
        return t("todayView.progressAriaNotStarted");
      case "in_progress":
        return t("todayView.progressAriaInProgress");
      case "completed":
        return t("todayView.progressAriaCompleted");
      case "skipped":
        return t("todayView.progressAriaSkipped");
      default:
        return t("todayView.progressAriaNotStarted");
    }
  }, [resolvedFlow, t]);

  const onPrimaryNavigate = useCallback(() => {
    setPrimaryCtaTapped(dayKeyToday);
  }, [dayKeyToday]);

  const onPickLightDay = useCallback(() => {
    saveMinimumDayForDay(dayKeyToday);
    markTodaySkipped({
      dayKey: dayKeyToday,
      kind: "light",
      feedback: "good_continue",
    });
    setNotTodayOpen(false);
  }, [dayKeyToday]);

  const onPickTomorrow = useCallback(() => {
    saveActiveException({
      id: "skipped_session",
      severity: "light",
      dayKey: dayKeyToday,
    });
    markTodaySkipped({
      dayKey: dayKeyToday,
      kind: "tomorrow",
      feedback: "good_continue",
    });
    setNotTodayOpen(false);
  }, [dayKeyToday]);

  if (profile === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[15px] text-muted-2">
        {t("common.loading")}
      </div>
    );
  }

  if (!profile) {
    return <CoachProfileMissingFallback />;
  }

  if (!plan) {
    return (
      <main className="coach-page">
        <Container size="phone" className="px-5 py-12">
          <p className="text-[13px] leading-relaxed text-muted" role="status">
            {t("fallback.sharpensWithUse")}
          </p>
        </Container>
      </main>
    );
  }

  let heroTitle: string;
  let heroGuidance: string;
  let planWorkoutLabel: string;
  let planFoodLabel: string;

  if (resolvedFlow === "skipped" && flowRecord?.skipKind === "light") {
    heroTitle = t("todayView.focusTitleLightDay");
    heroGuidance = t("todayView.heroSkippedLight");
    planWorkoutLabel =
      locale === "fi" ? "Kevyt päivä" : "Light day";
    planFoodLabel = todayDisplayBase?.planFoodLabel ?? "";
  } else if (resolvedFlow === "skipped" && flowRecord?.skipKind === "tomorrow") {
    heroTitle = t("todayView.focusTitleDefer");
    heroGuidance = t("todayView.heroSkippedTomorrow");
    planWorkoutLabel =
      locale === "fi" ? "Siirto huomiselle" : "Moved to tomorrow";
    planFoodLabel = todayDisplayBase?.planFoodLabel ?? "";
  } else if (todayDisplayBase) {
    heroTitle = todayDisplayBase.heroTitle;
    heroGuidance = todayDisplayBase.heroGuidance;
    planWorkoutLabel = todayDisplayBase.planWorkoutLabel;
    planFoodLabel = todayDisplayBase.planFoodLabel;
  } else {
    heroTitle = "";
    heroGuidance = "";
    planWorkoutLabel = "";
    planFoodLabel = "";
  }

  const skipWorkoutPlanRelabel =
    resolvedFlow === "skipped" &&
    (flowRecord?.skipKind === "light" || flowRecord?.skipKind === "tomorrow");

  if (!skipWorkoutPlanRelabel) {
    planWorkoutLabel = formatWorkoutPlanLabel({
      locale: locale as Locale,
      mockPlanLine: planWorkoutLabel,
      hasSessionLogToday: hasWorkoutLoggedToday,
      hasSetLogsToday: hasSetLogsToday,
    });
  }

  if (!planFoodLabel.trim()) {
    planFoodLabel = foodPlanFallbackLabel(locale as Locale);
  }

  const primaryCta = (() => {
    if (resolvedFlow === "skipped") {
      return { href: "/food/day" as const, label: t("todayView.ctaGoFood") };
    }
    if (foodOnly) {
      if (resolvedFlow === "in_progress") {
        return { href: "/food" as const, label: t("todayView.ctaContinueFood") };
      }
      return { href: "/food" as const, label: t("todayView.ctaGoFood") };
    }
    if (isRestDay) {
      if (resolvedFlow === "in_progress") {
        return { href: "/food" as const, label: t("todayView.ctaContinueFood") };
      }
      return { href: "/food" as const, label: t("todayView.ctaGoFood") };
    }
    if (hasWorkoutLoggedToday || hasSetLogsToday) {
      return { href: "/food" as const, label: t("todayView.ctaGoFood") };
    }
    if (resolvedFlow === "in_progress") {
      return { href: "/workout" as const, label: t("todayView.ctaContinueWorkout") };
    }
    return { href: "/workout" as const, label: t("todayView.cta") };
  })();

  const showNotToday =
    !isCompleted && resolvedFlow !== "skipped";

  const showCompletedDayGate =
    isCompleted && !justFinishedWorkoutSession;

  return (
    <>
      <main className="coach-today-depth flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden pt-1.5 sm:pt-2">
        <Container
          size="phone"
          className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-[max(1.35rem,calc(env(safe-area-inset-bottom,0px)+4.35rem))] pt-0.5 sm:px-5"
        >
          {!showCompletedDayGate ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {justFinishedWorkoutSession && isCompleted ? (
                <p
                  className="mb-3 px-0.5 text-center text-[12px] font-medium leading-snug text-muted-2/80"
                  role="status"
                >
                  {t("todayView.workoutJustDoneLine")}
                </p>
              ) : null}
              <TodayFocusCard
                heroTitle={heroTitle}
                heroGuidance={heroGuidance}
                planWorkoutLabel={planWorkoutLabel}
                planFoodLabel={planFoodLabel}
                primaryCta={primaryCta}
                onPrimaryNavigate={onPrimaryNavigate}
                feedbackLine={feedbackLine}
                flowStatusLine={flowStatusLine}
                statusRowLabel={t("todayView.briefStatus")}
                situationHeading={t("todayView.situationHeading")}
                briefRows={todayBriefRows}
                programEyebrow={
                  foodOnly
                    ? t("todayView.programBlockEyebrowFood")
                    : t("todayView.programBlockEyebrow")
                }
                programTitle={programBlockInfo.title}
                programFocus={programBlockInfo.focus}
                afterCta={
                  showNotToday ? (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setNotTodayOpen((o) => !o)}
                        className="text-[11px] font-medium leading-snug text-muted-2/58 underline decoration-white/[0.12] underline-offset-[5px] transition hover:text-muted-2/75 hover:decoration-white/[0.22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-[12px]"
                        aria-expanded={notTodayOpen}
                      >
                        {t("todayView.notToday")}
                      </button>
                      {notTodayOpen ? (
                        <div className="mt-2.5 flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={onPickLightDay}
                            className="bg-transparent px-2 py-1.5 text-[11px] font-normal leading-snug text-muted-2/62 transition hover:text-muted-2/78 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            {t("todayView.optionLightDay")}
                          </button>
                          <button
                            type="button"
                            onClick={onPickTomorrow}
                            className="bg-transparent px-2 py-1.5 text-[11px] font-normal leading-snug text-muted-2/62 transition hover:text-muted-2/78 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            {t("todayView.optionTomorrow")}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 px-0.5 pt-0.5 text-left sm:pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {t("todayView.doneEyebrow")}
              </p>
              <h1 className="text-[1.3rem] font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-[1.38rem]">
                {t("todayView.heroDoneTitle")}
              </h1>
              <p
                className="text-[15px] font-medium leading-snug text-foreground/88"
                id="today-done-guidance"
              >
                {t("todayView.heroDoneGuidance")}
              </p>
              <Link
                href="/plan"
                scroll={false}
                aria-describedby="today-done-guidance"
                className="mt-1 flex min-h-[56px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent px-5 text-[18px] font-semibold tracking-[-0.02em] text-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.45)] ring-1 ring-white/10 transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t("todayView.dayDoneSimple")}
              </Link>
            </div>
          )}
        </Container>
      </main>
      {showPaywallV1 ? (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/[0.97] px-4 py-8 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="paywall-v1-title"
        >
          <PaywallV1Panel
            engagementOverlay
            onContinue={onPaywallContinue}
            onBack={onPaywallBack}
          />
        </div>
      ) : null}
    </>
  );
}
