"use client";

import { useTranslation } from "@/hooks/useTranslation";
import type { ConsistencySnapshot } from "@/lib/progress";

export function ConsistencyCard({ snap }: { snap: ConsistencySnapshot }) {
  const { t } = useTranslation();
  return (
    <section className="coach-panel rounded-[var(--radius-xl)] px-4 py-5">
      <p className="progress-section-title px-0">{t("progress.sectionConsistency")}</p>
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <p className="text-[40px] font-semibold leading-none tabular-nums text-primary">
          {snap.pct}%
        </p>
        <p className="pb-1 text-[12px] text-muted-2">{t("progress.consistencyLineLabel")}</p>
      </div>
      <p className="mt-3 text-[14px] font-medium text-foreground">
        {t("progress.completedVsPlanned", {
          done: snap.completedTrainingDays,
          plan: snap.plannedTrainingDays,
        })}
      </p>
      <p className="mt-2 text-[12px] leading-snug text-muted-2">
        {t("progress.consistencyWindow", { n: snap.windowDays })}
      </p>
    </section>
  );
}
