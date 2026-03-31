"use client";

import type { NutritionLibraryEntry } from "@/types/nutritionLibrary";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  entry: NutritionLibraryEntry;
  selected?: boolean;
  onSelect: () => void;
  recommended?: boolean;
  showMeta?: boolean;
};

export function NutritionRecommendationCard({
  entry,
  selected,
  onSelect,
  recommended,
  showMeta = false,
}: Props) {
  const { locale } = useTranslation();
  const fi = locale === "fi";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[var(--radius-xl)] border px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring ${
        selected
          ? "border-accent bg-accent-soft shadow-[0_0_0_1px_rgb(42_92_191/0.12)]"
          : "border-border/80 bg-card/90 hover:border-accent/35"
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
          <p className="mt-1.5 text-[11px] text-muted-2">
            {fi
              ? `${entry.mealsPerDay} ateriaa · ${entry.shiftCompatible ? "vuoro ok" : "ei vuoroa"}`
              : `${entry.mealsPerDay} meals · ${entry.shiftCompatible ? "shift ok" : "no shift focus"}`}
          </p>
        </>
      ) : null}
      <span className="mt-3 inline-block rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
        {entry.styleTag}
      </span>
    </button>
  );
}
