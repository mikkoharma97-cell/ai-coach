"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { getPreviousSessionCompactLine } from "@/lib/workoutCoachFeel";
import {
  effectiveSetCount,
  repsTargetLine,
} from "@/lib/workoutExerciseDisplay";
import type { Locale } from "@/lib/i18n";
import type { ProExercise } from "@/types/pro";
import Link from "next/link";

const PRIMARY =
  "flex h-[56px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[17px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const SECONDARY_LINK =
  "mt-4 block text-center text-[13px] font-medium text-muted-2 underline decoration-white/[0.12] underline-offset-4 transition hover:text-foreground";

export type WorkoutDayOverviewProps = {
  workoutTitle: string;
  focusLine: string | null;
  durationLabel: string | null;
  contextLine: string | null;
  blocks: ProExercise[];
  todayDayKey: string;
  locale: Locale;
  onStartSession: () => void;
};

export function WorkoutDayOverview({
  workoutTitle,
  focusLine,
  durationLabel,
  contextLine,
  blocks,
  todayDayKey,
  locale,
  onStartSession,
}: WorkoutDayOverviewProps) {
  const { t } = useTranslation();

  return (
    <main className="coach-page">
      <Container
        size="phone"
        className="flex min-h-0 flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1.5 sm:pt-2"
      >
        <div className="workout-exercise-surface mt-1 flex flex-col px-4 pb-6 pt-5 sm:px-5 sm:pb-7 sm:pt-6">
          <div className="workout-exercise-surface-inner">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
              {t("workoutOverview.eyebrow")}
            </p>
            <h1 className="mt-2 text-balance text-[1.4rem] font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-[1.45rem]">
              {workoutTitle}
            </h1>
            {focusLine ? (
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{focusLine}</p>
            ) : null}
            {contextLine ? (
              <p className="mt-2 text-[13px] leading-snug text-muted-2">{contextLine}</p>
            ) : null}
            {durationLabel ? (
              <p className="mt-3 text-[13px] font-medium tabular-nums text-muted-2">
                {durationLabel}
              </p>
            ) : null}

            <ul className="mt-6 space-y-3" aria-label={t("workoutOverview.listLabel")}>
              {blocks.map((ex, i) => {
                const sets = effectiveSetCount(ex);
                const repT = repsTargetLine(ex, locale);
                const prev = getPreviousSessionCompactLine(
                  ex,
                  todayDayKey,
                  locale,
                );
                return (
                  <li
                    key={`${ex.id}-${i}`}
                    className="rounded-[var(--radius-md)] border border-white/[0.07] bg-white/[0.02] px-3 py-3"
                  >
                    <p className="text-[15px] font-semibold leading-snug text-foreground">
                      {ex.name}
                    </p>
                    <p className="mt-1 text-[12px] font-medium text-muted-2">
                      {t("workoutOverview.targetLine", {
                        sets: String(sets),
                        reps: repT,
                      })}
                    </p>
                    {prev ? (
                      <p className="mt-1.5 text-[12px] leading-snug text-muted-2/90">
                        {t("workoutSession.prevSessionShow", { line: prev })}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <button type="button" onClick={onStartSession} className={`${PRIMARY} mt-8`}>
              {t("workoutOverview.ctaStart")}
            </button>
            <Link href="/app" className={SECONDARY_LINK}>
              {t("workoutOverview.backToday")}
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
