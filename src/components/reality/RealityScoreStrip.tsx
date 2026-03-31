"use client";

import type { RealityScore } from "@/lib/realityScore";
import type { Locale } from "@/lib/i18n";

export function RealityScoreStrip({
  score,
  locale,
}: {
  score: RealityScore;
  locale: Locale;
}) {
  const label = locale === "en" ? score.labelEn : score.labelFi;
  const reason = locale === "en" ? score.reasonEn : score.reasonFi;
  return (
    <div
      className="mt-3 rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5"
      role="status"
    >
      <p className="text-[12px] font-semibold tracking-[-0.02em] text-foreground/95">
        <span>{label}</span>
        <span className="text-border-strong" aria-hidden>
          {" "}
          ·{" "}
        </span>
        <span className="tabular-nums text-muted-2">{score.score} %</span>
      </p>
      <p className="mt-1 text-[11px] leading-snug text-muted">{reason}</p>
    </div>
  );
}
