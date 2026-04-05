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
  buildNutritionProgressionResult,
  type NutritionProgressionResult,
} from "@/lib/coach/nutritionProgressionEngine";
export {
  buildActivityProgressionResult,
  type ActivityProgressionResult,
} from "@/lib/coach/activityProgressionEngine";
export {
  buildTrainingProgressionResult,
  type TrainingProgressionResult,
} from "@/lib/coach/trainingProgressionEngine";
export {
  buildFullProgressionEngineResult,
  trainingResultToTriState,
  type FullProgressionEngineResult,
  type FullProgressionSignalDigest,
  type ProgressionTriState,
} from "@/lib/coach/fullProgressionEngine";
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
export {
  buildCoachMessages,
  coachMessageAt,
  getCoachMessage,
  type CoachContext,
  type CoachMessageBuildInput,
  type CoachMessageContext,
  type CoachMessageResult,
  type CoachMessages,
  type CoachMessageSlot,
} from "@/lib/coach/coachMessage";
export {
  buildCoachAiEngineResult,
  type CoachAiEngineResult,
  type CoachAiInputsEcho,
  type CoachNextAdjustment,
} from "@/lib/coach/aiDecisionEngine";
export {
  buildTodayWorkoutForUi,
  resolveProWorkoutStructureEligible,
  resolveTodayPrimaryAnchor,
  resolveTodayQuickDoneHref,
  resolveTodayStartWorkoutHref,
  resolveTodaySuppressWorkout,
  resolveWeeklyPlanHasTrainingToday,
  type TodayPrimaryAnchor,
} from "@/lib/coach/todayDashboardEngine";
export { buildCoachDailyPlanForSession } from "@/lib/dailyEngine";
export {
  buildCoachingEngineResult,
  exercisePerformanceHints,
  type ExercisePerformanceHint,
} from "@/lib/coach/coaching-engine";
export {
  buildSupplementProductRecommendations,
  buildSupplementRecommendationInput,
} from "@/lib/supplements/recommendationEngine";
