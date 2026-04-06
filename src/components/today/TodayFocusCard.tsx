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
  anchor,
  afterCta,
}: TodayFocusCardProps) {
  const { t } = useTranslation();

  return (
    <div className="relative z-[1] flex min-h-0 min-w-0 flex-col" id="today-focus-card">
      <header className="px-0.5 pt-0">
        <h1 className="text-center text-[1.35rem] font-semibold leading-[1.08] tracking-[-0.04em] text-foreground sm:text-[1.45rem]">
          {heroTitle}
        </h1>
        {dayFlowLabel ? (
          <p
            className="mt-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-2/90"
            role="status"
          >
            {dayFlowLabel}
          </p>
        ) : null}

        <div className="mt-3 space-y-1.5 rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.025] px-3 py-2.5">
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
            className="mt-3 text-center text-[13px] font-medium leading-snug tracking-[-0.015em] text-foreground/88"
            role="status"
          >
            {coachLine}
          </p>
        ) : null}
      </header>

      {primaryCta ? (
        <div className="mt-4 px-0.5">
          <Link
            href={primaryCta.href}
            scroll={false}
            onClick={onPrimaryNavigate}
            className="flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent px-5 text-[16px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {primaryCta.label}
          </Link>
        </div>
      ) : dayComplete ? (
        <div className="mt-4 px-0.5">
          <div className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--radius-lg)] border border-white/[0.1] bg-white/[0.035] px-5 text-[15px] font-semibold tracking-[-0.02em] text-foreground/90">
            {t("todayView.dayCompletePill")}
          </div>
        </div>
      ) : null}

      {afterCta ? <div className="mt-4 w-full px-0.5">{afterCta}</div> : null}

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
    </div>
  );
}
