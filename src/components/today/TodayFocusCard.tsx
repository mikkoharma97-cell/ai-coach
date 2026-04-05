"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export type TodayBriefRow = { label: string; value: string };

/** Yhteinen yläotsikko (eyebrow) — hero / plan / tilanne */
const SECTION_EYEBROW =
  "text-[10px] font-semibold uppercase tracking-[0.12em] text-[color-mix(in_oklab,var(--text-eyebrow)_92%,transparent)]";

export type TodayFocusCardProps = {
  /** Pieni yläotsikko — sama tyyli kuin muissa eyebrow-riveissä */
  heroEyebrow?: string;
  /** Pääotsikko: treeni / ruoka / lepo / tila */
  heroTitle: string;
  /** Yksi lyhyt ohjaava lause — ei laatikossa */
  heroGuidance: string;
  /** Yksi primary CTA */
  primaryCta: { href: string; label: string };
  onPrimaryNavigate: () => void;
  feedbackLine: string | null;
  /** Tekstimuotoinen päivän tila (ei %-mittari) */
  flowStatusLine: string;
  statusRowLabel: string;
  /** Tilanneosion otsikko (CTA:n jälkeen) */
  situationHeading: string;
  briefRows: TodayBriefRow[];
  programEyebrow: string;
  programTitle: string;
  programFocus: string;
  /** Plan-blokin jälkeen, toissijainen (esim. "ei tänään") */
  afterCta?: ReactNode;
  /** “Tänään ohjelmassa” — treeni (lyhyt, voi erota hero-otsikosta) */
  planWorkoutLabel: string;
  /** “Tänään ohjelmassa” — ruoka (päivän rakenne) */
  planFoodLabel: string;
};

export function TodayFocusCard({
  heroEyebrow,
  heroTitle,
  heroGuidance,
  primaryCta,
  onPrimaryNavigate,
  feedbackLine,
  flowStatusLine,
  statusRowLabel,
  situationHeading,
  briefRows,
  programEyebrow,
  programTitle,
  programFocus,
  afterCta,
  planWorkoutLabel,
  planFoodLabel,
}: TodayFocusCardProps) {
  const { t } = useTranslation();

  return (
    <div className="relative z-[1] flex min-h-0 min-w-0 flex-col" id="today-focus-card">
      <header className="px-0.5 pt-1">
        {heroEyebrow ? (
          <p className={`text-center ${SECTION_EYEBROW}`}>{heroEyebrow}</p>
        ) : null}
        <h1
          className={`text-center text-[1.44rem] font-semibold leading-[1.06] tracking-[-0.045em] text-foreground sm:text-[1.56rem] ${heroEyebrow ? "mt-2.5" : "mt-0"}`}
        >
          {heroTitle}
        </h1>
        <p
          className="mt-3.5 line-clamp-6 text-balance text-center text-[15px] font-normal leading-[1.55] text-[color-mix(in_oklab,var(--foreground)_80%,var(--text-body)_20%)]"
          id="today-hero-guidance"
        >
          {heroGuidance}
        </p>
        {feedbackLine ? (
          <p
            className="mt-3 text-center text-[12px] font-normal leading-snug text-muted-2/65"
            role="status"
          >
            {feedbackLine}
          </p>
        ) : null}
      </header>

      <div className="mt-8 px-0.5">
        <Link
          href={primaryCta.href}
          scroll={false}
          aria-describedby="today-hero-guidance"
          onClick={onPrimaryNavigate}
          className="group relative flex min-h-[58px] w-full touch-manipulation items-center justify-center overflow-hidden rounded-[var(--radius-today)] bg-gradient-to-b from-[color-mix(in_oklab,var(--accent)_88%,white_12%)] via-[var(--accent)] to-[var(--accent-deep)] px-6 text-[17px] font-semibold tracking-[-0.026em] text-white shadow-[0_12px_44px_-14px_rgba(41,92,255,0.5),0_6px_22px_-12px_rgba(0,0,0,0.58)] ring-1 ring-inset ring-white/[0.18] transition-[filter,transform,box-shadow] hover:shadow-[0_14px_50px_-12px_rgba(41,92,255,0.55),0_8px_26px_-14px_rgba(0,0,0,0.52)] hover:brightness-[1.06] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:min-h-[60px] sm:text-[18px]"
        >
          <span
            className="pointer-events-none absolute inset-x-0 top-0 h-[46%] bg-gradient-to-b from-white/[0.22] via-white/[0.06] to-transparent opacity-[0.88]"
            aria-hidden
          />
          <span className="relative z-[1] drop-shadow-[0_1px_2px_rgba(0,0,0,0.42)]">
            {primaryCta.label}
          </span>
        </Link>
      </div>

      <div className="mt-7 px-1">
        <div className={`mb-3 ${SECTION_EYEBROW}`}>{t("todayView.planBlockHeading")}</div>

        <div className="space-y-0">
          <div className="flex items-start justify-between gap-4 border-b border-white/[0.045] pb-3 text-[13px] leading-[1.42]">
            <div className="shrink-0 pt-px font-medium text-muted-2/68">
              {t("todayView.hubSectionWorkout")}
            </div>
            <div className="min-w-0 max-w-[74%] text-right text-[13.5px] font-medium tracking-[-0.018em] text-foreground/[0.94]">
              {planWorkoutLabel}
            </div>
          </div>

          <div className="flex items-start justify-between gap-4 pt-3 text-[13px] leading-[1.42]">
            <div className="shrink-0 pt-px font-medium text-muted-2/68">
              {t("todayView.hubSectionFood")}
            </div>
            <div className="min-w-0 max-w-[74%] text-right text-[13.5px] font-medium tracking-[-0.014em] text-foreground/[0.92]">
              {planFoodLabel}
            </div>
          </div>
        </div>
      </div>

      {afterCta ? (
        <div className="mt-5 w-full px-0.5 pt-1">{afterCta}</div>
      ) : null}

      <section
        className="mt-8 rounded-[1.125rem] border border-white/[0.07] bg-[color-mix(in_oklab,var(--foreground)_4.2%,transparent)] px-4 py-[1.125rem] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] sm:px-[1.125rem]"
        aria-labelledby="today-situation-h"
      >
        <h2 id="today-situation-h" className={SECTION_EYEBROW}>
          {situationHeading}
        </h2>

        <div className="mt-4 space-y-3.5">
          <div className="flex items-baseline justify-between gap-3 border-b border-white/[0.055] pb-3.5">
            <span className="shrink-0 text-[10.5px] font-medium uppercase tracking-[0.07em] text-muted-2/52">
              {statusRowLabel}
            </span>
            <span
              className="min-w-0 text-right text-[14px] font-semibold leading-snug tracking-[-0.02em] text-foreground/[0.95] tabular-nums"
              role="status"
            >
              {flowStatusLine}
            </span>
          </div>

          {briefRows.length > 0 ? (
            <ul className="space-y-2.5 text-left" aria-label={situationHeading}>
              {briefRows.map((row) => (
                <li
                  key={row.label}
                  className="flex items-baseline justify-between gap-3 text-[12.5px] leading-[1.4] sm:text-[13px]"
                >
                  <span className="shrink-0 font-medium text-muted-2/60">
                    {row.label}
                  </span>
                  <span className="min-w-0 text-right font-medium tabular-nums text-foreground/[0.84]">
                    {row.value}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {programTitle ? (
            <div className="border-t border-white/[0.05] pt-4">
              <div className="border-l-2 border-[color-mix(in_oklab,var(--accent)_42%,transparent)] pl-3.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-2/48">
                  {programEyebrow}
                </p>
                <p className="mt-2 text-[15px] font-semibold leading-snug tracking-[-0.024em] text-foreground/[0.95]">
                  {programTitle}
                </p>
                {programFocus ? (
                  <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-[1.48] text-muted-2/70">
                    {programFocus}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
