"use client";

import type { WeekAdaptDay, WeekAdaptState } from "@/lib/weekAdaptMap";
import type { Locale, TranslateFn } from "@/lib/i18n";

const STATE_CLASS: Record<
  WeekAdaptState,
  string
> = {
  baseline: "border-foreground/12 bg-foreground/[0.07] text-muted-2",
  push: "border-accent/45 bg-accent/22 text-foreground shadow-[0_0_20px_-8px_rgba(59,130,246,0.45)]",
  recovery:
    "border-sky-500/35 bg-sky-500/[0.12] text-sky-100/90 shadow-[0_0_18px_-10px_rgba(56,189,248,0.35)]",
  rebalance:
    "border-violet-500/40 bg-violet-500/[0.11] text-violet-100/90",
  exception:
    "border-amber-900/55 bg-amber-950/50 text-amber-100/85",
  flexible:
    "border-white/[0.12] bg-white/[0.05] text-foreground/85 backdrop-blur-[2px]",
};

export function WeekAdaptMap({
  weekDayLabels,
  days,
  locale,
  t,
}: {
  weekDayLabels: string[];
  days: WeekAdaptDay[];
  locale: Locale;
  t: TranslateFn;
}) {
  return (
    <div className="mt-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
        {t("plan.weekAdaptEyebrow")}
      </p>
      <div
        className="mt-3 flex gap-1 sm:gap-1.5"
        role="list"
        aria-label={t("plan.weekAdaptAria")}
      >
        {days.map((d, i) => {
          const short = weekDayLabels[i]?.slice(0, 2) ?? "—";
          const cls = STATE_CLASS[d.state];
          const lab = locale === "en" ? d.labelEn : d.labelFi;
          return (
            <div
              key={d.dayKey}
              role="listitem"
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-muted-2">
                {short}
              </span>
              <div
                className={`flex h-11 w-full max-w-[2.75rem] flex-col items-center justify-center rounded-[11px] border text-[8px] font-semibold uppercase leading-tight ${cls}`}
                title={lab}
              >
                <span className="px-0.5 text-center [font-size:7.5px] [line-height:1.1]">
                  {lab.slice(0, 3)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2.5 text-[11px] font-medium leading-snug text-muted">
        {t("plan.weekAdaptLine1")}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-muted-2">
        {t("plan.weekAdaptLine2")}
      </p>
    </div>
  );
}
