"use client";

import { NutritionRecommendationCard } from "@/components/nutrition/NutritionRecommendationCard";
import type { NutritionLibraryEntry } from "@/types/nutritionLibrary";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  entries: NutritionLibraryEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  showMeta?: boolean;
};

export function NutritionAlternativesList({
  entries,
  selectedId,
  onSelect,
  showMeta = false,
}: Props) {
  const { t } = useTranslation();
  if (entries.length === 0) return null;
  return (
    <div className="mt-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
        {t("nutritionLibrary.alternatives")}
      </p>
      <div className="mt-3 flex flex-col gap-2.5">
        {entries.map((e) => (
          <NutritionRecommendationCard
            key={e.id}
            entry={e}
            showMeta={showMeta}
            selected={selectedId === e.id}
            onSelect={() => onSelect(e.id)}
            selectActionLabel={t("common.select")}
          />
        ))}
      </div>
    </div>
  );
}
