/**
 * Coach — päätösmoottori (V2 oletus).
 */
export {
  analyzeDailyCoachSignals,
  getDailyCoachDecision,
  trimCoachCopy,
  type CoachSignalPriority,
  type DailyCoachDecision,
  type DailyCoachDecisionInput,
} from "@/lib/coach/decisionEngine";
export {
  getDailyCoachDecisionV2,
  type CoachDecisionV2,
  type CoachDecisionSignals,
} from "@/lib/coach/decisionEngineV2";

/** Oletus: tuotantopolku käyttää V2:ta. */
export const COACH_ENGINE_VERSION = "v2" as const;

export {
  EXCEPTION_GROUP_ORDER,
  EXCEPTION_IDS_BY_GROUP,
  mergeExceptionIntoDailyPlan,
  resolveExceptionGuidance,
  shouldSuppressWorkoutLink,
} from "@/lib/coach/exceptionEngine";

export { normalizeProfileForEngine } from "@/lib/coach/profileNormalizer";
export {
  buildCoachProgramDecision,
  type CoachProgramDecision,
} from "@/lib/coach/programDecisionEngine";
export {
  trainingArchetypeFromDecision,
  isTrainingBlueprintAllowedForProfile,
  describeTrainingFrame,
} from "@/lib/coach/trainingEngine";
export { buildNutritionEngineSnapshot } from "@/lib/coach/nutritionEngine";
export {
  buildWeeklyAdaptation,
  weeklySignalsFromReviewMetrics,
  type WeeklyAdaptation,
  type WeeklyRecentSignals,
} from "@/lib/coach/weekAdaptationEngine";
export { buildCoachExplanation } from "@/lib/coach/explanationEngine";
export {
  buildTodayCoachLine,
  buildFoodCoachLine,
  buildWorkoutCoachLine,
  buildReviewCoachLine,
} from "@/lib/coach/feedbackEngine";
export { buildCoachEngineBundle } from "@/lib/coach/coachEngineBundle";
