import type { WeekDayEntry } from "@/types/coach";
import { getMondayBasedIndex } from "@/lib/plan";

type Props = {
  days: WeekDayEntry[];
  referenceDate: Date;
};

export function WeekPlanCard({ days, referenceDate }: Props) {
  const todayIdx = getMondayBasedIndex(referenceDate);
  return (
    <div className="px-4 pb-4 pt-2">
      <p className="mb-4 text-[13px] leading-relaxed text-muted">
        Optional detail for the full week.
      </p>
      <ul className="divide-y divide-border">
        {days.map((d, i) => {
          const isToday = i === todayIdx;
          return (
            <li
              key={d.label}
              className={`flex flex-col gap-1 py-3.5 first:pt-1 last:pb-0 sm:flex-row sm:items-center sm:justify-between ${
                isToday ? "-mx-1 rounded-xl bg-accent-soft/40 px-3 py-3.5" : ""
              }`}
            >
              <span className="text-[14px] font-medium tracking-tight text-foreground">
                {d.label}
                {isToday ? (
                  <span className="ml-2 text-[12px] font-semibold text-accent">
                    today
                  </span>
                ) : null}
              </span>
              <span
                className={`text-[14px] leading-snug ${d.isRest ? "text-muted" : "text-foreground"}`}
              >
                {d.workoutLine}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
