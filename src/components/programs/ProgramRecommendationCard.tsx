"use client";

import type { ProgramLibraryEntry } from "@/types/programLibrary";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  entry: ProgramLibraryEntry;
  selected?: boolean;
  onSelect?: () => void;
  onPreview?: () => void;
  /** Oletus: `programPreview.chooseProgram` */
  selectActionLabel?: string;
  recommended?: boolean;
};

export function ProgramRecommendationCard({
  entry,
  selected,
  onSelect,
  onPreview,
  selectActionLabel,
  recommended,
}: Props) {
  const { t, locale } = useTranslation();
  const fi = locale === "fi";
  return (
    <div
      className={`w-full rounded-[var(--radius-xl)] border px-4 py-4 text-left transition ${
        selected
          ? "border-accent bg-accent-soft shadow-[0_0_0_1px_rgb(42_92_191/0.12)]"
          : "border-border/80 bg-card/90"
      }`}
    >
      {recommended ? (
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
          {fi ? "Suositeltu" : "Recommended"}
        </span>
      ) : null}
      <p className="mt-1 text-[16px] font-semibold tracking-[-0.02em] text-foreground">
        {fi ? entry.nameFi : entry.nameEn}
      </p>
      <p className="mt-2 text-[13px] leading-snug text-muted">
        {fi ? entry.shortDescriptionFi : entry.shortDescriptionEn}
      </p>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
        {t("programCard.forWho")}
      </p>
      <p className="mt-1.5 text-[13px] leading-snug text-foreground/95">
        {fi ? entry.whyItFitsFi : entry.whyItFitsEn}
      </p>
      {entry.splitType ? (
        <p className="mt-3 text-[11px] leading-snug text-muted-2">
          <span className="font-semibold text-muted">{t("programPreview.split")}: </span>
          {entry.splitType}
        </p>
      ) : null}
      <p className="mt-1.5 text-[11px] tabular-nums text-muted-2">
        {entry.weeklyDays.min === entry.weeklyDays.max
          ? `${entry.weeklyDays.min} ${fi ? "pv/vko" : "d/wk"}`
          : `${entry.weeklyDays.min}–${entry.weeklyDays.max} ${fi ? "pv/vko" : "d/wk"}`}
        {" · "}
        {entry.trainingVenue === "gym"
          ? fi
            ? "Sali"
            : "Gym"
          : entry.trainingVenue === "home"
            ? fi
              ? "Koti"
              : "Home"
            : fi
              ? "Sali/koti"
              : "Gym/home"}
        {entry.styleTags?.length
          ? ` · ${entry.styleTags.slice(0, 2).join(", ")}`
          : ""}
      </p>
      {onPreview ? (
        <p className="mt-2 text-[11px] leading-snug text-muted-2">
          {t("programCard.exampleDaysHint")}
        </p>
      ) : null}
      <span className="mt-3 inline-block rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
        {entry.styleTag}
      </span>

      {onPreview || onSelect ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {onPreview ? (
            <button
              type="button"
              onClick={onPreview}
              className="min-h-[44px] flex-1 rounded-[var(--radius-lg)] border border-border/80 bg-white/[0.04] px-3 text-[13px] font-semibold text-foreground transition hover:border-accent/35 hover:bg-white/[0.07]"
            >
              {t("programPreview.viewContent")}
            </button>
          ) : null}
          {onSelect ? (
            <button
              type="button"
              onClick={onSelect}
              className="min-h-[44px] flex-1 rounded-[var(--radius-lg)] bg-accent px-3 text-[13px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)]"
            >
              {selectActionLabel ?? t("programPreview.chooseProgram")}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
