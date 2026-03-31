/**
 * Yhtenäinen pipeline — kaikki ohjelmat:
 * profiili → `resolveProgramBlueprint` → kategoriat → `pickExercisesUnique`
 * → `exerciseToProExercise` → `trainingPrescriptionEngine` (luokitus + intensifierit).
 *
 * Toteutus: `lib/training/generator.ts` + `lib/coach/trainingPrescriptionEngine.ts`.
 */
export {
  generateWorkoutDay,
  generateTrainingProgram,
} from "@/lib/training/generator";
