import type { Exercise } from "@/types/exercise";
import { ALL_EXERCISES, getExerciseById } from "@/lib/training/exercises";

export const exerciseBenchPress: Exercise | undefined = getExerciseById("bench_press");

/** @deprecated käytä `ALL_EXERCISES` / `src/lib/training/exercises.ts` */
export const EXERCISE_CATALOG: Exercise[] = ALL_EXERCISES;
