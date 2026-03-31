/**
 * Liikepankki — yksi lähde guided / pro / progression -moottoreille.
 */

export type ExerciseCategory =
  | "push"
  | "pull"
  | "legs"
  | "core"
  | "conditioning";

export type ExerciseDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

export type EquipmentType =
  | "bodyweight"
  | "dumbbell"
  | "barbell"
  | "machine"
  | "cable"
  | "smith";

export type LimitationTag =
  | "shoulder_sensitive"
  | "lower_back_sensitive"
  | "knee_sensitive"
  | "wrist_sensitive"
  | "hip_sensitive";

export type ExerciseAlternative = {
  id: string;
  nameFi: string;
  nameEn: string;
  reasonFi: string;
  reasonEn: string;
  /** Katalogin liike-id, johon vaihtoehto vastaa (moottorin automaattivaihto) */
  targetExerciseId?: string;
};

export type ExerciseDefinition = {
  id: string;
  nameFi: string;
  nameEn: string;
  category: ExerciseCategory;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  difficulty: ExerciseDifficulty;
  equipment: EquipmentType[];
  limitations?: LimitationTag[];
  defaultSets?: number;
  defaultReps?: string;
  alternatives: ExerciseAlternative[];
};

/** Alias — katalogin liike */
export type Exercise = ExerciseDefinition;

export function exerciseDisplayName(
  ex: Exercise,
  locale: "fi" | "en",
): string {
  return locale === "en" ? ex.nameEn : ex.nameFi;
}

/** Generaattorin debug — ei UI:hin */
export type ExerciseSelectionSlotDebug = {
  category: ExerciseCategory;
  poolSizeCategory: number;
  poolSizeAfterLevel: number;
  wouldConflictWithLimitationsCount: number;
  pickedExerciseId: string;
  resolvedExerciseId: string;
  wasSubstituted: boolean;
  substitutionReasonFi?: string;
  substitutionReasonEn?: string;
};

export type ExerciseSelectionDebug = {
  slots: ExerciseSelectionSlotDebug[];
  /** Yhteenveto sloteista — kehitys / testit */
  selectedFromPoolCount?: number;
  filteredByLevelCount?: number;
  filteredByLimitationsCount?: number;
};
