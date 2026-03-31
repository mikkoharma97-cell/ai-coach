"use client";

import { RealityScoreStrip } from "@/components/reality/RealityScoreStrip";
import { useTranslation } from "@/hooks/useTranslation";
import type { RealityScore } from "@/lib/realityScore";
import type { ProgressHeroInsight } from "@/lib/progress";

export function ProgressHeroInsightCard({
  insight,
  realityScore,
}: {
  insight: ProgressHeroInsight | null;
  realityScore?: RealityScore | null;
}) {
  const { t, locale } = useTranslation();
  if (!insight && !realityScore) return null;
  return (
    <section className="coach-panel rounded-[var(--radius-xl)] border border-accent/20 bg-gradient-to-b from-accent-soft/35 to-white/[0.02] px-4 py-5 shadow-[0_12px_40px_-18px_rgba(0,0,0,0.45)]">
      {insight ? (
        <>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            {t("progress.heroEyebrow")}
          </p>
          <p className="mt-3 text-[1.35rem] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground">
            {t(insight.headlineKey)}
          </p>
          <p className="mt-3 text-[13px] font-medium leading-snug text-muted">
            {t(insight.proofKey, insight.proofParams)}
          </p>
        </>
      ) : (
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          {t("progress.heroEyebrow")}
        </p>
      )}
      {realityScore ? (
        <div className={insight ? "mt-4" : "mt-0"}>
          <RealityScoreStrip score={realityScore} locale={locale} />
        </div>
      ) : null}
    </section>
  );
}
