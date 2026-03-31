import type { Level, OnboardingAnswers, TrainingLevel } from "@/types/coach";

/** Käytä moottorissa — `trainingLevel` peilaa valintaa, vanhat profiilit käyttävät `level`. */
export function effectiveTrainingLevel(a: OnboardingAnswers): Level {
  return (a.trainingLevel ?? a.level) as Level;
}

export function withSyncedTrainingLevel(
  patch: Partial<OnboardingAnswers>,
): Partial<OnboardingAnswers> {
  if (patch.level != null && patch.trainingLevel == null) {
    return { ...patch, trainingLevel: patch.level as TrainingLevel };
  }
  if (patch.trainingLevel != null && patch.level == null) {
    return { ...patch, level: patch.trainingLevel };
  }
  return patch;
}
