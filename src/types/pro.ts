/**
 * Pro mode — oma runko + järjestelmän kehitys (guided-logiikka säilyy erillisenä).
 */

import type { ExerciseSelectionDebug } from "@/types/exercise";

export type ProProgressionMode = "linear" | "double_progression" | "adaptive";

export type ProSplitPreset =
  | "push_pull_legs"
  | "upper_lower"
  | "full_body"
  | "custom";

export type ProTrainingProgram = {
  splitName: string;
  splitPreset: ProSplitPreset;
  trainingDaysPerWeek: 3 | 4 | 5 | 6;
  days: ProTrainingDay[];
  progressionMode: ProProgressionMode;
};

export type ProTrainingDay = {
  id: string;
  name: string;
  focus: string;
  exercises: ProExercise[];
  /** Valinnainen moottorin debug (kehitys / testit) */
  engineDebug?: ExerciseSelectionDebug;
};

export type ProExercise = {
  id: string;
  name: string;
  target: string;
  sets: number;
  reps: string;
  effort?: string;
  rest?: string;
  alternatives: ProExerciseAlternative[];
  /** Pro mode — rakennetta voi muokata myöhemmin */
  editable?: boolean;
  /** Automaattivaihto rajoitteen vuoksi */
  substitutionReasonFi?: string;
  substitutionReasonEn?: string;
  /** Valinnainen demo / tekniikkavideo — täytetään kun kirjasto kytketään */
  videoUrl?: string;
  videoPoster?: string;
  coachTipFi?: string;
  coachTipEn?: string;
  coachMistakeFi?: string;
  coachMistakeEn?: string;
  coachFocusFi?: string;
  coachFocusEn?: string;
  /** HÄRMÄ4 — valmennussäännöt (drop, deload, RPE) */
  prescriptionLineFi?: string;
  prescriptionLineEn?: string;
};

export type ProExerciseAlternative = {
  id: string;
  name: string;
  reasonFi: string;
  reasonEn: string;
};

export type ProMealAdjustmentMode = "manual" | "guided" | "adaptive";

export type ProMealSlotTarget =
  | "balanced"
  | "protein"
  | "light"
  | "performance";

export type ProMealSlot = {
  id: string;
  label: string;
  timing?: string;
  targetStyle: ProMealSlotTarget;
};

export type ProMealPlan = {
  mealCount: number;
  structure: ProMealSlot[];
  workoutNutrition: boolean;
  adjustmentMode: ProMealAdjustmentMode;
};

/** Jokaiselle liikkeelle — progressiivinen tila */
export type ExerciseProgressionState = {
  exerciseId: string;
  currentLoad?: number;
  loadUnit?: "kg" | "lb";
  targetRepRange: { min: number; max: number };
  lastSession?: {
    dateKey: string;
    reps: number;
    load?: number;
    rpe?: number;
  };
  progressSuggestion?: string;
};

export type ProAiSuggestionKind =
  | "add_exercise"
  | "volume"
  | "rep_range"
  | "deload"
  | "nutrition"
  | "recovery";

export type ProAiSuggestion = {
  id: string;
  kind: ProAiSuggestionKind;
  titleFi: string;
  titleEn: string;
  detailFi: string;
  detailEn: string;
  /** Viittaus päivään / liikkeeseen jos relevantti */
  exerciseId?: string;
  dayId?: string;
};

export type ProWorkspace = {
  trainingProgram: ProTrainingProgram | null;
  mealPlan: ProMealPlan | null;
  exerciseProgress: Record<string, ExerciseProgressionState>;
  /** Ehdotukset joita käyttäjä ei ole vielä hyväksynyt */
  pendingAiSuggestions: ProAiSuggestion[];
  /** Hyväksyttyjen id:t (viimeiset säilytetään) */
  appliedSuggestionIds: string[];
};
