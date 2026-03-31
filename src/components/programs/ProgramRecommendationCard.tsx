"use client";

import type { ProgramLibraryEntry } from "@/types/programLibrary";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  entry: ProgramLibraryEntry;
  selected?: boolean;
  onSelect?: () => void;
  recommended?: boolean;
};

export function ProgramRecommendationCard({
  entry,
  selected,
  onSelect,
  recommended,
}: Props) {
  const { locale } = useTranslation();
  const fi = locale === "fi";
  const interactive = Boolean(onSelect);
  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={() => onSelect?.()}
      className={`w-full rounded-[var(--radius-xl)] border px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring ${
        selected
          ? "border-accent bg-accent-soft shadow-[0_0_0_1px_rgb(42_92_191/0.12)]"
          : "border-border/80 bg-card/90 hover:border-accent/35"
      } ${!interactive ? "cursor-default" : ""}`}
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
      {entry.splitType ? (
        <p className="mt-1.5 text-[11px] leading-snug text-muted-2">
          {fi ? "Jako" : "Split"}: {entry.splitType}
        </p>
      ) : null}
      <p className="mt-2 text-[11px] tabular-nums text-muted-2">
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
      <p className="mt-2 text-[12px] leading-snug text-muted-2">
        {fi ? entry.whyItFitsFi : entry.whyItFitsEn}
      </p>
      <span className="mt-3 inline-block rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
        {entry.styleTag}
      </span>
    </button>
  );
}
