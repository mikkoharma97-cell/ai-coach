/**
 * Adaptive coaching — suoritusdata, tila, moottorin ulostulo.
 */
import type { Goal } from "@/types/coach";

export type FatigueLevel = "low" | "moderate" | "high";

export type ProgressionTrend = "progressing" | "plateau" | "regressing" | "unknown";

/** Yhden setin kirjaus */
export type WorkoutLogSet = {
  setIndex: number;
  weightKg: number | null;
  reps: number | null;
  rpe: number | null;
  completed: boolean;
};

/** Yksi liike yhdessä treenissä */
export type WorkoutLogExercise = {
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutLogSet[];
};

/** Yksi tallennettu treenisessio */
export type WorkoutSessionLog = {
  id: string;
  completedAt: string;
  dayKey: string;
  exercises: WorkoutLogExercise[];
};

/** Liikkeen historia — johdettu lokeista */
export type ExercisePerformanceMemory = {
  exerciseId: string;
  bestWeightKg: number | null;
  bestReps: number | null;
  lastSessions: {
    completedAt: string;
    estimatedVolume: number;
    avgRpe: number | null;
  }[];
  trend: ProgressionTrend;
};

export type UserPerformanceState = {
  lastWorkouts: WorkoutSessionLog[];
  progressionTrend: ProgressionTrend;
  fatigueLevel: FatigueLevel;
  /** 0–100, kirjattujen treenien säännöllisyys */
  consistencyScore: number;
  exerciseMemory: Record<string, ExercisePerformanceMemory>;
};

export type CoachingInsightKind =
  | "progression"
  | "fatigue"
  | "nutrition"
  | "supplement"
  | "adjustment"
  | "swap"
  | "product";

export type CoachingInsight = {
  id: string;
  kind: CoachingInsightKind;
  severity: "positive" | "info" | "warning";
  titleFi: string;
  titleEn: string;
  bodyFi: string;
  bodyEn: string;
};

/** Tuotesuosituksen kehys — valmentajan sävy, ei mainos */
export type SupplementRecommendationFrame =
  | "recommended_for_you"
  | "coach_suggestion"
  | "based_on_progress";

export type SupplementProductRecommendation = {
  id: string;
  productId: string;
  frame: SupplementRecommendationFrame;
  priority: number;
  reasonFi: string;
  reasonEn: string;
};

export type CoachingEngineResult = {
  insights: CoachingInsight[];
  warnings: CoachingInsight[];
  recommendations: CoachingInsight[];
  /** Legacy / muut ei-katalogi rivit */
  productSuggestions: CoachingInsight[];
  supplementProducts: SupplementProductRecommendation[];
  performance: UserPerformanceState;
};
