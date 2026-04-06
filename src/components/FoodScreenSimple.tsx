"use client";

import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { Container } from "@/components/ui/Container";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useCoachDayModel } from "@/hooks/useCoachDayModel";
import { useTranslation } from "@/hooks/useTranslation";
import { dateLocaleForUi } from "@/lib/i18n";
import { resolveFoodDayMock } from "@/data/foodContent.mock";
import { getProgramPackage } from "@/lib/programPackages";
import Link from "next/link";
import { useMemo, useState } from "react";

export function FoodScreenSimple() {
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const [now] = useState(() => new Date());

  const { coachDayModel, plan, foodLogs } = useCoachDayModel({
    justFinishedWorkoutSession: false,
  });

  const foodDay = useMemo(() => {
    if (!profile) return null;
    const pkg = getProgramPackage(profile.selectedPackageId);
    return resolveFoodDayMock({
      mealCount: pkg.mealCount,
      style: pkg.mealStyle,
      goal: profile.goal,
      locale,
      packageId: profile.selectedPackageId,
      planBias: pkg.planBias,
      now,
    });
  }, [profile, locale, now]);

  const target = plan?.todayCalories ?? 0;
  const consumed = foodLogs.reduce((s, x) => s + x.kcal, 0);

  const foodHeadline =
    coachDayModel?.foodPlanLabel ?? foodDay?.foodPlanLabel ?? "";

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
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2/90">
          {t("food.screenEyebrow")}
        </p>
        <p className="mt-2 text-[12px] font-medium text-muted-2">{foodDay.dayLabel}</p>

        <h1 className="mt-1 text-balance text-[1.45rem] font-semibold leading-[1.15] tracking-[-0.035em] text-foreground">
          {foodHeadline}
        </h1>

        <p className="mt-2 text-[13px] leading-snug text-muted-2/95">
          <span className="text-foreground/85">{foodDay.styleLabel}</span>
          <span className="text-muted-2/60"> · </span>
          <span className="text-muted">
            {t("food.mealsCountLine", { n: foodDay.mealCount })}
          </span>
        </p>

        <p className="mt-4 max-w-[28rem] text-[15px] leading-relaxed text-muted">
          {foodDay.guidanceLine}
        </p>

        {target > 0 ? (
          <p className="mt-6 text-[14px] tabular-nums leading-snug text-muted-2">
            <span className="text-foreground/90">
              {consumed.toLocaleString(dateLocaleForUi(locale))}
            </span>
            <span className="text-muted-2/70"> / </span>
            <span>
              {target.toLocaleString(dateLocaleForUi(locale))}{" "}
              {t("food.kcalUnit")}
            </span>
          </p>
        ) : null}

        <div className="mt-10 space-y-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2/75">
            {t("food.dayMealsHeading")}
          </p>
          <ul className="mt-4 list-none space-y-0 p-0">
            {foodDay.meals.map((meal) => {
              const isNext = meal.id === foodDay.nextMealId;
              return (
                <li
                  key={meal.id}
                  className={`border-b border-white/[0.06] py-5 last:border-b-0 last:pb-0 first:pt-0 ${
                    isNext
                      ? "-mx-1 rounded-xl border border-accent/20 bg-white/[0.03] px-4 py-5 shadow-[0_8px_28px_rgba(0,0,0,0.2)]"
                      : ""
                  }`}
                >
                  {meal.emphasis ? (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent/90">
                      {meal.emphasis}
                    </p>
                  ) : null}
                  {meal.timingLabel ? (
                    <p className="mt-1 text-[11px] text-muted-2/80">{meal.timingLabel}</p>
                  ) : null}
                  <p
                    className={`mt-1 text-[16px] font-semibold leading-snug tracking-[-0.02em] ${
                      isNext ? "text-foreground" : "text-foreground/92"
                    }`}
                  >
                    {meal.name}
                  </p>
                  <ul className="mt-3 list-none space-y-2 p-0">
                    {meal.items.map((item) => (
                      <li
                        key={`${meal.id}-${item}`}
                        className="relative pl-3.5 text-[14px] leading-[1.5] text-muted before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-muted-2/45"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-white/[0.06] pt-8">
          <Link
            href="/food-library"
            scroll={false}
            className="text-[14px] font-medium text-muted underline decoration-white/12 underline-offset-4 transition hover:text-foreground hover:decoration-white/25"
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
