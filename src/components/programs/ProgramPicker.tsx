"use client";

import { AlternativeProgramList } from "@/components/programs/AlternativeProgramList";
import { ProgramRecommendationCard } from "@/components/programs/ProgramRecommendationCard";
import {
  alternativeProgramsForProfile,
  recommendProgramForProfile,
} from "@/lib/coachProgramCatalog";
import type { OnboardingAnswers } from "@/types/coach";
import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  profile: OnboardingAnswers;
  onConfirm: (programLibraryId: string) => void;
};

export function ProgramPicker({ profile, onConfirm }: Props) {
  const { t } = useTranslation();
  const recommended = useMemo(
    () => recommendProgramForProfile(profile),
    [profile],
  );
  const alternatives = useMemo(
    () => alternativeProgramsForProfile(profile, recommended, 8),
    [profile, recommended],
  );
  const [selectedId, setSelectedId] = useState<string>(recommended.id);

  return (
    <div>
      <ProgramRecommendationCard
        entry={recommended}
        recommended
        selected={selectedId === recommended.id}
        onSelect={() => setSelectedId(recommended.id)}
        selectActionLabel={t("common.select")}
      />
      <AlternativeProgramList
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
