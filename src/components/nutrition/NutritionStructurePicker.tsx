"use client";

import {
  alternativeNutritionForProfile,
  recommendNutritionForProfile,
} from "@/lib/nutritionLibrary";
import type { NutritionLibraryEntry } from "@/types/nutritionLibrary";
import type { OnboardingAnswers } from "@/types/coach";
import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export function NutritionStructureCard({
  entry,
  selected,
  onSelect,
  recommended,
  showMeta = false,
}: {
  entry: NutritionLibraryEntry;
  selected?: boolean;
  onSelect: () => void;
  recommended?: boolean;
  /** Selaa-sivulla: idealFor + ateriat / vuoro */
  showMeta?: boolean;
}) {
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

type Props = {
  profile: OnboardingAnswers;
  onConfirm: (nutritionLibraryId: string) => void;
};

export function NutritionStructurePicker({ profile, onConfirm }: Props) {
  const { t } = useTranslation();
  const recommended = useMemo(
    () => recommendNutritionForProfile(profile),
    [profile],
  );
  const alternatives = useMemo(
    () => alternativeNutritionForProfile(profile, recommended, 5),
    [profile, recommended],
  );
  const [selectedId, setSelectedId] = useState<string>(recommended.id);

  return (
    <div>
      <NutritionStructureCard
        entry={recommended}
        recommended
        selected={selectedId === recommended.id}
        onSelect={() => setSelectedId(recommended.id)}
      />
      {alternatives.length > 0 ? (
        <div className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("nutritionLibrary.alternatives")}
          </p>
          <div className="mt-3 flex flex-col gap-2.5">
            {alternatives.map((e: NutritionLibraryEntry) => (
              <NutritionStructureCard
                key={e.id}
                entry={e}
                selected={selectedId === e.id}
                onSelect={() => setSelectedId(e.id)}
              />
            ))}
          </div>
        </div>
      ) : null}
      <button
        type="button"
        className="mt-8 flex h-[52px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[16px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99]"
        onClick={() => onConfirm(selectedId)}
      >
        {t("onboarding.continue")}
      </button>
    </div>
  );
}
