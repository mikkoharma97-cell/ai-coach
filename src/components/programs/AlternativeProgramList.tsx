"use client";

import type { ProgramLibraryEntry } from "@/types/programLibrary";
import { ProgramRecommendationCard } from "@/components/programs/ProgramRecommendationCard";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  entries: ProgramLibraryEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function AlternativeProgramList({
  entries,
  selectedId,
  onSelect,
}: Props) {
  const { locale, t } = useTranslation();
  const fi = locale === "fi";
  if (entries.length === 0) return null;
  return (
    <div className="mt-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2">
        {fi ? "Muut vaihtoehdet" : "Other options"}
      </p>
      <div className="mt-3 flex flex-col gap-2.5">
        {entries.map((e) => (
          <ProgramRecommendationCard
            key={e.id}
            entry={e}
            selected={selectedId === e.id}
            onSelect={() => onSelect(e.id)}
            selectActionLabel={t("common.select")}
          />
        ))}
      </div>
    </div>
  );
}
