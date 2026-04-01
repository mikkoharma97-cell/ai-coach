"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { buildProgramPreviewDays } from "@/lib/programPreview";
import type { OnboardingAnswers } from "@/types/coach";
import type { ProgramLibraryEntry } from "@/types/programLibrary";
import type { MessageKey } from "@/lib/i18n";

type Props = {
  entry: ProgramLibraryEntry;
  profile: OnboardingAnswers;
  onClose: () => void;
};

export function ProgramContentPreviewSheet({ entry, profile, onClose }: Props) {
  const { t, locale } = useTranslation();
  const fi = locale === "fi";

  const days = buildProgramPreviewDays(entry, profile, locale);

  const progressionKey = entry.progressionStyle
    ? (`programPreview.progressionStyle.${entry.progressionStyle}` as MessageKey)
    : null;
  const duration = entry.expectedDurationWeeks;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[var(--z-overlay-backdrop)] flex items-end justify-center bg-black/60 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top,0px)+2rem)] lg:items-center"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="program-preview-title"
        className="max-h-[min(88vh,40rem)] w-full max-w-md overflow-y-auto rounded-t-[var(--radius-2xl)] border border-border/80 bg-card shadow-[var(--shadow-float)] sm:rounded-[var(--radius-xl)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-[1] border-b border-border/60 bg-card/95 px-5 py-4 backdrop-blur-sm">
          <p
            id="program-preview-title"
            className="text-[1.05rem] font-semibold leading-tight tracking-[-0.02em] text-foreground"
          >
            {fi ? entry.nameFi : entry.nameEn}
          </p>
          <p className="mt-2 text-[13px] leading-snug text-muted">
            {fi ? entry.shortDescriptionFi : entry.shortDescriptionEn}
          </p>
          <dl className="mt-4 space-y-2 text-[12px] leading-snug text-muted-2">
            <div className="flex justify-between gap-3">
              <dt className="shrink-0 font-medium text-muted">
                {t("programPreview.fits")}
              </dt>
              <dd className="text-right">{fi ? entry.whyItFitsFi : entry.whyItFitsEn}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="shrink-0 font-medium text-muted">
                {t("programPreview.daysPerWeek")}
              </dt>
              <dd className="text-right tabular-nums">
                {entry.weeklyDays.min === entry.weeklyDays.max
                  ? `${entry.weeklyDays.min}`
                  : `${entry.weeklyDays.min}–${entry.weeklyDays.max}`}
              </dd>
            </div>
            {entry.splitType ? (
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 font-medium text-muted">
                  {t("programPreview.split")}
                </dt>
                <dd className="text-right">{entry.splitType}</dd>
              </div>
            ) : null}
            {progressionKey ? (
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 font-medium text-muted">
                  {t("programPreview.progressionType")}
                </dt>
                <dd className="text-right">{t(progressionKey)}</dd>
              </div>
            ) : null}
            {duration ? (
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 font-medium text-muted">
                  {t("programPreview.typicalBlock")}
                </dt>
                <dd className="text-right tabular-nums">
                  {t("programPreview.expectedWeeks", {
                    min: duration.min,
                    max: duration.max,
                  })}
                </dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-4 rounded-[var(--radius-md)] border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-[12px] leading-snug text-muted">
            {t("programTrust.whySameProgram")}
          </p>
        </div>

        <div className="space-y-4 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("programPreview.sampleDays")}
          </p>
          {days.map((d) => (
            <div
              key={d.dayIndex}
              className="rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.03] px-4 py-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                {t("programPreview.dayN", { n: d.dayIndex + 1 })} · {d.weekdayLabel}
              </p>
              {d.isRest ? (
                <p className="mt-2 text-[13px] text-muted">{t("programPreview.restDay")}</p>
              ) : (
                <>
                  <p className="mt-1.5 text-[13px] leading-snug text-muted">{d.sessionLine}</p>
                  {d.exerciseNames.length > 0 ? (
                    <ul className="mt-2 list-inside list-disc space-y-1 text-[12px] text-foreground/90">
                      {d.exerciseNames.slice(0, 8).map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                      {d.exerciseNames.length > 8 ? (
                        <li className="list-none text-muted-2">…</li>
                      ) : null}
                    </ul>
                  ) : null}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 border-t border-border/60 bg-card/95 px-5 py-4 backdrop-blur-sm">
          <button
            type="button"
            className="min-h-[48px] w-full rounded-[var(--radius-lg)] bg-accent px-4 text-[15px] font-semibold text-white"
            onClick={onClose}
          >
            {t("programPreview.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
