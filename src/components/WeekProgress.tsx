import type { WeekDayEntry } from "@/types/coach";
import { countTrainingDays, getMondayBasedIndex } from "@/lib/plan";

type Props = {
  days: WeekDayEntry[];
  referenceDate: Date;
};

export function WeekProgress({ days, referenceDate }: Props) {
  const todayIdx = getMondayBasedIndex(referenceDate);
  const trainingCount = countTrainingDays({ days });

  return (
    <section className="rounded-[var(--radius-xl)] border border-dashed border-white/12 bg-white/[0.025] px-5 py-6 sm:px-6 sm:py-7">
      <div>
        <p className="text-[15px] font-semibold tracking-tight text-foreground">
          {`${trainingCount} training day${trainingCount === 1 ? "" : "s"} · rest on the others`}
        </p>
        <p className="mt-1 text-[12px] text-muted-2">
          Your live list is in Today above.
        </p>
      </div>
      <div
        className="mt-6 flex gap-1.5 sm:gap-2"
        role="list"
        aria-label="Days this week"
      >
        {days.map((d, i) => {
          const isToday = i === todayIdx;
          const isTrain = !d.isRest;
          return (
            <div
              key={d.label}
              role="listitem"
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-2 sm:text-[10px]">
                {d.label}
              </span>
              <span
                className={`flex h-9 w-full max-w-[44px] items-center justify-center rounded-md text-[10px] font-bold sm:h-10 sm:max-w-none sm:text-[11px] ${
                  isToday
                    ? "ring-1 ring-accent ring-offset-2 ring-offset-[var(--ring-offset-bg)]"
                    : ""
                } ${
                  isTrain
                    ? "bg-gradient-to-br from-[#4c6fff] to-[#2f5fff] text-[#f8fbff] shadow-[0_6px_18px_rgba(47,95,255,0.35)]"
                    : "bg-white/[0.06] text-muted"
                }`}
                title={d.workoutLine}
              >
                {isTrain ? "T" : "R"}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-[11px] font-medium text-muted-2">
        T · training · R · rest
      </p>
    </section>
  );
}
