"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { loadWeightSeries } from "@/lib/progress";
import type { OnboardingAnswers } from "@/types/coach";

type Props = {
  profile: OnboardingAnswers;
  consistencyPct: number;
  streakDays: number;
  version: number;
};

/**
 * Yksi tiivis kehitysnäkymä: paino + rytmi + putki (ei dashboardähkyä).
 */
export function DevelopmentTrajectoryCard({
  profile,
  consistencyPct,
  streakDays,
  version,
}: Props) {
  const { t, locale } = useTranslation();
  const series = loadWeightSeries(6, profile);
  const last = series.points[series.points.length - 1];
  const weightLabel =
    last != null
      ? locale === "en"
        ? `${last.value} kg`
        : `${last.value} kg`
      : "—";

  const line = t("engine.progressTrajectoryLine", {
    weight: weightLabel,
    consistency: Math.round(consistencyPct),
    streak: streakDays,
  });

  return (
    <section
      className="rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.04] px-4 py-4"
      aria-labelledby="dev-traj-heading"
    >
      <p
        id="dev-traj-heading"
        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2"
      >
        {t("engine.progressTrajectoryEyebrow")}
      </p>
      <p
        className="mt-2 text-[14px] font-medium leading-snug text-foreground/95"
        key={version}
      >
        {line}
      </p>
    </section>
  );
}
