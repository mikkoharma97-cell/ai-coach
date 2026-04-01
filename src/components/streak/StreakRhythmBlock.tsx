"use client";

import type { StreakSummary } from "@/lib/streaks";
import { useTranslation } from "@/hooks/useTranslation";

export type StreakRhythmTone = "hot" | "cold" | "broken";

export function streakRhythmTone(
  summary: StreakSummary,
  brokenRecently: boolean,
): StreakRhythmTone {
  if (brokenRecently) return "broken";
  if (summary.combined >= 5) return "hot";
  return "cold";
}

export function StreakRhythmBlock({
  summary,
  tone,
  className = "",
}: {
  summary: StreakSummary;
  tone: StreakRhythmTone;
  className?: string;
}) {
  const { t } = useTranslation();

  const wrap =
    tone === "hot"
      ? "border-accent/22 bg-accent/[0.05] shadow-[0_8px_28px_-12px_rgba(59,130,246,0.22)]"
      : tone === "broken"
        ? "border-border/50 bg-white/[0.03]"
        : "border-border/40 bg-white/[0.02]";

  return (
    <div
      className={`rounded-[var(--radius-xl)] border px-4 py-4 ${wrap} ${className}`}
    >
      {tone === "broken" ? (
        <p className="text-[12px] font-medium leading-snug text-muted">
          {t("progress.streakBroken")}
        </p>
      ) : (
        <>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2">
            {t("progress.rhythmStreakTitle")}
          </p>
          <p className="mt-2 text-[28px] font-semibold tabular-nums leading-none tracking-tight text-primary/95">
            {summary.combined}
          </p>
          <p className="mt-2 text-[12px] font-medium text-muted">
            {t("progress.rhythmStreakLine", {
              tw: summary.workout,
              fn: summary.nutrition,
            })}
          </p>
        </>
      )}
    </div>
  );
}
