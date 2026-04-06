"use client";

import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { Container } from "@/components/ui/Container";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useCoachDayModel } from "@/hooks/useCoachDayModel";
import { useTranslation } from "@/hooks/useTranslation";
import { dateLocaleForUi } from "@/lib/i18n";
import { resolveFoodDayMock } from "@/data/foodContent.mock";
import {
  coachFoodDayToFoodDayPlan,
  getFoodDayContent,
} from "@/lib/coachContentResolver";
import { getMondayBasedIndex } from "@/lib/plan";
import { getProgramPackage } from "@/lib/programPackages";
import Link from "next/link";
import { useMemo, useState } from "react";

export function FoodScreenSimple() {
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const [now] = useState(() => new Date());

  const { plan, foodLogs } = useCoachDayModel({
    justFinishedWorkoutSession: false,
  });

  const foodDay = useMemo(() => {
    if (!profile) return null;
    const pkg = getProgramPackage(profile.selectedPackageId);
    const todayIdx = getMondayBasedIndex(now);
    const real = getFoodDayContent(profile.selectedPackageId, todayIdx);
    if (real) {
      return coachFoodDayToFoodDayPlan(real, {
        locale,
        mealCount: pkg.mealCount,
        goal: profile.goal,
        style: pkg.mealStyle,
        planBias: pkg.planBias,
        now,
      });
    }
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

  const targetCal = plan?.todayCalories ?? 0;
  const consumed = foodLogs.reduce((s, x) => s + x.kcal, 0);
  const targetP = plan?.foodProteinTargetG ?? plan?.todayMacros.proteinG ?? 0;
  const estProteinG =
    targetCal > 0 && targetP > 0
      ? Math.round((consumed / targetCal) * targetP)
      : 0;

  const coachFoodLine = useMemo(() => {
    if (plan && foodLogs.length > 0 && targetCal > 0 && targetP > 0) {
      if (estProteinG < targetP * 0.72 && consumed >= targetCal * 0.2) {
        return t("food.toolCoachLowP");
      }
    }
    return null;
  }, [plan, foodLogs.length, targetCal, targetP, consumed, estProteinG, t]);

  const perMealKcal =
    foodDay && foodDay.mealCount > 0 && targetCal > 0
      ? Math.round(targetCal / foodDay.mealCount)
      : 0;

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
        className="flex min-h-[85dvh] flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2/90">
          {t("food.screenEyebrow")}
        </p>
        <p className="mt-2 text-[12px] font-medium text-muted-2">{foodDay.dayLabel}</p>

        {targetCal > 0 ? (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.03] px-4 py-4">
            <p className="text-[20px] font-semibold tabular-nums tracking-[-0.03em] text-foreground">
              {t("food.toolKcalHeader", {
                consumed: consumed.toLocaleString(dateLocaleForUi(locale)),
                target: targetCal.toLocaleString(dateLocaleForUi(locale)),
              })}
            </p>
            {targetP > 0 ? (
              <p className="mt-2 text-[14px] font-medium tabular-nums text-muted-2">
                {t("food.toolProteinCompare", {
                  current: String(estProteinG),
                  target: String(targetP),
                })}
              </p>
            ) : null}
          </div>
        ) : null}

        {coachFoodLine ? (
          <p className="mt-4 text-[14px] font-medium leading-snug text-foreground/88">
            {coachFoodLine}
          </p>
        ) : null}

        <div className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2/75">
            {t("food.dayMealsHeading")}
          </p>
          <ul className="mt-3 list-none space-y-0 divide-y divide-white/[0.06] rounded-[var(--radius-lg)] border border-white/[0.07] p-0">
            {foodDay.meals.map((meal) => (
              <li key={meal.id} className="flex items-start justify-between gap-3 px-3 py-3.5">
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold leading-snug text-foreground">
                    {meal.name}
                  </p>
                  {meal.timingLabel ? (
                    <p className="mt-0.5 text-[11px] text-muted-2/75">{meal.timingLabel}</p>
                  ) : null}
                </div>
                {perMealKcal > 0 ? (
                  <p className="shrink-0 text-[13px] font-medium tabular-nums text-muted-2">
                    {t("food.toolMealEstimate", {
                      kcal: String(perMealKcal),
                    })}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/food/day"
          className="mt-8 flex min-h-[54px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent px-4 text-[16px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99]"
        >
          {t("food.toolCtaLog")}
        </Link>

        <div className="mt-5 flex flex-col gap-3 border-t border-white/[0.06] pt-6">
          <Link
            href="/food-library"
            className="text-[13px] font-medium text-muted-2 underline decoration-white/12 underline-offset-4 transition hover:text-foreground"
          >
            {t("food.toolShoppingLink")}
          </Link>
          <Link
            href="/app"
            scroll={false}
            className="text-[13px] font-medium text-muted-2/80 underline decoration-white/10 underline-offset-4 transition hover:text-muted"
          >
            {t("food.simpleBackToday")}
          </Link>
        </div>
      </Container>
    </main>
  );
}
