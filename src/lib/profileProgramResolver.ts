/**
 * Profiili → ohjelmapreset → tarkat blueprintit, raita ja valmennuksen sävy.
 */
import type { MessageKey } from "@/lib/i18n";
import {
  correctionStyleMessageKey,
  getProgramPresetDefinition,
  presetNameKey,
  refinePresetBlueprints,
  resolveProgramPresetId,
  type ProgramPresetId,
} from "@/lib/programPresets";
import type {
  CoachingToneBias,
  ProgramComplexity,
  RecoverySensitivity,
  ScheduleBias,
  WeeklyStructureType,
} from "@/lib/programPlanTypes";
import type {
  LifeSchedule,
  NutritionBlueprintId,
  OnboardingAnswers,
  ProgramBlueprintId,
  ProgramTrackId,
} from "@/types/coach";

export type {
  CoachingToneBias,
  ProgramComplexity,
  RecoverySensitivity,
  ScheduleBias,
  WeeklyStructureType,
} from "@/lib/programPlanTypes";

export type ResolvedProgramPlan = {
  programBlueprintId: ProgramBlueprintId;
  nutritionBlueprintId: NutritionBlueprintId;
  programTrackId: ProgramTrackId;
  weeklyStructureType: WeeklyStructureType;
  coachingToneBias: CoachingToneBias;
  recoverySensitivity: RecoverySensitivity;
  programComplexity: ProgramComplexity;
  environmentBias: "home" | "gym" | "outdoor" | "mixed";
  scheduleBias: ScheduleBias;
  flexibilityMode: "structured" | "balanced" | "flex";
  programRationaleKey: MessageKey;
  presetId: ProgramPresetId;
  presetNameKey: MessageKey;
  presetFrameLabelKey: MessageKey;
  correctionStyleKey: MessageKey;
  recoverySensitivityLabelKey: MessageKey;
};

function normalizeLifeSchedule(
  raw: LifeSchedule | undefined,
): LifeSchedule {
  if (
    raw === "shift_work" ||
    raw === "busy_day" ||
    raw === "late_schedule" ||
    raw === "student"
  ) {
    return raw;
  }
  return "regular";
}

function inferLifeSchedule(a: OnboardingAnswers): LifeSchedule {
  if (a.lifeSchedule) return normalizeLifeSchedule(a.lifeSchedule);
  if (a.biggestChallenge === "lack_of_time") return "busy_day";
  if (a.eatingHabits === "irregular") return "shift_work";
  return "regular";
}

function scheduleBiasFromLife(raw: LifeSchedule): ScheduleBias {
  if (raw === "shift_work") return "shift";
  if (
    raw === "busy_day" ||
    raw === "late_schedule" ||
    raw === "student"
  ) {
    return "busy";
  }
  return "regular";
}

/**
 * Kun käyttäjä ei ole lukinnut blueprinteja käsin, rakennetaan ohjelma profiilista presetin kautta.
 */
export function resolveProgramFromProfile(
  profile: OnboardingAnswers,
): ResolvedProgramPlan {
  const venue = profile.trainingVenue ?? "mixed";
  const flex = profile.flexibility;
  const scheduleRaw = inferLifeSchedule(profile);

  let scheduleBias: ScheduleBias = "regular";
  if (scheduleRaw === "shift_work") scheduleBias = "shift";
  else if (
    scheduleRaw === "busy_day" ||
    scheduleRaw === "student" ||
    scheduleRaw === "late_schedule"
  ) {
    scheduleBias = "busy";
  }

  const flexibilityMode =
    flex === "structured"
      ? "structured"
      : flex === "flexible"
        ? "flex"
        : "balanced";

  const presetId = resolveProgramPresetId(profile);
  const def = getProgramPresetDefinition(presetId);
  const refined = refinePresetBlueprints(presetId, profile);

  const recoverySensitivityLabelKey =
    `program.preset.recoverySensitivity.${refined.recoverySensitivity}` as MessageKey;

  return {
    programBlueprintId: refined.programBlueprintId,
    nutritionBlueprintId: refined.nutritionBlueprintId,
    programTrackId: refined.programTrackId,
    weeklyStructureType: refined.weeklyStructureType,
    coachingToneBias: refined.coachingToneBias,
    recoverySensitivity: refined.recoverySensitivity,
    programComplexity: refined.programComplexity,
    environmentBias: venue,
    scheduleBias,
    flexibilityMode,
    programRationaleKey: refined.programRationaleKey,
    presetId,
    presetNameKey: presetNameKey(presetId),
    presetFrameLabelKey: "program.presetFrameLabel",
    correctionStyleKey: correctionStyleMessageKey(def.correctionStyle),
    recoverySensitivityLabelKey,
  };
}

export function resolveProgramBlueprintFromProfile(
  profile: OnboardingAnswers,
): ProgramBlueprintId {
  return resolveProgramFromProfile(profile).programBlueprintId;
}

export function resolveNutritionBlueprintFromProfile(
  profile: OnboardingAnswers,
): NutritionBlueprintId {
  return resolveProgramFromProfile(profile).nutritionBlueprintId;
}

export function resolveProgramTrackFromProfile(
  profile: OnboardingAnswers,
): ProgramTrackId {
  return resolveProgramFromProfile(profile).programTrackId;
}
