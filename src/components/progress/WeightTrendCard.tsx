"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  linearTrendDirection,
  loadWeightSeries,
  type ChartPoint,
} from "@/lib/progress";
import { MiniLineChart } from "@/components/progress/MiniLineChart";
import type { OnboardingAnswers } from "@/types/coach";
import type { MessageKey } from "@/lib/i18n";

const tabs: { w: 3 | 6 | 12; key: MessageKey }[] = [
  { w: 3, key: "progress.weightTab3" },
  { w: 6, key: "progress.weightTab6" },
  { w: 12, key: "progress.weightTab12" },
];

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
  const [weeks, setWeeks] = useState<3 | 6 | 12>(6);
  const { points, synthetic } = useMemo(
    () => loadWeightSeries(weeks, profile),
    [weeks, profile, version],
  );
  const chartPoints: ChartPoint[] = useMemo(() => {
    return points.map((p) => ({ dateKey: p.dateKey, value: p.value }));
  }, [points]);
  const dir = linearTrendDirection(chartPoints.map((p) => p.value));
  const hasChart = chartPoints.length >= 2;

  return (
    <section className="coach-panel rounded-[var(--radius-xl)] px-4 py-5">
      <p className="progress-section-title px-0">{t("progress.sectionWeight")}</p>
      <div className="mt-3 flex gap-1 rounded-[var(--radius-md)] border border-white/[0.06] bg-black/25 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.w}
            type="button"
            onClick={() => setWeeks(tab.w)}
            className={`min-h-[40px] flex-1 rounded-[10px] text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
              weeks === tab.w
                ? "bg-accent-soft text-primary"
                : "text-muted-2 hover:text-foreground"
            }`}
          >
            {t(tab.key)}
          </button>
        ))}
      </div>
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
