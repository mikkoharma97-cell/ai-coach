"use client";

import type { NutritionLibraryEntry } from "@/types/nutritionLibrary";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  entry: NutritionLibraryEntry;
  selected?: boolean;
  onSelect?: () => void;
  onPreview?: () => void;
  selectActionLabel?: string;
  recommended?: boolean;
  showMeta?: boolean;
};

export function NutritionRecommendationCard({
  entry,
  selected,
  onSelect,
  onPreview,
  selectActionLabel,
  recommended,
  showMeta = false,
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
      {showMeta ? (
        <>
          <p className="mt-2 text-[12px] leading-snug text-muted-2">
            {fi ? entry.idealForFi : entry.idealForEn}
          </p>
          {entry.weeklyRhythmFi ? (
            <>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                {t("programCard.weeklyRhythm")}
              </p>
              <p className="mt-1.5 text-[12px] leading-snug text-muted">
                {fi ? entry.weeklyRhythmFi : entry.weeklyRhythmEn}
              </p>
            </>
          ) : null}
          {entry.exampleDayFi ? (
            <>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
                {t("programCard.exampleDay")}
              </p>
              <p className="mt-1.5 text-[12px] leading-snug text-foreground/90">
                {fi ? entry.exampleDayFi : entry.exampleDayEn}
              </p>
            </>
          ) : null}
          <p className="mt-2 text-[11px] text-muted-2">
            {fi
              ? `${entry.mealsPerDay} ateriaa · ${entry.shiftCompatible ? "vuoro ok" : "ei vuoroa"}`
              : `${entry.mealsPerDay} meals · ${entry.shiftCompatible ? "shift ok" : "no shift focus"}`}
          </p>
        </>
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
              className="min-h-[44px] flex-1 rounded-[var(--radius-lg)] border border-border/80 bg-white/[0.04] px-3 text-[13px] font-semibold text-foreground transition hover:border-accent/35"
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
              {selectActionLabel ?? t("nutritionPreview.chooseStructure")}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
