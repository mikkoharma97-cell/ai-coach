"use client";

type Props = {
  hubBlockClass: string;
  sectionTitle: string;
  workoutStatusLabel: string;
  /** Lepopäivällä false — yksi viesti hero-kortissa, ei toistoa. */
  showSummaryLine: boolean;
  summaryLine: string;
};

/**
 * Toinen taso: ei toista pää-CTA:ta — vain tila + tiivis kuvaus (linkki poistettu).
 */
export function TodayWorkoutHub({
  hubBlockClass,
  sectionTitle,
  workoutStatusLabel,
  showSummaryLine,
  summaryLine,
}: Props) {
  return (
    <section
      className={hubBlockClass}
      aria-labelledby="today-hub-workout-h"
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          id="today-hub-workout-h"
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2"
        >
          {sectionTitle}
        </h3>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-muted">
          {workoutStatusLabel}
        </span>
      </div>
      {showSummaryLine ? (
        <p className="mt-2 line-clamp-2 text-[14px] font-medium leading-snug text-muted">
          {summaryLine}
        </p>
      ) : null}
    </section>
  );
}
