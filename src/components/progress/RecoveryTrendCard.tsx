"use client";

import { useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import type { StreakSummary } from "@/lib/streaks";
import type { MessageKey } from "@/lib/i18n";

export function RecoveryTrendCard({
  streaks,
}: {
  referenceDate: Date;
  streaks: StreakSummary;
}) {
  const { t } = useTranslation();
  const hasDeviceSleep = false;

  const coachKey: MessageKey = useMemo(() => {
    if (streaks.combined >= 7) return "progress.recoveryCoachStrong";
    if (streaks.combined >= 3) return "progress.recoveryCoachBuild";
    return "progress.recoveryCoachFragile";
  }, [streaks.combined]);

  return (
    <section className="coach-panel rounded-[var(--radius-xl)] px-4 py-5">
      <p className="progress-section-title px-0">{t("progress.sectionRecovery")}</p>
      <p className="mt-3 text-[14px] font-medium leading-relaxed text-foreground">
        {t(coachKey)}
      </p>
      {!hasDeviceSleep ? (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-white/[0.06] bg-white/[0.02] px-3 py-3">
          <p className="text-[12px] leading-snug text-muted-2">
            {t("progress.sleepNoData")}
          </p>
          <p className="mt-2 text-[11px] leading-snug text-muted-2" role="status">
            {t("progress.sleepPlaceholderNote")}
          </p>
        </div>
      ) : null}
    </section>
  );
}
