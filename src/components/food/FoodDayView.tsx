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
import {
  buildFoodDayLines,
  resolveFoodDayStyleKey,
} from "@/lib/food/foodDayContent";
import { loadActiveExceptionForDay } from "@/lib/exceptionStorage";
import { loadMinimumDayForDay } from "@/lib/minimumDayStorage";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const FOOD_DAY_KEEP_KEY = "coach-food-flow-v1-keep-day";

export function FoodDayView() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const [now] = useState(() => new Date());

  const normalizedProfile = useMemo(
    () => (profile ? normalizeProfileForEngine(profile) : null),
    [profile],
  );

  const dayKey = useMemo(() => dayKeyFromDate(now), [now]);

  const activeException = useMemo(
    () => loadActiveExceptionForDay(dayKey),
    [dayKey],
  );

  const minimumDayActive = useMemo(
    () => loadMinimumDayForDay(dayKey),
    [dayKey],
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

  const styleKey = useMemo(
    () =>
      normalizedProfile
        ? resolveFoodDayStyleKey(normalizedProfile)
        : "foodFlowV1.styleWhatever",
    [normalizedProfile],
  );

  const lines = useMemo(() => {
    if (!plan || !normalizedProfile) return [];
    return buildFoodDayLines(plan, normalizedProfile, t).slice(0, 5);
  }, [plan, normalizedProfile, t]);

  const onKeep = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(FOOD_DAY_KEEP_KEY, dayKey);
      }
    } catch {
      /* ignore */
    }
    router.push("/app");
  };

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
    <main className="coach-page">
      <Container
        size="phone"
        className="flex min-h-[100dvh] flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]"
      >
        <h1 className="text-[1.25rem] font-semibold leading-tight tracking-[-0.03em] text-foreground">
          {t("foodFlowV1.pageTitle")}
        </h1>
        <p className="mt-1 text-[13px] font-medium text-muted-2">
          {t(styleKey)}
        </p>

        <div className="mt-6 flex min-h-0 flex-1 flex-col">
          <ul
            className="space-y-2.5 text-[15px] leading-snug text-foreground"
            aria-label={t("foodFlowV1.linesAria")}
          >
            {lines.map((line, i) => (
              <li key={i} className="flex gap-2.5 border-b border-white/[0.06] pb-2.5 last:border-b-0">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent/80" aria-hidden />
                <span className="min-w-0 text-balance">{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto shrink-0 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-6">
          <button
            type="button"
            onClick={onKeep}
            className="flex h-[56px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[17px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("foodFlowV1.ctaKeep")}
          </button>
        </div>
      </Container>
    </main>
  );
}
