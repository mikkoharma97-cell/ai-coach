"use client";

import { useTranslation } from "@/hooks/useTranslation";
import type { ConsistencySnapshot } from "@/lib/progress";

type Props = {
  consistency: ConsistencySnapshot;
  combinedStreak: number;
};

/** Kaksi tukilukemaa ilman erillisiä graafeja — “one truth” -näkymän tuki. */
export function ProgressMetricsRow({ consistency, combinedStreak }: Props) {
  const { t } = useTranslation();
  return (
    <section
      className="mt-6 grid grid-cols-2 gap-3"
      aria-label={t("progress.supportMetricsAria")}
    >
      <div className="rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03] px-3 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
          {t("progress.sectionConsistency")}
        </p>
        <p className="mt-2 text-[2rem] font-semibold tabular-nums leading-none text-primary">
          {consistency.pct}%
        </p>
        <p className="mt-2 text-[11px] leading-snug text-muted-2">
          {t("progress.completedVsPlanned", {
            done: consistency.completedTrainingDays,
            plan: consistency.plannedTrainingDays,
          })}
        </p>
      </div>
      <div className="rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03] px-3 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
          {t("progress.supportStreakEyebrow")}
        </p>
        <p className="mt-2 text-[2rem] font-semibold tabular-nums leading-none text-primary">
          {combinedStreak}
        </p>
        <p className="mt-2 text-[11px] leading-snug text-muted-2">
          {t("progress.supportStreakHint")}
        </p>
      </div>
    </section>
  );
}
