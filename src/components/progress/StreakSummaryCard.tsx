"use client";

import { StreakRhythmBlock, streakRhythmTone } from "@/components/streak/StreakRhythmBlock";
import { useTranslation } from "@/hooks/useTranslation";
import { hasEverMarkedDayDone } from "@/lib/storage";
import type { StreakSummary } from "@/lib/streaks";

export function StreakSummaryCard({ summary }: { summary: StreakSummary }) {
  const { t } = useTranslation();
  const brokenRecently =
    summary.combined === 0 && hasEverMarkedDayDone();
  const tone = streakRhythmTone(summary, brokenRecently);

  return (
    <section className="coach-panel rounded-[var(--radius-xl)] px-4 py-5">
      <p className="progress-section-title px-0">{t("progress.sectionStreak")}</p>
      <StreakRhythmBlock summary={summary} tone={tone} className="mt-5" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-md)] border border-white/[0.07] bg-white/[0.03] px-3 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("progress.workoutStreak")}
          </p>
          <p className="mt-1 text-[22px] font-semibold tabular-nums text-foreground">
            {summary.workout}
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-white/[0.07] bg-white/[0.03] px-3 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("progress.nutritionStreak")}
          </p>
          <p className="mt-1 text-[22px] font-semibold tabular-nums text-foreground">
            {summary.nutrition}
          </p>
        </div>
      </div>
    </section>
  );
}
