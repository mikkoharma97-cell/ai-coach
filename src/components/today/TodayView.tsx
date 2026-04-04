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
import { dayKeyFromDate } from "@/lib/dateKey";
import { buildFoodDayLines, foodMainLineForToday } from "@/lib/food/foodDayContent";
import { getMondayBasedIndex } from "@/lib/plan";
import { isDayMarkedDone, setPaywallV1Ack } from "@/lib/storage";
import { setSubscribed } from "@/lib/subscription";
import { shouldShowTodayPaywallOverlay } from "@/lib/paywallPolicy";
import { PaywallV1Panel } from "@/components/paywall/PaywallV1Panel";
import { TodayFocusCard } from "@/components/today/TodayFocusCard";
import { TodayFoodHub } from "@/components/today/TodayFoodHub";
import { TodayStatusHub } from "@/components/today/TodayStatusHub";
import { TodayWorkoutHub } from "@/components/today/TodayWorkoutHub";
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
  clearFeedbackForDay,
  loadTodayFlowRecord,
  markTodaySkipped,
  readActiveFeedback,
  setPrimaryCtaTapped,
  TODAY_FLOW_CHANGED,
} from "@/lib/todayFlowStorage";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { TodayFlowUiState } from "@/lib/todayFlowStorage";

function trainingSessionIndexThisWeek(
  plan: CoachDailyPlan,
  ref: Date,
): number | null {
  const todayIdx = getMondayBasedIndex(ref);
  const days = plan.weeklyPlan.days;
  let n = 0;
  for (let i = 0; i <= todayIdx; i++) {
    if (!days[i]?.isRest) {
      n++;
      if (i === todayIdx) return n;
    }
  }
  return null;
}

function mealCountFromProfile(p: OnboardingAnswers): number {
  if (p.mealsPerDay) return p.mealsPerDay;
  return p.mealStructure === "snack_forward" ? 4 : 3;
}

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

function progressPercentFor(flow: TodayFlowUiState): number {
  switch (flow) {
    case "not_started":
      return 14;
    case "in_progress":
      return 58;
    case "skipped":
      return 36;
    case "completed":
      return 100;
    default:
      return 12;
  }
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

  const sessionIdx = useMemo(() => {
    if (!plan) return null;
    return trainingSessionIndexThisWeek(plan, now);
  }, [plan, now]);

  const dayNum = sessionIdx ?? 1;

  const todayIdx = useMemo(() => getMondayBasedIndex(now), [now]);
  const isRestDay = useMemo(() => {
    if (!plan) return true;
    return Boolean(plan.weeklyPlan.days[todayIdx]?.isRest);
  }, [plan, todayIdx]);

  const foodOnly = Boolean(profile && isFoodOnlyMode(profile));

  const hasWorkoutLoggedToday = useMemo(() => {
    void workoutLogTick;
    return loadWorkoutSessions().some((s) => s.dayKey === dayKeyToday);
  }, [dayKeyToday, workoutLogTick]);

  const foodPreviewLines = useMemo(() => {
    if (!plan || !profile) return [];
    const lines = buildFoodDayLines(plan, profile, t);
    return lines.slice(0, 2);
  }, [plan, profile, t]);

  const mealN = profile ? mealCountFromProfile(profile) : 0;

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

  const statusLines = useMemo(() => {
    if (!plan) return [];
    const out: string[] = [];
    if (plan.shiftToday) {
      out.push(t(plan.shiftToday.badgeKey));
    }
    if (plan.systemLine) {
      out.push(plan.systemLine);
    }
    if (minimumDayActive) {
      out.push(t("todayView.minimumDayHint"));
    }
    return out.slice(0, 1);
  }, [plan, minimumDayActive, t]);

  const flowRecord = useMemo(
    () => loadTodayFlowRecord(dayKeyToday),
    [dayKeyToday, flowTick],
  );

  const resolvedFlow = useMemo(
    () =>
      resolveTodayFlowUi({
        isDayDone: isCompleted,
        hasWorkoutLog: hasWorkoutLoggedToday,
        isRest: isRestDay,
        foodOnly,
        dayKey: dayKeyToday,
      }),
    [
      isCompleted,
      hasWorkoutLoggedToday,
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

  const progressAriaLabel = useMemo(() => {
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

  const dayEntry = plan.weeklyPlan.days[todayIdx];
  const restHeroLine = isRestDay
    ? dayEntry?.workoutLine?.trim() || t("todayView.focusBodyRest")
    : "";

  const workoutSummaryLine = !isRestDay
    ? (dayEntry?.workoutLine || plan.todayWorkout).trim() || plan.todayWorkout
    : "";

  const showWorkoutSummaryParagraph = !isRestDay;

  const workoutStatusLabel = isRestDay
    ? t("todayView.workoutStatusRest")
    : hasWorkoutLoggedToday
      ? t("todayView.workoutStatusDone")
      : t("todayView.workoutStatusPending");

  let hubHeroBody = foodOnly
    ? foodMainLineForToday(plan.todayFoodTask)
    : isRestDay
      ? restHeroLine
      : t("todayView.heroWorkout", { day: dayNum });

  let focusTitle = t("todayView.focusTitle");

  if (resolvedFlow === "skipped" && flowRecord?.skipKind === "light") {
    hubHeroBody = t("todayView.heroSkippedLight");
    focusTitle = t("todayView.focusTitleLightDay");
  } else if (resolvedFlow === "skipped" && flowRecord?.skipKind === "tomorrow") {
    hubHeroBody = t("todayView.heroSkippedTomorrow");
    focusTitle = t("todayView.focusTitleDefer");
  }

  const primaryCta = (() => {
    if (isCompleted) {
      return { href: "/plan" as const, label: t("todayView.ctaTomorrow") };
    }
    if (resolvedFlow === "skipped") {
      return { href: "/food/day" as const, label: t("todayView.focusCtaFood") };
    }
    const cont = t("todayView.ctaContinue");
    if (resolvedFlow === "in_progress") {
      if (foodOnly) return { href: "/food" as const, label: cont };
      if (isRestDay) return { href: "/food/day" as const, label: cont };
      return { href: "/workout" as const, label: cont };
    }
    if (foodOnly) {
      return { href: "/food" as const, label: t("todayView.focusCtaFood") };
    }
    if (isRestDay) {
      return { href: "/food/day" as const, label: t("todayView.focusCtaFood") };
    }
    return { href: "/workout" as const, label: t("todayView.cta") };
  })();

  const hubBlockClass =
    "mt-2.5 rounded-[var(--radius-md)] border border-white/[0.05] bg-white/[0.015] px-3 py-2.5 text-[13px] text-muted/90";

  const showWorkoutSecondary =
    !foodOnly && resolvedFlow !== "skipped";

  const secondaryBlocks: ReactNode[] = [];
  if (showWorkoutSecondary) {
    secondaryBlocks.push(
      <TodayWorkoutHub
        key="w"
        hubBlockClass={hubBlockClass}
        sectionTitle={t("todayView.hubSectionWorkout")}
        workoutStatusLabel={workoutStatusLabel}
        showSummaryLine={showWorkoutSummaryParagraph}
        summaryLine={workoutSummaryLine}
      />,
    );
  }
  secondaryBlocks.push(
    <TodayFoodHub
      key="f"
      hubBlockClass={hubBlockClass}
      sectionTitle={t("todayView.hubSectionFood")}
      mealsLine={t("todayView.mealsLine", { n: mealN })}
      previewLines={foodPreviewLines}
    />,
  );
  if (statusLines.length > 0) {
    secondaryBlocks.push(
      <TodayStatusHub
        key="s"
        hubBlockClass={hubBlockClass}
        sectionTitle={t("todayView.hubSectionStatus")}
        lines={statusLines}
      />,
    );
  }
  const visibleSecondary = secondaryBlocks.slice(0, 3);

  const showNotToday =
    !isCompleted && resolvedFlow !== "skipped";

  return (
    <>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden bg-[var(--background)] pt-2 sm:pt-3">
        <Container
          size="phone"
          className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-[max(2.25rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] pt-1 sm:px-5"
        >
          {!isCompleted ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <TodayFocusCard
                focusEyebrow={t("todayView.focusEyebrow")}
                focusTitle={focusTitle}
                heroBody={hubHeroBody}
                progressPercent={progressPercentFor(resolvedFlow)}
                primaryCta={primaryCta}
                onPrimaryNavigate={onPrimaryNavigate}
                showNotToday={showNotToday}
                notTodayOpen={notTodayOpen}
                onToggleNotToday={() => setNotTodayOpen((o) => !o)}
                onPickLightDay={onPickLightDay}
                onPickTomorrow={onPickTomorrow}
                feedbackLine={feedbackLine}
                notTodayLabel={t("todayView.notToday")}
                optionLightLabel={t("todayView.optionLightDay")}
                optionTomorrowLabel={t("todayView.optionTomorrow")}
                progressAriaLabel={progressAriaLabel}
              />

              <section
                className="mt-6 border-t border-white/[0.04] pt-5 opacity-[0.82]"
                aria-labelledby="today-secondary-heading"
              >
                <h2
                  id="today-secondary-heading"
                  className="mb-2.5 text-center text-[10px] font-medium uppercase tracking-[0.16em] text-muted-2/75"
                >
                  {t("todayView.secondarySectionHeading")}
                </h2>
                <div className="flex min-h-0 min-w-0 flex-col gap-2.5">
                  {visibleSecondary}
                </div>
              </section>
            </div>
          ) : (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-8 pb-2 pt-8 text-center">
              <p
                className="line-clamp-3 shrink-0 text-balance text-[clamp(1.05rem,4vw,1.35rem)] font-medium leading-snug tracking-[-0.02em] text-muted"
                role="status"
              >
                {t("todayView.dayDoneSimple")}
              </p>
              <div className="flex w-full min-w-0 flex-col">
                <Link
                  href="/plan"
                  className="flex min-h-[58px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent px-5 text-[18px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] ring-1 ring-white/10 transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("todayView.ctaTomorrow")}
                </Link>
              </div>
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
            onContinue={onPaywallContinue}
            onBack={onPaywallBack}
          />
        </div>
      ) : null}
    </>
  );
}
