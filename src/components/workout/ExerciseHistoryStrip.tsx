"use client";

import type { ExerciseHistoryRow } from "@/lib/workoutHistory";

type Props = {
  title: string;
  rows: readonly ExerciseHistoryRow[];
  /** Yksi rivi viimeisin — log-vaihe */
  compactLine?: string | null;
  progressionHint?: string | null;
  /** "full" = show, "compact" = log */
  variant?: "full" | "compact";
};

/**
 * Sama liike — edelliset kerrat. Ei dashboard, ei korttipinoa.
 */
export function ExerciseHistoryStrip({
  title,
  rows,
  compactLine,
  progressionHint,
  variant = "full",
}: Props) {
  if (variant === "compact") {
    if (!compactLine) return null;
    return (
      <div
        className="mt-3 border-t border-white/[0.05] pt-3"
        aria-label={`${title} ${compactLine}`}
      >
        <p className="text-[13px] font-semibold text-muted-2">{title}</p>
        <p className="mt-1 text-[15px] font-semibold tabular-nums tracking-[-0.02em] text-foreground/90">
          {compactLine}
        </p>
      </div>
    );
  }

  if (rows.length === 0) return null;

  return (
    <div
      className="mt-5 border-t border-white/[0.06] pt-5"
      aria-label={title}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2/75">
        {title}
      </p>
      <ul className="mt-2.5 space-y-0">
        {rows.map((r) => (
          <li
            key={r.id}
            className="border-b border-white/[0.05] py-2 last:border-b-0 last:pb-0 first:pt-0"
          >
            <p className="text-[12px] leading-snug text-muted-2/90">
              <span className="tabular-nums text-muted-2">{r.dateLabel}</span>
              <span className="text-muted-2/50"> · </span>
              <span className="font-medium text-foreground/75">
                {r.weightLabel}
              </span>
              <span className="text-muted-2/50"> · </span>
              <span className="tabular-nums text-foreground/70">{r.repsLabel}</span>
            </p>
          </li>
        ))}
      </ul>
      {progressionHint ? (
        <p className="mt-3 text-[12px] leading-snug text-muted-2/80">{progressionHint}</p>
      ) : null}
    </div>
  );
}
