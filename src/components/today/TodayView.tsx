"use client";

import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { Container } from "@/components/ui/Container";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useTranslation } from "@/hooks/useTranslation";
import {
  buildCoachDailyPlanForSession,
  normalizeProfileForEngine,
} from "@/lib/coach";
import { dayKeyFromDate } from "@/lib/dateKey";
import { getMondayBasedIndex } from "@/lib/plan";
import {
  countDaysMarkedDoneTotal,
  isDayMarkedDone,
  setPaywallV1Ack,
} from "@/lib/storage";
import { setSubscribed } from "@/lib/subscription";
import { shouldShowTodayPaywallOverlay } from "@/lib/paywallPolicy";
import { PaywallV1Panel } from "@/components/paywall/PaywallV1Panel";
import { trackEvent } from "@/lib/analytics";
import { shareCoachPayload } from "@/lib/shareCoach";
import { loadActiveExceptionForDay } from "@/lib/exceptionStorage";
import { loadMinimumDayForDay } from "@/lib/minimumDayStorage";
import type { CoachDailyPlan } from "@/types/coach";
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

  const dayKeyToday = useMemo(() => dayKeyFromDate(now), [now]);

  useEffect(() => {
    setIsCompleted(isDayMarkedDone(now));
  }, [now, pathname]);

  useEffect(() => {
    if (profile === undefined) return;
    if (!profile) router.replace("/start");
  }, [profile, router]);

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

  const daysDoneTotal = useMemo(
    () => countDaysMarkedDoneTotal(),
    [isCompleted, pathname],
  );

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
  }, []);

  const onShareDay = useCallback(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    void shareCoachPayload({
      title: t("growth.shareDayTitle"),
      text: t("growth.shareDayPrompt"),
      url: origin ? `${origin}/start` : undefined,
    });
  }, [t]);

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

  return (
    <>
      <main className="coach-page">
        <Container
          size="phone"
          className="flex min-h-[100dvh] flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]"
        >
          <h1 className="shrink-0 text-center text-[1.125rem] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            {t("todayView.title")}
          </h1>

          {!isCompleted ? (
            <div className="mt-6 flex min-h-0 flex-1 flex-col">
              <div className="flex flex-1 flex-col justify-center">
                <p
                  className="text-balance text-center text-[1.5rem] font-semibold leading-[1.12] tracking-[-0.035em] text-foreground"
                  id="today-hero"
                >
                  {t("todayView.heroWorkout", { day: dayNum })}
                </p>
                <div className="mt-8">
                  <Link
                    href="/workout"
                    className="flex h-[56px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[17px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {t("todayView.cta")}
                  </Link>
                </div>
                <p className="mt-5 text-center text-[12px] leading-snug text-muted-2">
                  <Link
                    href="/food/day"
                    className="font-medium text-accent/90 underline-offset-2 hover:underline"
                  >
                    {t("todayView.foodLinkOnly")}
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8 flex min-h-0 flex-1 flex-col items-center text-center">
              <p
                className="text-balance text-[1.45rem] font-semibold leading-snug tracking-[-0.03em] text-foreground"
                role="status"
              >
                {t("todayView.dayDoneSimple")}
              </p>
              <div className="mt-8 w-full max-w-sm">
                <Link
                  href="/plan"
                  className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[16px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("todayView.ctaTomorrow")}
                </Link>
              </div>
              <div className="mt-8 w-full max-w-sm border-t border-white/[0.08] pt-6">
                <p className="text-[13px] font-semibold leading-snug text-foreground">
                  {t("growth.shareDayLead", { n: daysDoneTotal })}
                </p>
                <p className="mt-2 text-[12px] font-medium leading-snug text-muted">
                  {t("growth.shareDayPrompt")}
                </p>
                <button
                  type="button"
                  onClick={onShareDay}
                  className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-lg)] border border-white/[0.12] bg-white/[0.04] text-[15px] font-semibold text-foreground transition hover:bg-white/[0.07] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {t("growth.shareCta")}
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
