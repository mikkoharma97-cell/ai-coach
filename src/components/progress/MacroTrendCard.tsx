"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  loadMacroDays,
  macroAverages,
  macroRhythmStable,
  type ChartPoint,
} from "@/lib/progress";
import { MiniLineChart } from "@/components/progress/MiniLineChart";
import type { OnboardingAnswers } from "@/types/coach";
import type { MessageKey } from "@/lib/i18n";

const tabs: { days: 7 | 30 | 90; key: MessageKey }[] = [
  { days: 7, key: "progress.macroTab7" },
  { days: 30, key: "progress.macroTab30" },
  { days: 90, key: "progress.macroTab90" },
];

export function MacroTrendCard({
  answers,
  referenceDate,
  rebalanceActive = false,
}: {
  answers: OnboardingAnswers;
  referenceDate: Date;
  /** Nutrition rebalance window — light flag, not medical advice */
  rebalanceActive?: boolean;
}) {
  const { t } = useTranslation();
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const days = useMemo(
    () => loadMacroDays(answers, referenceDate, range),
    [answers, referenceDate, range],
  );
  const avgs = useMemo(() => macroAverages(days, answers), [days, answers]);
  const stable = macroRhythmStable(days);
  const chartPoints: ChartPoint[] = useMemo(() => {
    return days
      .filter((d) => d.kcal > 0)
      .map((d) => ({ dateKey: d.dateKey, value: d.kcal }));
  }, [days]);

  return (
    <section className="coach-panel rounded-[var(--radius-xl)] px-4 py-5">
      <p className="progress-section-title px-0">{t("progress.sectionMacros")}</p>
      {rebalanceActive ? (
        <div className="mt-2 space-y-1">
          <p className="text-[11px] font-semibold text-accent">
            {t("progress.rebalanceActive")}
          </p>
          <p className="text-[11px] leading-snug text-muted-2">
            {t("rebalance.leadLine")}
          </p>
          <p className="text-[11px] leading-snug text-muted-2">
            {t("rebalance.noPunishLine")}
          </p>
        </div>
      ) : null}
      <div className="mt-4 flex gap-1 rounded-[var(--radius-md)] border border-white/[0.06] bg-black/25 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.days}
            type="button"
            onClick={() => setRange(tab.days)}
            className={`min-h-[40px] flex-1 rounded-[10px] text-[11px] font-semibold uppercase tracking-[0.08em] transition ${
              range === tab.days
                ? "bg-accent-soft text-primary"
                : "text-muted-2 hover:text-foreground"
            }`}
          >
            {t(tab.key)}
          </button>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3">
        <div className="rounded-[var(--radius-md)] border border-white/[0.06] bg-white/[0.04] px-3 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("progress.avgCalories")}
          </p>
          <p className="mt-1.5 text-[26px] font-semibold tabular-nums leading-none tracking-tight text-foreground">
            {avgs.avgKcal}
          </p>
          <p className="mt-1 text-[10px] text-muted-2">kcal</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-white/[0.06] bg-white/[0.03] px-3 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("progress.avgProtein")}
          </p>
          <p className="mt-1.5 text-[26px] font-semibold tabular-nums leading-none tracking-tight text-foreground">
            {avgs.avgProteinG}
          </p>
          <p className="mt-1 text-[10px] text-muted-2">g · {t("progress.macroProteinShort")}</p>
        </div>
      </div>
      <p className="mt-4 text-[15px] font-semibold leading-snug text-foreground">
        {stable ? t("progress.macroRhythmSentenceOk") : t("progress.macroRhythmSentenceOff")}
      </p>
      <p className="mt-2 text-[11px] leading-snug text-muted-2">
        {t("progress.macroProteinNote")}
      </p>
      <div className="mt-5 overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.06] bg-black/20 px-3 py-4">
        {chartPoints.length >= 2 ? (
          <MiniLineChart points={chartPoints} />
        ) : (
          <p className="py-8 text-center text-[12px] text-muted-2">
            {t("fallback.firstWeeksBuildView")}
          </p>
        )}
      </div>
    </section>
  );
}
