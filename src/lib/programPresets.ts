/**
 * Ohjelmapresetit V1 — profiili mapataan yhteen selkeään runkoon (ei geneerinen “yksi kaikille”).
 */
import type { MessageKey } from "@/lib/i18n";
import { normalizeProgramPackageId } from "@/lib/programPackages";
import type {
  LifeSchedule,
  NutritionBlueprintId,
  OnboardingAnswers,
  ProgramBlueprintId,
  ProgramPackageId,
  ProgramTrackId,
} from "@/types/coach";
import type {
  CoachingToneBias,
  ProgramComplexity,
  RecoverySensitivity,
  ScheduleBias,
  WeeklyStructureType,
} from "@/lib/programPlanTypes";

export type ProgramPresetId =
  | "beginner_foundation"
  | "fat_loss_rhythm"
  | "muscle_growth_structure"
  | "performance_block"
  | "home_consistency"
  | "busy_life_reset"
  | "pro_control"
  | "comeback_restart";

export type CorrectionStyle = "gentle" | "balanced" | "firm";

export type ProgramPresetDefinition = {
  id: ProgramPresetId;
  /** Oletusrunko ennen profiilin hienosäätöä */
  programBlueprintId: ProgramBlueprintId;
  nutritionBlueprintId: NutritionBlueprintId;
  programTrackId: ProgramTrackId;
  weeklyStructureType: WeeklyStructureType;
  coachingToneBias: CoachingToneBias;
  recoverySensitivity: RecoverySensitivity;
  programComplexity: ProgramComplexity;
  correctionStyle: CorrectionStyle;
  /** Lyhyt rationale-avain Today / Review */
  rationaleKey: MessageKey;
};

const PRESETS: Record<ProgramPresetId, ProgramPresetDefinition> = {
  pro_control: {
    id: "pro_control",
    programBlueprintId: "pro_training",
    nutritionBlueprintId: "pro_nutrition",
    programTrackId: "performance",
    weeklyStructureType: "performance",
    coachingToneBias: "performance",
    recoverySensitivity: "low",
    programComplexity: "advanced",
    correctionStyle: "firm",
    rationaleKey: "program.preset.pro_control.rationale",
  },
  busy_life_reset: {
    id: "busy_life_reset",
    /** Refine: vuoro → shift_flex; kiire + vähän päiviä → tämä ankkuri */
    programBlueprintId: "steady_begin",
    nutritionBlueprintId: "easy_daily",
    programTrackId: "daily_rhythm",
    weeklyStructureType: "foundation",
    coachingToneBias: "supportive",
    recoverySensitivity: "high",
    programComplexity: "foundation",
    correctionStyle: "gentle",
    rationaleKey: "program.preset.busy_life_reset.rationale",
  },
  comeback_restart: {
    id: "comeback_restart",
    programBlueprintId: "steady_begin",
    nutritionBlueprintId: "easy_daily",
    programTrackId: "returning",
    weeklyStructureType: "foundation",
    coachingToneBias: "supportive",
    recoverySensitivity: "high",
    programComplexity: "foundation",
    correctionStyle: "gentle",
    rationaleKey: "program.preset.comeback_restart.rationale",
  },
  home_consistency: {
    id: "home_consistency",
    programBlueprintId: "steady_begin",
    nutritionBlueprintId: "steady_meals",
    programTrackId: "daily_rhythm",
    weeklyStructureType: "foundation",
    coachingToneBias: "supportive",
    recoverySensitivity: "high",
    programComplexity: "foundation",
    correctionStyle: "gentle",
    rationaleKey: "program.preset.home_consistency.rationale",
  },
  fat_loss_rhythm: {
    id: "fat_loss_rhythm",
    programBlueprintId: "fat_loss_light",
    nutritionBlueprintId: "light_cut_meal",
    programTrackId: "light_fat_loss",
    weeklyStructureType: "rhythm",
    coachingToneBias: "supportive",
    recoverySensitivity: "medium",
    programComplexity: "intermediate",
    correctionStyle: "balanced",
    rationaleKey: "program.preset.fat_loss_rhythm.rationale",
  },
  muscle_growth_structure: {
    id: "muscle_growth_structure",
    programBlueprintId: "hypertrophy_4",
    nutritionBlueprintId: "muscle_fuel",
    programTrackId: "muscle_growth",
    weeklyStructureType: "upper_lower",
    coachingToneBias: "direct",
    recoverySensitivity: "medium",
    programComplexity: "intermediate",
    correctionStyle: "balanced",
    rationaleKey: "program.preset.muscle_growth_structure.rationale",
  },
  performance_block: {
    id: "performance_block",
    programBlueprintId: "tight_block",
    nutritionBlueprintId: "train_vs_rest",
    programTrackId: "performance",
    weeklyStructureType: "performance",
    coachingToneBias: "performance",
    recoverySensitivity: "low",
    programComplexity: "advanced",
    correctionStyle: "firm",
    rationaleKey: "program.preset.performance_block.rationale",
  },
  beginner_foundation: {
    id: "beginner_foundation",
    programBlueprintId: "steady_begin",
    nutritionBlueprintId: "easy_daily",
    programTrackId: "daily_rhythm",
    weeklyStructureType: "foundation",
    coachingToneBias: "supportive",
    recoverySensitivity: "high",
    programComplexity: "foundation",
    correctionStyle: "gentle",
    rationaleKey: "program.preset.beginner_foundation.rationale",
  },
};

function normalizeLifeSchedule(raw: LifeSchedule | undefined): LifeSchedule {
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

function isComebackSignal(a: OnboardingAnswers): boolean {
  if (a.lastBestShape === "long_ago" || a.lastBestShape === "not_sure") {
    return true;
  }
  if (a.recentTrainingFreq === "rare") return true;
  return false;
}

/**
 * Valitsee presetin — järjestys: pro → (vuoro | kiire+vähän pv) → tavoite → paluu → koti → rakenne.
 */
export function resolveProgramPresetId(
  profile: OnboardingAnswers,
): ProgramPresetId {
  if (
    profile.forcedPresetId &&
    profile.forcedPresetId in PRESETS
  ) {
    return profile.forcedPresetId as ProgramPresetId;
  }
  if (profile.mode === "pro") return "pro_control";

  const scheduleRaw = inferLifeSchedule(profile);
  const scheduleB = scheduleBiasFromLife(scheduleRaw);

  if (scheduleB === "shift") {
    return "busy_life_reset";
  }
  /** Vastaa vanhaa: kiireinen arki + max 3 pv → ankkurirunko; muuten tavoitteet näkyvät */
  if (scheduleB === "busy" && profile.daysPerWeek <= 3) {
    return "busy_life_reset";
  }

  if (profile.goal === "lose_weight") {
    return "fat_loss_rhythm";
  }

  if (
    isComebackSignal(profile) &&
    profile.level !== "advanced"
  ) {
    return "comeback_restart";
  }

  const venue = profile.trainingVenue ?? "mixed";
  if (
    profile.level === "beginner" &&
    (venue === "home" || venue === "mixed") &&
    (profile.goal === "build_muscle" || profile.goal === "improve_fitness")
  ) {
    return "home_consistency";
  }

  if (profile.goal === "build_muscle") {
    return "muscle_growth_structure";
  }

  const pkg: ProgramPackageId = normalizeProgramPackageId(
    profile.selectedPackageId,
  );
  if (
    pkg === "performance_block" &&
    profile.goal === "improve_fitness" &&
    profile.level !== "beginner"
  ) {
    return "performance_block";
  }
  if (profile.level === "advanced" && profile.goal === "improve_fitness") {
    return "performance_block";
  }

  if (profile.level === "beginner") {
    return "beginner_foundation";
  }

  if (profile.goal === "improve_fitness") {
    return "muscle_growth_structure";
  }

  return "muscle_growth_structure";
}

export function getProgramPresetDefinition(
  id: ProgramPresetId,
): ProgramPresetDefinition {
  return PRESETS[id];
}

export type RefinedPresetBlueprints = {
  programBlueprintId: ProgramBlueprintId;
  nutritionBlueprintId: NutritionBlueprintId;
  programTrackId: ProgramTrackId;
  weeklyStructureType: WeeklyStructureType;
  coachingToneBias: CoachingToneBias;
  recoverySensitivity: RecoverySensitivity;
  programComplexity: ProgramComplexity;
  programRationaleKey: MessageKey;
};

/**
 * Säätää presetin tarkat blueprintit profiilin mukaan (aloittelija vs kokenut, koti vs sali, jne.).
 */
export function refinePresetBlueprints(
  presetId: ProgramPresetId,
  profile: OnboardingAnswers,
): RefinedPresetBlueprints {
  const base = { ...PRESETS[presetId] };
  const goal = profile.goal;
  const level = profile.level;
  const days = profile.daysPerWeek;
  const venue = profile.trainingVenue ?? "mixed";
  const social = profile.socialEatingFrequency;
  let programBlueprintId = base.programBlueprintId;
  let nutritionBlueprintId = base.nutritionBlueprintId;
  let programTrackId = base.programTrackId;
  let weeklyStructureType = base.weeklyStructureType;
  let coachingToneBias = base.coachingToneBias;
  let recoverySensitivity = base.recoverySensitivity;
  let programComplexity = base.programComplexity;

  if (presetId === "busy_life_reset") {
    const sched = scheduleBiasFromLife(inferLifeSchedule(profile));
    if (sched === "shift") {
      programBlueprintId = "shift_flex";
      nutritionBlueprintId = "shift_clock";
      weeklyStructureType = "shift";
      programComplexity = "intermediate";
      recoverySensitivity = "medium";
    } else if (sched === "busy" && profile.daysPerWeek <= 3) {
      programBlueprintId = "steady_begin";
      nutritionBlueprintId =
        social === "often" ? "event_balance" : "easy_daily";
      programTrackId = "daily_rhythm";
      weeklyStructureType = "foundation";
      recoverySensitivity = "high";
      programComplexity = "foundation";
    }
  }

  if (presetId === "fat_loss_rhythm") {
    if (level === "beginner") {
      programBlueprintId = "steady_begin";
      weeklyStructureType = "foundation";
    }
    if (social === "often") {
      nutritionBlueprintId = "event_balance";
    }
  }

  if (presetId === "muscle_growth_structure") {
    if (level === "beginner" && (venue === "home" || venue === "mixed")) {
      programBlueprintId = "steady_begin";
      nutritionBlueprintId = "steady_meals";
      weeklyStructureType = "foundation";
    } else if (days >= 5 && level === "advanced" && venue !== "home") {
      programBlueprintId = "hypertrophy_5";
      weeklyStructureType = "split";
    } else if (days >= 4) {
      programBlueprintId = "hypertrophy_4";
      weeklyStructureType = "upper_lower";
    } else {
      programBlueprintId = "base_strength";
      weeklyStructureType = "rhythm";
    }
    if (venue === "home" && programBlueprintId === "hypertrophy_5") {
      programBlueprintId = "hypertrophy_4";
      weeklyStructureType = "upper_lower";
    }
  }

  if (presetId === "performance_block" && level === "intermediate") {
    programBlueprintId = "base_strength";
    nutritionBlueprintId = "steady_meals";
    weeklyStructureType = "upper_lower";
    recoverySensitivity = "medium";
  }

  if (presetId === "beginner_foundation") {
    programComplexity = "foundation";
    recoverySensitivity = "high";
  }

  if (social === "often" && nutritionBlueprintId !== "event_balance") {
    nutritionBlueprintId = "event_balance";
  }

  if (profile.selectedNutritionLibraryId && profile.nutritionBlueprintId) {
    nutritionBlueprintId = profile.nutritionBlueprintId;
  }

  return {
    programBlueprintId,
    nutritionBlueprintId,
    programTrackId,
    weeklyStructureType,
    coachingToneBias,
    recoverySensitivity,
    programComplexity,
    programRationaleKey: base.rationaleKey,
  };
}

export function correctionStyleMessageKey(
  style: CorrectionStyle,
): MessageKey {
  const m: Record<CorrectionStyle, MessageKey> = {
    gentle: "program.preset.correction.gentle",
    balanced: "program.preset.correction.balanced",
    firm: "program.preset.correction.firm",
  };
  return m[style];
}

export function presetNameKey(id: ProgramPresetId): MessageKey {
  return `program.preset.${id}.name` as MessageKey;
}
