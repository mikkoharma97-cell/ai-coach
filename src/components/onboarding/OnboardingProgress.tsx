"use client";

type Props = {
  /** 1-based step within questions (1…total) */
  current: number;
  total: number;
};

export function OnboardingProgress({ current, total }: Props) {
  const pct = Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="w-full">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-2">
          Building
        </span>
        <span className="text-[10px] font-medium tabular-nums text-muted-2">
          {current}/{total}
        </span>
      </div>
      <div
        className="h-[3px] overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Step ${current} of ${total}`}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
