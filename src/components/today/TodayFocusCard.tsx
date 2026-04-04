"use client";

import Link from "next/link";

export type TodayFocusCardProps = {
  focusEyebrow: string;
  focusTitle: string;
  heroBody: string;
  /** 0–100, yksinkertainen edistyminen */
  progressPercent: number;
  primaryCta: { href: string; label: string };
  onPrimaryNavigate: () => void;
  showNotToday: boolean;
  notTodayOpen: boolean;
  onToggleNotToday: () => void;
  onPickLightDay: () => void;
  onPickTomorrow: () => void;
  feedbackLine: string | null;
  notTodayLabel: string;
  optionLightLabel: string;
  optionTomorrowLabel: string;
  progressAriaLabel: string;
};

export function TodayFocusCard({
  focusEyebrow,
  focusTitle,
  heroBody,
  progressPercent,
  primaryCta,
  onPrimaryNavigate,
  showNotToday,
  notTodayOpen,
  onToggleNotToday,
  onPickLightDay,
  onPickTomorrow,
  feedbackLine,
  notTodayLabel,
  optionLightLabel,
  optionTomorrowLabel,
  progressAriaLabel,
}: TodayFocusCardProps) {
  const pct = Math.min(100, Math.max(0, progressPercent));

  return (
    <div
      className="rounded-[var(--radius-lg)] border border-white/[0.09] bg-card/55 px-4 py-5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)] sm:px-5 sm:py-6"
      id="today-focus-card"
    >
      {feedbackLine ? (
        <p
          className="mb-4 rounded-[var(--radius-md)] border border-accent/22 bg-accent/[0.09] px-3 py-2.5 text-center text-[13px] font-medium leading-snug text-foreground/95"
          role="status"
        >
          {feedbackLine}
        </p>
      ) : null}

      <div
        className="mb-4"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label={progressAriaLabel}
      >
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07] opacity-90">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="px-0.5">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2/90">
          {focusEyebrow}
        </p>
        <h1 className="mt-2 text-center text-[1.15rem] font-semibold leading-tight tracking-[-0.03em] text-foreground/92 sm:text-[1.2rem]">
          {focusTitle}
        </h1>
        <p
          className="mt-3 line-clamp-4 text-balance text-center text-[15px] font-medium leading-snug text-muted"
          id="today-hero"
        >
          {heroBody}
        </p>
      </div>

      <div className="mt-7 px-0.5 sm:mt-8">
        <Link
          href={primaryCta.href}
          scroll={false}
          aria-describedby="today-hero"
          onClick={onPrimaryNavigate}
          className="flex min-h-[58px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent px-5 text-[18px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] ring-1 ring-white/12 transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {primaryCta.label}
        </Link>
      </div>

      {showNotToday ? (
        <div className="mt-5 border-t border-white/[0.05] pt-4">
          <button
            type="button"
            onClick={onToggleNotToday}
            className="w-full text-center text-[13px] font-medium text-muted-2/95 transition hover:text-muted"
            aria-expanded={notTodayOpen}
          >
            {notTodayLabel}
          </button>
          {notTodayOpen ? (
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={onPickLightDay}
                className="flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-md)] border border-white/[0.08] bg-white/[0.03] px-3 text-[14px] font-semibold text-muted transition hover:bg-white/[0.06] hover:text-foreground active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {optionLightLabel}
              </button>
              <button
                type="button"
                onClick={onPickTomorrow}
                className="flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-md)] border border-white/[0.08] bg-white/[0.03] px-3 text-[14px] font-semibold text-muted transition hover:bg-white/[0.06] hover:text-foreground active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {optionTomorrowLabel}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
