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
import { dateLocaleForUi } from "@/lib/i18n";
import { loadFoodLog } from "@/lib/foodStorage";
import {
  EXCEPTION_STATE_CHANGED,
  loadActiveExceptionForDay,
} from "@/lib/exceptionStorage";
import {
  MINIMUM_DAY_CHANGED,
  loadMinimumDayForDay,
} from "@/lib/minimumDayStorage";
import { resolveFoodDayMock } from "@/data/foodContent.mock";
import { getProgramPackage } from "@/lib/programPackages";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function FoodScreenSimple() {
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const [now] = useState(() => new Date());
  const [exTick, setExTick] = useState(0);
  const [minimumTick, setMinimumTick] = useState(0);

  useEffect(() => {
    const b = () => setExTick((x) => x + 1);
    window.addEventListener(EXCEPTION_STATE_CHANGED, b);
    return () => window.removeEventListener(EXCEPTION_STATE_CHANGED, b);
  }, []);

  useEffect(() => {
    const b = () => setMinimumTick((x) => x + 1);
    window.addEventListener(MINIMUM_DAY_CHANGED, b);
    return () => window.removeEventListener(MINIMUM_DAY_CHANGED, b);
  }, []);

  const dayKeyFood = useMemo(() => dayKeyFromDate(now), [now]);

  const activeException = useMemo(
    () => loadActiveExceptionForDay(dayKeyFood),
    [dayKeyFood, exTick],
  );
  const minimumDayActive = useMemo(
    () => loadMinimumDayForDay(dayKeyFood),
    [dayKeyFood, minimumTick],
  );

  const normalizedProfile = useMemo(
    () => (profile ? normalizeProfileForEngine(profile) : null),
    [profile],
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

  const foodDay = useMemo(() => {
    if (!profile) return null;
    const pkg = getProgramPackage(profile.selectedPackageId);
    return resolveFoodDayMock({
      mealCount: pkg.mealCount,
      style: pkg.mealStyle,
      goal: profile.goal,
      locale,
    });
  }, [profile, locale]);

  const log = loadFoodLog(now);
  const target = plan?.todayCalories ?? 0;
  const consumed = log.reduce((s, x) => s + x.kcal, 0);

  if (profile === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[15px] text-muted-2">
        {t("common.loading")}
      </div>
    );
  }

  if (!profile) {
    return <CoachProfileMissingFallback />;
  }

  if (!plan || !foodDay) {
    return (
      <main className="coach-page">
        <Container size="phone" className="px-5 py-12">
          <p className="text-[13px] leading-relaxed text-muted" role="status">
            {t("fallback.sharpensWithUse")}
          </p>
          <Link
            href="/start"
            className="mt-6 inline-flex min-h-[44px] items-center text-[14px] font-semibold text-foreground underline-offset-2 hover:underline"
          >
            {t("fallback.openStart")}
          </Link>
        </Container>
      </main>
    );
  }

  return (
    <main className="coach-page">
      <Container
        size="phone"
        className="flex min-h-[85dvh] flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-2">
          {foodDay.dayLabel}
        </p>
        <h1 className="mt-2 text-balance text-[1.5rem] font-semibold leading-tight tracking-[-0.03em] text-foreground">
          {t("food.simpleTitle")}
        </h1>
        <p className="mt-2 text-[15px] tabular-nums leading-snug text-muted">
          {consumed.toLocaleString(dateLocaleForUi(locale))} /{" "}
          {target.toLocaleString(dateLocaleForUi(locale))}{" "}
          {t("food.kcalUnit")}
        </p>
        <p className="mt-5 text-[13px] font-medium leading-snug text-muted-2">
          {foodDay.planLabel}
        </p>

        <ol className="mt-10 list-none space-y-10 p-0">
          {foodDay.meals.map((meal) => (
            <li key={meal.id}>
              <p className="text-[15px] font-semibold leading-snug tracking-[-0.02em] text-foreground">
                {meal.name}
              </p>
              <ul className="mt-2.5 list-none space-y-1.5 p-0">
                {meal.items.map((item) => (
                  <li
                    key={`${meal.name}-${item}`}
                    className="text-[14px] font-normal leading-[1.45] text-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.06] pt-8">
          <Link
            href="/food-library"
            scroll={false}
            className="text-[14px] font-medium text-foreground/90 underline decoration-white/15 underline-offset-4 transition hover:decoration-white/30"
          >
            {t("food.simpleLibraryLink")}
          </Link>
          <Link
            href="/app"
            scroll={false}
            className="text-[14px] font-medium text-muted-2 underline decoration-white/10 underline-offset-4 transition hover:text-muted"
          >
            {t("food.simpleBackToday")}
          </Link>
        </div>
      </Container>
    </main>
  );
}
