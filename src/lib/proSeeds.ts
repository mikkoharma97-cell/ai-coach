/**
 * Pro-oletusdata — treeni generoidaan `training/generator`, ei staattisia päivälistoja.
 */
import type { Locale } from "@/lib/i18n";
import { generateTrainingProgram } from "@/lib/training/generator";
import type {
  Goal,
  Level,
  ProgramTrackId,
} from "@/types/coach";
import type { LimitationTag } from "@/types/exercise";
import type { ProMealPlan, ProMealSlot, ProSplitPreset, ProTrainingProgram } from "@/types/pro";

export type SeedTrainingProgramOptions = {
  locale?: Locale;
  goal?: Goal;
  trainingLevel?: Level;
  limitations?: LimitationTag[];
  programTrackId?: ProgramTrackId;
  week?: number;
  salt?: string;
};

/** Pro-treeniohjelma — profiilin taso, rajoitteet, kieli ja rata kytketty generaattoriin. */
export function seedTrainingProgram(
  preset: ProSplitPreset,
  opts?: SeedTrainingProgramOptions,
): ProTrainingProgram {
  return generateTrainingProgram({
    preset,
    week: opts?.week ?? 1,
    goal: opts?.goal ?? "build_muscle",
    salt: opts?.salt,
    locale: opts?.locale ?? "fi",
    trainingLevel: opts?.trainingLevel ?? "intermediate",
    limitations: opts?.limitations,
    programTrackId: opts?.programTrackId,
  });
}

export function seedMealPlan(): ProMealPlan {
  const structure: ProMealSlot[] = [
    {
      id: "m1",
      label: "Aamu",
      timing: "07:00–09:00",
      targetStyle: "balanced",
    },
    {
      id: "m2",
      label: "Päivä",
      timing: "11:30–13:30",
      targetStyle: "performance",
    },
    {
      id: "m3",
      label: "Ennen treeniä",
      timing: "optional",
      targetStyle: "light",
    },
    {
      id: "m4",
      label: "Treenin jälkeen",
      timing: "optional",
      targetStyle: "protein",
    },
    {
      id: "m5",
      label: "Ilta",
      timing: "18:00–20:00",
      targetStyle: "protein",
    },
  ];

  return {
    mealCount: 5,
    structure,
    workoutNutrition: true,
    adjustmentMode: "adaptive",
  };
}
