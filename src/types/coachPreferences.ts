export type CoachFeatureToggles = {
  showCoachLines: boolean;
  showHardlineTone: boolean;
  showHelpVideos: boolean;
  showProgressCharts: boolean;
  showStreaks: boolean;
  showRealityScore: boolean;
  showExceptionGuidance: boolean;
  showNutritionCorrections: boolean;
  showVoiceWorkout: boolean;
  showWeeklyCoachReview: boolean;
  showDailyActivityInput: boolean;
};

export const DEFAULT_COACH_FEATURE_TOGGLES: CoachFeatureToggles = {
  showCoachLines: true,
  showHardlineTone: false,
  showHelpVideos: true,
  showProgressCharts: true,
  showStreaks: true,
  showRealityScore: true,
  showExceptionGuidance: true,
  showNutritionCorrections: true,
  showVoiceWorkout: true,
  showWeeklyCoachReview: true,
  showDailyActivityInput: true,
};
