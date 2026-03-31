"use client";

import type { OffPlanMeal } from "@/lib/food/offPlan";
import { mergeOutcomeHint } from "@/lib/storage";
import type { TranslateFn } from "@/lib/i18n";

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function FoodOffPlanQuickBlock({
  referenceDate,
  onAddOffPlan,
  onMissedMeal,
  onAfter,
  t,
}: {
  referenceDate: Date;
  onAddOffPlan: (meal: OffPlanMeal) => void;
  onMissedMeal: () => void;
  onAfter: () => void;
  t: TranslateFn;
}) {
  const pickMore = () => {
    mergeOutcomeHint(referenceDate, { caloriesOver: true });
    onAddOffPlan({
      id: newId(),
      label: t("food.quickDerailMoreLabel"),
      calories: 520,
      protein: 28,
      carbs: 48,
      fat: 22,
      source: "catalog",
      timingTag: "snack",
    });
    onAfter();
  };

  const pickLess = () => {
    onAddOffPlan({
      id: newId(),
      label: t("food.quickDerailLessLabel"),
      calories: 200,
      protein: 32,
      carbs: 12,
      fat: 6,
      source: "catalog",
      timingTag: "dinner",
    });
    onAfter();
  };

  const pickGrab = () => {
    onAddOffPlan({
      id: newId(),
      label: t("food.quickDerailGrabLabel"),
      calories: 330,
      protein: 12,
      carbs: 38,
      fat: 14,
      source: "catalog",
      timingTag: "snack",
    });
    onAfter();
  };

  const pickMissed = () => {
    onMissedMeal();
    onAfter();
  };

  return (
    <section
      className="mt-5 rounded-[var(--radius-xl)] border border-accent/25 bg-gradient-to-br from-accent/[0.08] to-white/[0.02] px-4 py-4"
      aria-labelledby="food-quick-derail"
    >
      <p
        id="food-quick-derail"
        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent"
      >
        {t("food.quickDerailTitle")}
      </p>
      <p className="mt-2 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-foreground">
        {t("food.quickDerailKicker")}
      </p>
      <p className="mt-1 text-[12px] font-medium leading-snug text-muted">
        {t("food.quickDerailLead")}
      </p>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={pickMore}
          className="min-h-[48px] rounded-[var(--radius-lg)] border border-border/60 bg-card/80 px-3 py-2.5 text-left text-[13px] font-semibold leading-snug text-foreground transition hover:border-accent/35 hover:bg-accent-soft/25 active:scale-[0.99]"
        >
          {t("food.quickDerailMore")}
        </button>
        <button
          type="button"
          onClick={pickLess}
          className="min-h-[48px] rounded-[var(--radius-lg)] border border-border/60 bg-card/80 px-3 py-2.5 text-left text-[13px] font-semibold leading-snug text-foreground transition hover:border-accent/35 hover:bg-accent-soft/25 active:scale-[0.99]"
        >
          {t("food.quickDerailLess")}
        </button>
        <button
          type="button"
          onClick={pickMissed}
          className="min-h-[48px] rounded-[var(--radius-lg)] border border-border/60 bg-card/80 px-3 py-2.5 text-left text-[13px] font-semibold leading-snug text-foreground transition hover:border-accent/35 hover:bg-accent-soft/25 active:scale-[0.99]"
        >
          {t("food.quickDerailMissed")}
        </button>
        <button
          type="button"
          onClick={pickGrab}
          className="min-h-[48px] rounded-[var(--radius-lg)] border border-border/60 bg-card/80 px-3 py-2.5 text-left text-[13px] font-semibold leading-snug text-foreground transition hover:border-accent/35 hover:bg-accent-soft/25 active:scale-[0.99]"
        >
          {t("food.quickDerailGrab")}
        </button>
      </div>
    </section>
  );
}
