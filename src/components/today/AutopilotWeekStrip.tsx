"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { countTrainingDays, getMondayBasedIndex } from "@/lib/plan";
import type { WeekDayEntry } from "@/types/coach";

type Props = {
  enabled: boolean;
  onEnable: () => void;
  onDisable: () => void;
  days: WeekDayEntry[];
  referenceDate: Date;
  trainingDaysCount: number;
  mealStructureLabel: string;
  programFrameLine: string | null;
  className?: string;
};

export function AutopilotWeekStrip({
  enabled,
  onEnable,
  onDisable,
  days,
  referenceDate,
  trainingDaysCount,
  mealStructureLabel,
  programFrameLine,
  className = "",
}: Props) {
  const { t } = useTranslation();
  const todayIdx = getMondayBasedIndex(referenceDate);
  const nTrain = trainingDaysCount || countTrainingDays({ days });

  return (
    <section
      className={`mt-4 rounded-[var(--radius-xl)] border border-sky-400/25 bg-gradient-to-b from-sky-400/[0.08] to-white/[0.02] px-4 py-4 sm:px-5 sm:py-5 ${className}`}
      aria-labelledby="autopilot-week-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {enabled ? (
            <>
              <p
                id="autopilot-week-heading"
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-300/95"
              >
                {t("autopilot.badgeOn")}
              </p>
              <p className="mt-1.5 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-foreground">
                {t("autopilot.headlineReady")}
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">
                {t("autopilot.subCopy")}
              </p>
              <p className="mt-2 text-[11px] font-semibold tracking-tight text-sky-200/85">
                {t("brand.hook.keepLine")}
              </p>
            </>
          ) : (
            <>
              <p
                id="autopilot-week-heading"
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2"
              >
                {t("autopilot.stripEyebrowOff")}
              </p>
              <p className="mt-1.5 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-foreground">
                {t("autopilot.stripTitleOff")}
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-muted">
                {t("autopilot.stripHintOff")}
              </p>
            </>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {enabled ? (
            <button
              type="button"
              onClick={onDisable}
              className="rounded-[var(--radius-md)] border border-white/[0.12] bg-white/[0.06] px-3 py-2 text-[12px] font-medium text-muted transition hover:border-white/20 hover:text-foreground"
            >
              {t("autopilot.disableCta")}
            </button>
          ) : (
            <button
              type="button"
              onClick={onEnable}
              className="rounded-[var(--radius-md)] border border-sky-400/40 bg-sky-400/15 px-3 py-2 text-[12px] font-semibold text-sky-200 transition hover:border-sky-400/60 hover:bg-sky-400/25"
            >
              {t("autopilot.enableCta")}
            </button>
          )}
        </div>
      </div>

      <div
        className="mt-4 flex gap-1.5 sm:gap-2"
        role="list"
        aria-label={t("autopilot.weekAria")}
      >
        {days.map((d, i) => {
          const isToday = i === todayIdx;
          const isTrain = !d.isRest;
          return (
            <div
              key={d.label}
              role="listitem"
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
            >
              <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-2 sm:text-[10px]">
                {d.label}
              </span>
              <span
                className={`flex h-9 w-full max-w-[44px] items-center justify-center rounded-md text-[10px] font-bold sm:h-10 sm:max-w-none sm:text-[11px] ${
                  isToday
                    ? "ring-1 ring-sky-400/80 ring-offset-2 ring-offset-[var(--ring-offset-bg)]"
                    : ""
                } ${
                  isTrain
                    ? "bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-[0_6px_18px_rgba(14,116,188,0.35)]"
                    : "bg-white/[0.06] text-muted"
                }`}
                title={d.workoutLine}
              >
                {isTrain ? t("autopilot.weekTrainShort") : t("autopilot.weekRestShort")}
              </span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] font-medium text-muted-2">
        {t("autopilot.weekLegend")}
      </p>

      <div className="mt-4 space-y-2 rounded-[var(--radius-lg)] border border-white/[0.06] bg-white/[0.03] px-3 py-3 text-[12px] leading-snug text-muted">
        <p>
          <span className="font-semibold text-foreground/90">
            {t("autopilot.labelTraining")}{" "}
          </span>
          {t("autopilot.lineTraining", { n: nTrain })}
        </p>
        <p>
          <span className="font-semibold text-foreground/90">
            {t("autopilot.labelFood")}{" "}
          </span>
          {mealStructureLabel}
        </p>
        {programFrameLine ? (
          <p>
            <span className="font-semibold text-foreground/90">
              {t("autopilot.labelProgram")}{" "}
            </span>
            {programFrameLine}
          </p>
        ) : null}
        <p className="border-t border-white/[0.06] pt-2 text-[11px] text-muted-2">
          {t("autopilot.exceptionNote")}
        </p>
      </div>
    </section>
  );
}
