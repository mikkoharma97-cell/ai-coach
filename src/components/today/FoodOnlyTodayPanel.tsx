"use client";

import { CoachSystemStatus } from "@/components/ui/CoachSystemStatus";
import { useTranslation } from "@/hooks/useTranslation";
import type { MessageKey } from "@/lib/i18n";
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  weekday: string;
  calendarDate: string;
  foodLine: string;
  targetKcal: number;
  consumedKcal: number;
  proteinTargetG: number;
  proteinConsumedG: number;
  systemStatusKey: MessageKey;
  systemStatusLive: boolean;
  /** Evidence sync — viikkonäkymä / progressio (lyhyt) */
  weeklyInsightLine?: string | null;
  /** Upsell Full Coachiin */
  showFullCoachUpsell?: boolean;
  primaryCtaSlot?: ReactNode;
  minimumSlot?: ReactNode;
  secondaryStrip?: ReactNode;
};

/**
 * Food Only -tilan Today: kalorit, proteiini, yksi ohjaus — ei täyttä valmennusdashiä.
 */
export function FoodOnlyTodayPanel({
  weekday,
  calendarDate,
  foodLine,
  targetKcal,
  consumedKcal,
  proteinTargetG,
  proteinConsumedG,
  systemStatusKey,
  systemStatusLive,
  weeklyInsightLine,
  showFullCoachUpsell,
  primaryCtaSlot,
  minimumSlot,
  secondaryStrip,
}: Props) {
  const { t } = useTranslation();
  const pct = targetKcal > 0 ? Math.min(100, (consumedKcal / targetKcal) * 100) : 0;

  return (
    <section
      className="coach-panel-today-hero relative overflow-hidden"
      aria-labelledby="food-only-today-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_90%_at_100%_-15%,var(--panel-glow),transparent_52%)]"
        aria-hidden
      />
      <div className="coach-topline" aria-hidden />
      <div className="relative px-5 pb-8 pt-6 sm:px-8 sm:pb-9 sm:pt-8">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2 sm:text-left">
          {weekday} · {calendarDate}
        </p>
        <h1
          id="food-only-today-heading"
          className="mt-2 text-center text-[1.35rem] font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-left sm:text-[1.5rem]"
        >
          {t("foodOnly.todayLead")}
        </h1>

        <div className="mt-4 flex flex-col items-center gap-3 sm:items-start">
          <CoachSystemStatus
            text={t(systemStatusKey)}
            liveSignal={systemStatusLive}
          />
        </div>

        <div className="mt-6 rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
            {t("foodOnly.panelEyebrow")}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-muted-2">{t("foodOnly.kcalLabel")}</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                {Math.round(consumedKcal)} / {Math.round(targetKcal)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-2">{t("foodOnly.proteinLabel")}</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                {Math.round(proteinConsumedG)} / {Math.round(proteinTargetG)} g
              </p>
            </div>
          </div>
          <div
            className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]"
            role="progressbar"
            aria-valuenow={Math.round(pct)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-accent/90 transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-4 text-[14px] font-medium leading-snug text-foreground">
            {foodLine}
          </p>
        </div>

        {primaryCtaSlot ? (
          <div className="mt-6 flex flex-col gap-3">{primaryCtaSlot}</div>
        ) : (
          <Link
            href="/food"
            className="mt-6 flex min-h-[52px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-accent px-4 text-[15px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)]"
          >
            {t("foodOnly.todayCta")}
          </Link>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] font-semibold sm:justify-start">
          <Link
            href="/progress"
            className="text-accent underline-offset-[3px] hover:underline"
          >
            {t("foodOnly.todayWeightLink")}
          </Link>
        </div>

        {weeklyInsightLine ? (
          <p
            className="mt-4 rounded-[var(--radius-lg)] border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[12px] leading-snug text-muted"
            role="status"
          >
            {weeklyInsightLine}
          </p>
        ) : null}

        {showFullCoachUpsell ? (
          <p className="mt-3 text-center text-[12px] leading-snug text-muted-2 sm:text-left">
            <Link
              href="/more"
              className="font-medium text-accent underline-offset-[3px] hover:underline"
            >
              {t("foodOnly.fullCoachUpsell")}
            </Link>
          </p>
        ) : null}

        {minimumSlot ? <div className="mt-5">{minimumSlot}</div> : null}
        {secondaryStrip ? <div className="mt-6">{secondaryStrip}</div> : null}
      </div>
    </section>
  );
}
