import { normalizeProfileForEngine } from "@/lib/coach/profileNormalizer";
import { applyProgramLibraryEntry } from "@/lib/coachProgramCatalog";
import { translate, type Locale } from "@/lib/i18n";
import { normalizeProgramPackageId } from "@/lib/programPackages";
import { effectiveTrainingLevel } from "@/lib/profileTraining";
import { generateWorkoutDay } from "@/lib/training/generator";
import type { OnboardingAnswers } from "@/types/coach";
import type { ProgramLibraryEntry } from "@/types/programLibrary";

const WD_KEYS = [
  "plan.base.wd0",
  "plan.base.wd1",
  "plan.base.wd2",
] as const;

export type ProgramPreviewDay = {
  dayIndex: number;
  weekdayLabel: string;
  isRest: boolean;
  sessionLine: string;
  exerciseNames: string[];
};

export function buildProgramPreviewDays(
  entry: ProgramLibraryEntry,
  baseProfile: OnboardingAnswers,
  locale: Locale,
): ProgramPreviewDay[] {
  const patch = applyProgramLibraryEntry(entry.id, baseProfile);
  const merged = normalizeProfileForEngine({ ...baseProfile, ...patch });

  return [0, 1, 2].map((dayIndex) => {
    const day = generateWorkoutDay({
      package: normalizeProgramPackageId(merged.selectedPackageId),
      goal: merged.goal,
      level: merged.level,
      dayIndex,
      locale,
      trainingLevel: effectiveTrainingLevel(merged),
      limitations: merged.limitations,
      coachMode: merged.mode ?? "guided",
      programBlueprintId: merged.programBlueprintId,
      sourceProfile: merged,
    });
    return {
      dayIndex,
      weekdayLabel: translate(locale, WD_KEYS[dayIndex]),
      isRest: day.isRestDay || day.exercises.length === 0,
      sessionLine: day.workout,
      exerciseNames: day.exercises.map((e) => e.name),
    };
  });
}
