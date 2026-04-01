"use client";

import { useMemo } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  linearTrendDirection,
  loadWeightSeries,
  type ChartPoint,
} from "@/lib/progress";
import { MiniLineChart } from "@/components/progress/MiniLineChart";
import type { OnboardingAnswers } from "@/types/coach";
import type { MessageKey } from "@/lib/i18n";

/** Yksi kiinteä ikkuna — yksi pääkäyrä ilman välilehtiä. */
const WEEKS = 6 as const;

function dirKey(dir: ReturnType<typeof linearTrendDirection>): MessageKey {
  if (dir === "up") return "progress.weightDirUp";
  if (dir === "down") return "progress.weightDirDown";
  return "progress.weightDirFlat";
}

export function WeightTrendCard({
  profile,
  version = 0,
}: {
  profile: OnboardingAnswers | null;
  /** Nosta kun painodata muuttuu ulkoa (localStorage) */
  version?: number;
}) {
  const { t } = useTranslation();
  const { points, synthetic } = useMemo(
    () => loadWeightSeries(WEEKS, profile),
    [profile, version],
  );
  const chartPoints: ChartPoint[] = useMemo(() => {
    return points.map((p) => ({ dateKey: p.dateKey, value: p.value }));
  }, [points]);
  const dir = linearTrendDirection(chartPoints.map((p) => p.value));
  const hasChart = chartPoints.length >= 2;

  return (
    <section className="coach-panel rounded-[var(--radius-xl)] px-4 py-5">
      <p className="progress-section-title px-0">{t("progress.sectionWeight")}</p>
      <p className="mt-1 text-[11px] font-medium text-muted-2">
        {t("progress.weightWindowWeeks", { n: WEEKS })}
      </p>
      {hasChart ? (
        <>
          <div className="mt-5 overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.06] bg-black/20 px-3 py-4">
            <MiniLineChart points={chartPoints} />
          </div>
          <p className="mt-3 text-[14px] font-medium leading-snug text-foreground">
            <span className="text-muted-2">{t("progress.weightDirection")}</span>{" "}
            <span className="text-foreground">{t(dirKey(dir))}</span>
          </p>
          {synthetic ? (
            <p className="mt-2 text-[11px] leading-snug text-muted-2" role="status">
              {t("fallback.trendClearerWithData")}
            </p>
          ) : null}
        </>
      ) : (
        <p className="mt-4 text-[13px] leading-relaxed text-muted" role="status">
          {t("fallback.trendClearerWithData")}
        </p>
      )}
    </section>
  );
}
