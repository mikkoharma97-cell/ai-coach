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
      ? "border-accent/35 bg-accent/[0.08] shadow-[0_0_32px_-14px_rgba(59,130,246,0.55)]"
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
          <p className="mt-2 text-[34px] font-semibold tabular-nums leading-none tracking-tight text-primary">
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
