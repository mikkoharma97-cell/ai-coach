"use client";

import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { Container } from "@/components/ui/Container";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useCoachDayModel } from "@/hooks/useCoachDayModel";
import { useTranslation } from "@/hooks/useTranslation";
import { setPaywallV1Ack } from "@/lib/storage";
import { setSubscribed } from "@/lib/subscription";
import { shouldShowTodayPaywallOverlay } from "@/lib/paywallPolicy";
import { PaywallV1Panel } from "@/components/paywall/PaywallV1Panel";
import { TodayFocusCard } from "@/components/today/TodayFocusCard";
import { trackEvent } from "@/lib/analytics";
import { saveActiveException } from "@/lib/exceptionStorage";
import { saveMinimumDayForDay } from "@/lib/minimumDayStorage";
import {
  anchorKindForDay,
  isAnchorDone,
  setAnchorDone,
} from "@/lib/dayAnchorStorage";
import { consumeJustCompletedWorkoutFlag } from "@/lib/workoutFlowFlags";
import {
  markTodaySkipped,
  readActiveFeedback,
  setPrimaryCtaTapped,
} from "@/lib/todayFlowStorage";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export function TodayView() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const paywallOpenTracked = useRef(false);
  const profile = useClientProfile();
  const [paywallGate, setPaywallGate] = useState(0);
  const [paywallOverlayDismissed, setPaywallOverlayDismissed] =
    useState(false);
  const [notTodayOpen, setNotTodayOpen] = useState(false);
  const [workoutFeedbackOn, setWorkoutFeedbackOn] = useState(false);
  const lastWorkoutFbDay = useRef<string | null>(null);
  const [justFinishedWorkoutSession, setJustFinishedWorkoutSession] =
    useState(false);
  const workoutFlagConsumedRef = useRef(false);
  const [anchorDone, setAnchorDoneState] = useState(false);

  useLayoutEffect(() => {
    if (workoutFlagConsumedRef.current) return;
    workoutFlagConsumedRef.current = true;
    setJustFinishedWorkoutSession(consumeJustCompletedWorkoutFlag());
  }, []);

  const {
    coachDayModel,
    resolvedFlow,
    dayKeyToday,
    flowTick,
    isCompleted,
    isRestDay,
    foodOnly,
    hasWorkoutLoggedToday,
    hasSetLogsToday,
    foodLogs,
    plan,
  } = useCoachDayModel({ justFinishedWorkoutSession });

  useEffect(() => {
    setAnchorDoneState(isAnchorDone(dayKeyToday));
  }, [dayKeyToday, flowTick]);

  const dayFlowLabel = useMemo(() => {
    if (isCompleted) return t("todayView.dayFlowDone");
    const active =
      hasWorkoutLoggedToday ||
      hasSetLogsToday ||
      foodLogs.length > 0 ||
      resolvedFlow === "in_progress";
    if (active) return t("todayView.dayFlowActive");
    return t("todayView.dayFlowStart");
  }, [
    isCompleted,
    hasWorkoutLoggedToday,
    hasSetLogsToday,
    foodLogs.length,
    resolvedFlow,
    t,
  ]);

  const statusWorkout = useMemo(() => {
    if (foodOnly) return t("todayView.statusWorkoutNa");
    if (isRestDay) return t("todayView.workoutStatusRest");
    if (hasWorkoutLoggedToday || hasSetLogsToday) {
      return t("todayView.workoutStatusDone");
    }
    if (resolvedFlow === "in_progress") {
      return t("todayView.workoutStatusPending");
    }
    return t("todayView.statusWorkoutWaiting");
  }, [
    foodOnly,
    isRestDay,
    hasWorkoutLoggedToday,
    hasSetLogsToday,
    resolvedFlow,
    t,
  ]);

  const statusFood = useMemo(() => {
    if (foodLogs.length > 0) return t("todayView.statusFoodOk");
    return t("todayView.statusFoodMissing");
  }, [foodLogs.length, t]);

  const activeStorageFeedback = useMemo(
    () => readActiveFeedback(dayKeyToday),
    [dayKeyToday, flowTick, coachDayModel],
  );

  const coachLine = useMemo(() => {
    if (activeStorageFeedback) {
      return activeStorageFeedback.kind === "good_continue"
        ? t("todayView.feedbackGoodContinue")
        : t("todayView.feedbackDoneDay");
    }
    if (workoutFeedbackOn) return t("todayView.feedbackGoodContinue");

    if (plan && foodLogs.length > 0) {
      const targetCal = plan.todayCalories;
      const targetP = plan.foodProteinTargetG ?? plan.todayMacros.proteinG;
      const consumed = foodLogs.reduce((s, x) => s + x.kcal, 0);
      if (targetCal > 0 && targetP > 0 && consumed >= targetCal * 0.2) {
        const estP = Math.round((consumed / targetCal) * targetP);
        if (estP < targetP * 0.72) {
          return t("todayView.coachFoodProteinLow");
        }
      }
    }

    if (isCompleted) return t("todayView.coachOneLineCompleted");
    if (isRestDay) return t("todayView.coachOneLineRest");
    if (foodOnly) {
      return foodLogs.length > 0
        ? t("todayView.coachHintFoodYes")
        : t("todayView.coachHintFoodNo");
    }
    if (hasWorkoutLoggedToday || hasSetLogsToday) {
      return t("todayView.coachOneLineDone");
    }
    return t("todayView.coachOneLineWait");
  }, [
    activeStorageFeedback,
    workoutFeedbackOn,
    plan,
    foodLogs,
    isCompleted,
    isRestDay,
    foodOnly,
    hasWorkoutLoggedToday,
    hasSetLogsToday,
    t,
  ]);

  const anchorLabel = useMemo(() => {
    const k = anchorKindForDay(dayKeyToday);
    if (k === 0) return t("todayView.anchorWater");
    if (k === 1) return t("todayView.anchorSteps");
    return t("todayView.anchorProtein");
  }, [dayKeyToday, t]);

  const onAnchorToggle = useCallback(() => {
    const next = !isAnchorDone(dayKeyToday);
    setAnchorDone(dayKeyToday, next);
    setAnchorDoneState(next);
  }, [dayKeyToday]);

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

  useEffect(() => {
    if (!hasWorkoutLoggedToday || isRestDay || foodOnly) return;
    if (lastWorkoutFbDay.current === dayKeyToday) return;
    lastWorkoutFbDay.current = dayKeyToday;
    setWorkoutFeedbackOn(true);
    const id = window.setTimeout(() => setWorkoutFeedbackOn(false), 8000);
    return () => window.clearTimeout(id);
  }, [hasWorkoutLoggedToday, dayKeyToday, isRestDay, foodOnly]);

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

  if (!coachDayModel) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[15px] text-muted-2">
        {t("common.loading")}
      </div>
    );
  }

  const model = coachDayModel;

  const showNotToday =
    !isCompleted && resolvedFlow !== "skipped";

  return (
    <>
      <main className="coach-today-depth flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden pt-1.5 sm:pt-2">
        <Container
          size="phone"
          className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-[max(1.35rem,calc(env(safe-area-inset-bottom,0px)+4.35rem))] pt-0.5 sm:px-5"
          data-coach-mode={model.mode}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <TodayFocusCard
              heroTitle={model.heroTitle}
              dayFlowLabel={dayFlowLabel}
              statusWorkout={statusWorkout}
              statusFood={statusFood}
              coachLine={coachLine}
              primaryCta={model.primaryCta}
              dayComplete={isCompleted && !model.primaryCta}
              onPrimaryNavigate={onPrimaryNavigate}
              anchor={{
                label: anchorLabel,
                done: anchorDone,
                onToggle: onAnchorToggle,
              }}
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
