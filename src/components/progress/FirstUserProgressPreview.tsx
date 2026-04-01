"use client";

import { MiniLineChart } from "@/components/progress/MiniLineChart";
import { useTranslation } from "@/hooks/useTranslation";
import {
  EXAMPLE_KCAL_CHART_POINTS,
  EXAMPLE_MACRO_RATIO_PCT,
} from "@/lib/firstUserProgressUi";
import { countTrainingDays } from "@/lib/plan";
import type { CoachDailyPlan } from "@/types/coach";

type Props = {
  plan: CoachDailyPlan | null;
  /** Pro: lyhyempi, pelkistetty */
  compact?: boolean;
  /** Kun käyttäjä on piilottanut kaaviot — ei esimerkkikäyrää */
  showKcalChart?: boolean;
};

export function FirstUserProgressPreview({
  plan,
  compact,
  showKcalChart = true,
}: Props) {
  const { t, locale } = useTranslation();
  const trainDays = plan
    ? countTrainingDays({ days: plan.weeklyPlan.days })
    : 0;
  const kcalTarget = plan?.todayCalories ?? null;

  const showMiniChart = showKcalChart && !compact;

  return (
    <section
      className="rounded-[var(--radius-xl)] border border-dashed border-accent/35 bg-accent/[0.06] px-4 py-5"
      aria-labelledby="progress-example-title"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
          {t("progress.exampleBadge")}
        </span>
      </div>
      <h2
        id="progress-example-title"
        className="mt-3 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-foreground"
      >
        {t("progress.exampleTitle")}
      </h2>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-2">
        {t("progress.exampleFillsLine")}
      </p>

      {showMiniChart ? (
        <div className="mt-6 rounded-[var(--radius-lg)] border border-white/[0.08] bg-black/25 px-3 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
            {t("progress.exampleKcalCaption")}
          </p>
          <div className="mt-3 overflow-hidden rounded-[var(--radius-md)] border border-white/[0.06] bg-black/30 px-2 py-3">
            <MiniLineChart
              points={EXAMPLE_KCAL_CHART_POINTS}
              variant="muted"
              height={100}
              fillUnder
            />
          </div>
        </div>
      ) : compact ? (
        <p className="mt-4 text-[11px] leading-snug text-muted-2">
          {t("progress.exampleProCompact")}
        </p>
      ) : null}

      <div className="mt-6 rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.03] px-3 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
          {t("progress.exampleMacroCaption")}
        </p>
        <div
          className="mt-3 flex h-2 overflow-hidden rounded-full bg-surface-muted opacity-90"
          role="img"
          aria-label={t("progress.exampleMacroCaption")}
        >
          <div
            className="bg-accent/55"
            style={{ width: `${EXAMPLE_MACRO_RATIO_PCT.p}%` }}
          />
          <div
            className="bg-accent/35"
            style={{ width: `${EXAMPLE_MACRO_RATIO_PCT.c}%` }}
          />
          <div
            className="bg-foreground/15"
            style={{ width: `${EXAMPLE_MACRO_RATIO_PCT.f}%` }}
          />
        </div>
        <p className="mt-2 text-[10px] leading-snug text-muted-2">
          {t("progress.exampleMacroFoot")}
        </p>
      </div>

      {plan ? (
        <div className="mt-6 border-t border-border/40 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
            {t("progress.exampleWeekCaption")}
          </p>
          <p className="mt-2 text-[14px] font-medium leading-snug text-foreground">
            {trainDays > 0
              ? t("progress.exampleWeekTrainingDays", { n: trainDays })
              : t("progress.exampleWeekAllRest")}
          </p>
          {kcalTarget != null ? (
            <p className="mt-2 text-[13px] tabular-nums text-muted">
              {t("progress.exampleKcalTargetLabel")}{" "}
              <span className="font-semibold text-foreground">
                {kcalTarget.toLocaleString(locale === "en" ? "en-FI" : "fi-FI")}
              </span>{" "}
              kcal
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
