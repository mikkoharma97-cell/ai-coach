"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const EYEBROW =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-[color-mix(in_oklab,var(--text-eyebrow)_92%,transparent)]";

export type TodayFocusCardProps = {
  heroTitle: string;
  /** Päivän vaihe: Aloita / Käynnissä / Valmis */
  dayFlowLabel?: string;
  /** Treeni: lyhyt tila */
  statusWorkout: string;
  /** Ruoka: lyhyt tila */
  statusFood: string;
  /** Yksi valmennusrivi */
  coachLine: string | null;
  primaryCta?: { href: string; label: string } | null;
  onPrimaryNavigate: () => void;
  /** Kun päivä merkitty valmiiksi eikä primary CTA:ta */
  dayComplete?: boolean;
  quickActions?: boolean;
  foodOnlyMode?: boolean;
  /** Kevyt ankkuri */
  anchor?: { label: string; done: boolean; onToggle: () => void } | null;
  afterCta?: ReactNode;
};

export function TodayFocusCard({
  heroTitle,
  dayFlowLabel,
  statusWorkout,
  statusFood,
  coachLine,
  primaryCta,
  onPrimaryNavigate,
  dayComplete = false,
  quickActions = false,
  foodOnlyMode = false,
  anchor,
  afterCta,
}: TodayFocusCardProps) {
  const { t } = useTranslation();

  return (
    <div className="relative z-[1] flex min-h-0 min-w-0 flex-col" id="today-focus-card">
      <header className="px-0.5 pt-0.5">
        <h1 className="text-center text-[1.4rem] font-semibold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-[1.5rem]">
          {heroTitle}
        </h1>
        {dayFlowLabel ? (
          <p
            className="mt-2 text-center text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-2/90"
            role="status"
          >
            {dayFlowLabel}
          </p>
        ) : null}

        <div className="mt-4 space-y-2 rounded-[var(--radius-lg)] border border-white/[0.07] bg-white/[0.02] px-3 py-3">
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className={`${EYEBROW} normal-case tracking-[-0.01em]`}>
              {t("todayView.hubSectionWorkout")}
            </span>
            <span className="min-w-0 text-right font-medium text-foreground/90">{statusWorkout}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3 border-t border-white/[0.05] pt-2 text-[13px]">
            <span className={`${EYEBROW} normal-case tracking-[-0.01em]`}>
              {t("todayView.hubSectionFood")}
            </span>
            <span className="min-w-0 text-right font-medium text-foreground/90">{statusFood}</span>
          </div>
        </div>

        {coachLine ? (
          <p
            className="mt-4 text-center text-[14px] font-medium leading-snug tracking-[-0.015em] text-foreground/88"
            role="status"
          >
            {coachLine}
          </p>
        ) : null}
      </header>

      {primaryCta ? (
        <div className="mt-5 px-0.5">
          <Link
            href={primaryCta.href}
            scroll={false}
            onClick={onPrimaryNavigate}
            className="group relative flex min-h-[56px] w-full touch-manipulation items-center justify-center overflow-hidden rounded-[var(--radius-today)] bg-gradient-to-b from-[color-mix(in_oklab,var(--accent)_88%,white_12%)] via-[var(--accent)] to-[var(--accent-deep)] px-5 text-[17px] font-semibold tracking-[-0.026em] text-white shadow-[0_12px_44px_-14px_rgba(41,92,255,0.5),0_6px_22px_-12px_rgba(0,0,0,0.58)] ring-1 ring-inset ring-white/[0.18] transition-[filter,transform] hover:brightness-[1.05] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span
              className="pointer-events-none absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-white/[0.2] via-white/[0.05] to-transparent opacity-[0.85]"
              aria-hidden
            />
            <span className="relative z-[1]">{primaryCta.label}</span>
          </Link>
        </div>
      ) : dayComplete ? (
        <div className="mt-5 px-0.5">
          <div className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--radius-today)] border border-white/[0.12] bg-white/[0.04] px-5 text-[16px] font-semibold tracking-[-0.02em] text-foreground/90">
            {t("todayView.dayCompletePill")}
          </div>
        </div>
      ) : null}

      {primaryCta && quickActions ? (
        <div
          className={`mt-3 grid gap-2 px-0.5 ${foodOnlyMode ? "grid-cols-1" : "grid-cols-2"}`}
        >
          {!foodOnlyMode ? (
            <Link
              href="/workout"
              scroll={false}
              className="flex min-h-[44px] touch-manipulation items-center justify-center rounded-[var(--radius-md)] border border-white/[0.1] bg-white/[0.035] px-2 text-[12.5px] font-semibold text-foreground/95 transition hover:border-accent/35 hover:bg-white/[0.06] active:scale-[0.99]"
            >
              {t("todayView.quickWorkout")}
            </Link>
          ) : null}
          <Link
            href="/food"
            scroll={false}
            className="flex min-h-[44px] touch-manipulation items-center justify-center rounded-[var(--radius-md)] border border-white/[0.1] bg-white/[0.035] px-2 text-[12.5px] font-semibold text-foreground/95 transition hover:border-accent/35 hover:bg-white/[0.06] active:scale-[0.99]"
          >
            {t("todayView.quickFood")}
          </Link>
        </div>
      ) : null}

      {anchor ? (
        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-white/[0.08] bg-white/[0.025] px-3 py-3">
          <input
            type="checkbox"
            checked={anchor.done}
            onChange={anchor.onToggle}
            className="size-5 shrink-0 rounded border-white/20 bg-background/80 accent-accent"
          />
          <span className="text-[13.5px] font-medium leading-snug text-foreground/88">
            {anchor.label}
          </span>
        </label>
      ) : null}

      {afterCta ? <div className="mt-4 w-full px-0.5">{afterCta}</div> : null}
    </div>
  );
}
