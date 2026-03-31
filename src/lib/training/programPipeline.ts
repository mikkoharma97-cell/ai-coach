/**
 * Yhtenäinen pipeline — kaikki ohjelmat:
 * profiili → `resolveProgramBlueprint` → kategoriat → `pickExercisesUnique`
 * → `exerciseToProExercise` → `trainingIntelligence.buildExercisePrescription`.
 *
 * Toteutus: `lib/training/generator.ts`.
 */
export {
  generateWorkoutDay,
  generateTrainingProgram,
} from "@/lib/training/generator";
