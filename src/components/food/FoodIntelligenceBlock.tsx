"use client";

import { buildMacroCorrectionPlan } from "@/lib/food/macroCorrection";
import {
  getFallbackMealsForSituation,
  type FallbackMealOption,
} from "@/lib/food/fallbackMeals";
import { getMealTimingForProfile } from "@/lib/food/mealTiming";
import {
  mergeOffPlanMealsIntoConsumed,
  type MacroTotals,
  type OffPlanMeal,
} from "@/lib/food/offPlan";
import { resolveNutritionBlueprint } from "@/lib/nutritionBlueprints";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";
import type { Locale } from "@/lib/i18n";
import type { TranslateFn } from "@/lib/i18n";
type Props = {
  profile: OnboardingAnswers;
  plan: CoachDailyPlan;
  referenceDate: Date;
  hasTrainingToday: boolean;
  consumedFromLog: MacroTotals;
  offPlanMeals: OffPlanMeal[];
  onAddOffPlan: (meal: OffPlanMeal) => void;
  missedMeals: number;
  onAddMissedMeal: () => void;
  remainingMealSlots: number;
  locale: Locale;
  t: TranslateFn;
};

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function fallbackToOffPlan(
  o: FallbackMealOption,
  locale: Locale,
): OffPlanMeal {
  return {
    id: newId(),
    label: locale === "en" ? o.nameEn : o.nameFi,
    calories: o.calories,
    protein: o.protein,
    carbs: o.carbs,
    fat: o.fat,
    source: "catalog",
    timingTag: "snack",
  };
}

export function FoodIntelligenceBlock({
  profile,
  plan,
  referenceDate,
  hasTrainingToday,
  consumedFromLog,
  offPlanMeals,
  onAddOffPlan,
  missedMeals,
  onAddMissedMeal,
  remainingMealSlots,
  locale,
  t,
}: Props) {
  const nb = resolveNutritionBlueprint(profile);
  const timing = getMealTimingForProfile(profile, referenceDate, {
    hasTrainingToday,
  });

  const targets: MacroTotals = {
    calories: plan.todayCalories,
    protein: plan.todayMacros.proteinG,
    carbs: plan.todayMacros.carbsG,
    fat: plan.todayMacros.fatG,
  };

  const consumed = mergeOffPlanMealsIntoConsumed(
    consumedFromLog,
    offPlanMeals,
  );

  const rm = Math.max(1, Math.min(5, remainingMealSlots));

  const correction = buildMacroCorrectionPlan({
    target: targets,
    consumed,
    remainingMeals: rm,
    nutritionBlueprint: nb,
    profile,
    hasTrainingToday,
    missedMeals,
  });

  const primary = hasTrainingToday ? "post_workout" : "busy_day";
  const suggestions = getFallbackMealsForSituation(
    {
      primary,
      hasTrainingToday,
      supportsQuickFallbacks: nb.supportsQuickFallbacks,
      timingMode: nb.timingMode,
    },
    3,
  );

  const showOffTitle = offPlanMeals.length > 0;
  const sectionTitle = showOffTitle
    ? t("foodIntel.titleOff")
    : t("foodIntel.titleDay");

  const timingLine =
    nb.timingMode === "shift_based"
      ? timing.firstMealWindow
      : timing.wakeWindow;

  return (
    <section
      className="mt-8 rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03] px-4 py-5 sm:px-5"
      aria-labelledby="food-intel-heading"
    >
      <h2
        id="food-intel-heading"
        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2"
      >
        {sectionTitle}
      </h2>

      <p className="mt-3 text-[12px] leading-relaxed text-muted">{timingLine}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAddMissedMeal}
          className="min-h-[40px] rounded-full border border-border/60 bg-surface-subtle/50 px-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted transition hover:border-accent/35 hover:text-foreground"
        >
          {t("foodIntel.missedMeal")}
        </button>
      </div>

      <p className="mt-4 text-[11px] font-medium text-muted-2">
        {t("foodIntel.quickFallbackLead")}
      </p>
      {suggestions[0] ? (
        <button
          type="button"
          onClick={() =>
            onAddOffPlan(fallbackToOffPlan(suggestions[0], locale))
          }
          className="group relative mt-3 flex min-h-[48px] w-full items-center justify-center overflow-hidden rounded-[14px] px-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#f8fbff] transition hover:brightness-110 active:scale-[0.99] coach-today-cta-primary"
        >
          <span className="relative z-[1]">{t("foodIntel.ctaQuickAdd")}</span>
          <span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden
          />
        </button>
      ) : null}
      <div className="mt-3 flex flex-col gap-2">
        {suggestions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onAddOffPlan(fallbackToOffPlan(opt, locale))}
            className="flex min-h-[48px] w-full items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-border/50 bg-surface-subtle/40 px-3.5 py-3 text-left transition hover:border-accent/30 hover:bg-accent-soft/20 active:scale-[0.99]"
          >
            <span className="text-[14px] font-semibold leading-snug text-foreground">
              {locale === "en" ? opt.nameEn : opt.nameFi}
            </span>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-2">
              {opt.calories} kcal · P{opt.protein}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 border-t border-border/40 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent/90">
          {t("foodIntel.systemBalance")}
        </p>
        <p className="mt-2 text-[13px] font-medium leading-relaxed text-foreground">
          {locale === "en"
            ? correction.explanationEn
            : correction.explanationFi}
        </p>
        <p className="mt-3 text-[11px] tabular-nums text-muted">
          {t("foodIntel.perMealHint")}{" "}
          <span className="font-semibold text-foreground/95">
            ~{Math.round(correction.perMealIfSplitEvenly.calories)} kcal
          </span>
          {" · "}P{Math.round(correction.perMealIfSplitEvenly.protein)}
          {" · "}
          {t("foodIntel.severityLabel")}{" "}
          {t(
            correction.severity === "low"
              ? "foodIntel.severity.low"
              : correction.severity === "medium"
                ? "foodIntel.severity.medium"
                : "foodIntel.severity.high",
          )}
        </p>
      </div>

      {missedMeals > 0 ? (
        <p className="mt-3 text-[12px] text-muted" role="status">
          {t("foodIntel.missedNote", { n: missedMeals })}
        </p>
      ) : null}
    </section>
  );
}
