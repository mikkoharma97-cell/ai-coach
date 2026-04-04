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
import { shareCoachPayload } from "@/lib/shareCoach";
import { loadActiveExceptionForDay } from "@/lib/exceptionStorage";
import { loadMinimumDayForDay } from "@/lib/minimumDayStorage";
import { loadWorkoutSessions, WORKOUT_LOG_CHANGED } from "@/lib/workoutLogStorage";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

  const dayKeyToday = useMemo(() => dayKeyFromDate(now), [now]);

  useEffect(() => {
    setIsCompleted(isDayMarkedDone(now));
  }, [now, pathname]);

  useEffect(() => {
    const up = () => setWorkoutLogTick((x) => x + 1);
    window.addEventListener(WORKOUT_LOG_CHANGED, up);
    return () => window.removeEventListener(WORKOUT_LOG_CHANGED, up);
  }, []);

  const normalizedProfile = useMemo(
    () => (profile ? normalizeProfileForEngine(profile) : null),
    [profile],
  );

  const activeException = useMemo(
    () => loadActiveExceptionForDay(dayKeyToday),
    [dayKeyToday],
  );

  const minimumDayActive = useMemo(
    () => loadMinimumDayForDay(dayKeyToday),
    [dayKeyToday],
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

  const onShareDay = useCallback(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    void shareCoachPayload({
      title: t("growth.shareDayTitle"),
      text: t("growth.shareDayPrompt"),
      url: origin ? `${origin}/start` : undefined,
    });
  }, [t]);

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
    return out.slice(0, 2);
  }, [plan, minimumDayActive, t]);

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

  /** Lepopäivällä yksi pääviesti hero-kortissa; treeniosio ei toista samaa tekstiä. */
  const showWorkoutSummaryParagraph = !isRestDay;

  const workoutStatusLabel = isRestDay
    ? t("todayView.workoutStatusRest")
    : hasWorkoutLoggedToday
      ? t("todayView.workoutStatusDone")
      : t("todayView.workoutStatusPending");

  const hubHeroBody = foodOnly
    ? foodMainLineForToday(plan.todayFoodTask)
    : isRestDay
      ? restHeroLine
      : t("todayView.heroWorkout", { day: dayNum });

  const primaryCta = (() => {
    if (isCompleted) {
      return { href: "/plan" as const, label: t("todayView.ctaTomorrow") };
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
    "mt-3 rounded-[var(--radius-md)] border border-white/[0.08] bg-white/[0.03] px-3 py-3";

  return (
    <>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden bg-[var(--background)] pt-3">
        <Container
          size="phone"
          className="flex min-h-0 min-w-0 flex-1 flex-col px-4 pb-2 pt-1 sm:px-5"
        >
          {!isCompleted ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <TodayFocusCard
                focusEyebrow={t("todayView.focusEyebrow")}
                focusTitle={t("todayView.focusTitle")}
                heroBody={hubHeroBody}
                primaryCta={primaryCta}
              />

              <section
                className="mt-4 border-t border-white/[0.06] pt-4"
                aria-labelledby="today-secondary-heading"
              >
                <h2
                  id="today-secondary-heading"
                  className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2"
                >
                  {t("todayView.secondarySectionHeading")}
                </h2>
                <div className="flex min-h-0 min-w-0 flex-col gap-3">
                  {!foodOnly ? (
                    <TodayWorkoutHub
                      hubBlockClass={hubBlockClass}
                      sectionTitle={t("todayView.hubSectionWorkout")}
                      workoutStatusLabel={workoutStatusLabel}
                      showSummaryLine={showWorkoutSummaryParagraph}
                      summaryLine={workoutSummaryLine}
                      linkWorkoutLabel={t("todayView.linkWorkout")}
                    />
                  ) : null}

                  <TodayFoodHub
                    hubBlockClass={hubBlockClass}
                    sectionTitle={t("todayView.hubSectionFood")}
                    mealsLine={t("todayView.mealsLine", { n: mealN })}
                    previewLines={foodPreviewLines}
                    linkFoodLabel={t("todayView.linkFood")}
                  />

                  {statusLines.length > 0 ? (
                    <TodayStatusHub
                      hubBlockClass={hubBlockClass}
                      sectionTitle={t("todayView.hubSectionStatus")}
                      lines={statusLines}
                    />
                  ) : null}
                </div>
              </section>
            </div>
          ) : (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 pt-6 text-center">
              <p
                className="line-clamp-3 shrink-0 text-balance text-[clamp(1.2rem,4.5vw,1.45rem)] font-semibold leading-snug tracking-[-0.03em] text-foreground"
                role="status"
              >
                {t("todayView.dayDoneSimple")}
              </p>
              <div className="mt-auto flex w-full min-w-0 flex-col gap-4">
                <Link
                  href="/plan"
                  className="flex min-h-[56px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent px-4 text-[17px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("todayView.ctaTomorrow")}
                </Link>
                <button
                  type="button"
                  onClick={onShareDay}
                  className="flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] border border-white/[0.14] bg-white/[0.04] px-4 text-[16px] font-semibold tracking-[-0.02em] text-foreground transition hover:border-accent/35 hover:bg-white/[0.07] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("todayView.shareThis")}
                </button>
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
