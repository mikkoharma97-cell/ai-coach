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
  "flex h-[52px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[16px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const SECONDARY_LINK =
  "mt-3 block text-center text-[12px] font-medium text-muted-2 underline decoration-white/[0.1] underline-offset-4 transition hover:text-foreground";

export type WorkoutDayOverviewProps = {
  workoutTitle: string;
  focusLine: string | null;
  durationLabel: string | null;
  blocks: ProExercise[];
  todayDayKey: string;
  locale: Locale;
  onStartSession: () => void;
};

export function WorkoutDayOverview({
  workoutTitle,
  focusLine,
  durationLabel,
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
        <div className="workout-exercise-surface mt-0.5 flex flex-col px-4 pb-5 pt-4 sm:px-5 sm:pb-6 sm:pt-5">
          <div className="workout-exercise-surface-inner">
            <h1 className="text-balance text-[1.35rem] font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-[1.4rem]">
              {workoutTitle}
            </h1>
            {focusLine ? (
              <p className="mt-2 text-[14px] leading-snug text-muted-2">{focusLine}</p>
            ) : null}
            {durationLabel ? (
              <p className="mt-2 text-[12px] font-medium tabular-nums text-muted-2/90">
                {durationLabel}
              </p>
            ) : null}

            <ul className="mt-4 space-y-2" aria-label={t("workoutOverview.listLabel")}>
              {blocks.map((ex, i) => {
                const sets = effectiveSetCount(ex);
                const repT = repsTargetLine(ex, locale);
                const prev = getPreviousSessionCompactLine(ex, todayDayKey, locale);
                const isFirst = i === 0;
                return (
                  <li
                    key={`${ex.id}-${i}`}
                    className={`rounded-[var(--radius-md)] border px-3 py-2.5 ${
                      isFirst
                        ? "border-accent/25 bg-white/[0.04]"
                        : "border-white/[0.06] bg-white/[0.02]"
                    }`}
                  >
                    <p className="text-[14px] font-semibold leading-snug text-foreground">
                      {ex.name}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium text-muted-2">
                      {t("workoutOverview.targetLine", {
                        sets: String(sets),
                        reps: repT,
                      })}
                    </p>
                    {prev ? (
                      <p className="mt-1 text-[11px] leading-snug text-muted-2/85">
                        {t("workoutSession.prevSessionShow", { line: prev })}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <button type="button" onClick={onStartSession} className={`${PRIMARY} mt-5`}>
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
