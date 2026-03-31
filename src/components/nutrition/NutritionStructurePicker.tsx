"use client";

import { NutritionAlternativesList } from "@/components/nutrition/NutritionAlternativesList";
import { NutritionRecommendationCard } from "@/components/nutrition/NutritionRecommendationCard";
import {
  alternativeNutritionForProfile,
  recommendNutritionForProfile,
} from "@/lib/nutritionLibrary";
import type { NutritionLibraryEntry } from "@/types/nutritionLibrary";
import type { OnboardingAnswers } from "@/types/coach";
import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

/** Selaussivu — sama kortti, enemmän meta */
export { NutritionRecommendationCard as NutritionStructureCard } from "@/components/nutrition/NutritionRecommendationCard";

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
      <NutritionRecommendationCard
        entry={recommended}
        recommended
        selected={selectedId === recommended.id}
        onSelect={() => setSelectedId(recommended.id)}
      />
      <NutritionAlternativesList
        entries={alternatives}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
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
