/**
 * Yhtenäinen ohjelmapäätös — preset, blueprintit, sävy, luottamus.
 */
import type { MessageKey } from "@/lib/i18n";
import {
  getProgramPresetDefinition,
  type CorrectionStyle,
  type ProgramPresetId,
} from "@/lib/programPresets";
import {
  resolveProgramFromProfile,
  type ResolvedProgramPlan,
} from "@/lib/profileProgramResolver";
import type {
  NutritionBlueprintId,
  ProgramBlueprintId,
} from "@/types/coach";
import { normalizeProfileForEngine } from "@/lib/coach/profileNormalizer";
import type { OnboardingAnswers } from "@/types/coach";

export type CoachProgramContext = {
  referenceDate?: Date;
};

export type ConfidenceLevel = "high" | "medium" | "low";

export type CoachProgramDecision = ResolvedProgramPlan & {
  /** Alias: treenirunko */
  trainingBlueprint: ProgramBlueprintId;
  /** Alias: ruokarunko */
  nutritionBlueprint: NutritionBlueprintId;
  correctionStyle: CorrectionStyle;
  /** Vakaa avain “miksi tämä ohjelma” -tekstille */
  rationaleKey: MessageKey;
  confidenceLevel: ConfidenceLevel;
};

function confidenceFromProfile(p: OnboardingAnswers): ConfidenceLevel {
  const hasWeight =
    (p.currentWeight != null && p.currentWeight >= 40) ||
    (p.targetWeight != null && p.targetWeight >= 40);
  if (!hasWeight) return "medium";
  if (p.recentTrainingFreq === "rare" && p.level === "beginner") {
    return "low";
  }
  if (p.recentTrainingFreq === "rare") return "medium";
  return "high";
}

/**
 * Rakentaa päätöksen normalisoidusta profiilista.
 * Käyttää olemassa olevaa `resolveProgramFromProfile` -polkua (ei rinnakkaista logiikkaa).
 */
export function buildCoachProgramDecision(
  profile: OnboardingAnswers,
  _currentContext?: CoachProgramContext,
): CoachProgramDecision {
  const p = normalizeProfileForEngine(profile);
  const base = resolveProgramFromProfile(p);
  const def = getProgramPresetDefinition(base.presetId);
  return {
    ...base,
    trainingBlueprint: base.programBlueprintId,
    nutritionBlueprint: base.nutritionBlueprintId,
    correctionStyle: def.correctionStyle,
    rationaleKey: base.programRationaleKey,
    confidenceLevel: confidenceFromProfile(p),
  };
}

export function presetIdFromDecision(
  d: CoachProgramDecision,
): ProgramPresetId {
  return d.presetId;
}
