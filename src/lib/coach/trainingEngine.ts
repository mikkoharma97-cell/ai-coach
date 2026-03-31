/**
 * Treenimoottori V1 — rungon luonne ja rajat (blueprint + preset -tasolla).
 * Liikegeneraatio + valmennussäännöt: `lib/training/generator` + `trainingIntelligence`.
 */
import type { CoachProgramDecision } from "@/lib/coach/programDecisionEngine";
import { getProgramBlueprint } from "@/lib/programBlueprints";
import type { ProgramBlueprintId } from "@/types/coach";
import type { OnboardingAnswers } from "@/types/coach";
import { effectiveTrainingLevel } from "@/lib/profileTraining";
export {
  inferMovementPattern,
  isDeloadWeek,
  rotationBlockIndex,
} from "@/lib/training/trainingIntelligence";

export type TrainingArchetypeId =
  | "beginner_foundation"
  | "intermediate_rhythm"
  | "muscle_growth"
  | "fat_loss_rhythm"
  | "performance_control"
  | "busy_life_reset"
  | "comeback_restart"
  | "home_consistency";

const PRESET_ARCH: Partial<
  Record<CoachProgramDecision["presetId"], TrainingArchetypeId>
> = {
  beginner_foundation: "beginner_foundation",
  fat_loss_rhythm: "fat_loss_rhythm",
  muscle_growth_structure: "muscle_growth",
  performance_block: "performance_control",
  home_consistency: "home_consistency",
  busy_life_reset: "busy_life_reset",
  comeback_restart: "comeback_restart",
  pro_control: "performance_control",
};

/**
 * Kuvaa viikon luonnetta — käytetään copyyn / validointiin.
 */
export function trainingArchetypeFromDecision(
  decision: CoachProgramDecision,
): TrainingArchetypeId {
  return PRESET_ARCH[decision.presetId] ?? "intermediate_rhythm";
}

/**
 * Aloittelija ei saa “pro” -runkoa; koti ei saa laiteriippuvaista split-runkoa (blueprint-taso).
 */
export function isTrainingBlueprintAllowedForProfile(
  profile: OnboardingAnswers,
  blueprintId: ProgramBlueprintId,
): boolean {
  const tl = effectiveTrainingLevel(profile);
  if (tl === "beginner" && blueprintId === "pro_training") {
    return false;
  }
  const venue = profile.trainingVenue ?? "mixed";
  if (
    (venue === "home" || venue === "outdoor") &&
    blueprintId === "pro_training"
  ) {
    return false;
  }
  return true;
}

/**
 * Lyhyt tekninen kuvaus: jakotapa + treenipäivät (valmentajatason ankkuri).
 */
export function describeTrainingFrame(decision: CoachProgramDecision): {
  splitType: string;
  trainingDays: number;
  focus: string;
} {
  const bp = getProgramBlueprint(decision.trainingBlueprint);
  return {
    splitType: bp.splitType,
    trainingDays: bp.trainingDays,
    focus: bp.focus,
  };
}
