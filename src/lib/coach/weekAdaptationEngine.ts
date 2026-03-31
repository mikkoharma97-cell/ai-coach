/**
 * Viikkotason adaptaatio — signaalit → yksi ensisijainen linja + copy-avaimet.
 */
import type { MessageKey } from "@/lib/i18n";
import { normalizeProfileForEngine } from "@/lib/coach/profileNormalizer";
import type { OnboardingAnswers } from "@/types/coach";

export type WeeklyRecentSignals = {
  missedWorkout?: boolean;
  overeatingRebalance?: boolean;
  lowActivity?: boolean;
  exceptionMode?: boolean;
  poorRecovery?: boolean;
  highConsistency?: boolean;
  skippedLogs?: boolean;
  socialDisruption?: boolean;
};

export type WeeklyAdaptationPrimary =
  | "keep_course"
  | "reduce_load"
  | "simplify_food"
  | "add_correction"
  | "protect_recovery"
  | "tighten_rhythm"
  | "resume_gently";

export type WeeklyAdaptation = {
  primary: WeeklyAdaptationPrimary;
  headlineKey: MessageKey;
  detailKey: MessageKey;
};

const TABLE: Record<
  WeeklyAdaptationPrimary,
  { headlineKey: MessageKey; detailKey: MessageKey }
> = {
  keep_course: {
    headlineKey: "engine.week.keep.headline",
    detailKey: "engine.week.keep.detail",
  },
  reduce_load: {
    headlineKey: "engine.week.reduce.headline",
    detailKey: "engine.week.reduce.detail",
  },
  simplify_food: {
    headlineKey: "engine.week.simplifyFood.headline",
    detailKey: "engine.week.simplifyFood.detail",
  },
  add_correction: {
    headlineKey: "engine.week.correction.headline",
    detailKey: "engine.week.correction.detail",
  },
  protect_recovery: {
    headlineKey: "engine.week.recover.headline",
    detailKey: "engine.week.recover.detail",
  },
  tighten_rhythm: {
    headlineKey: "engine.week.tighten.headline",
    detailKey: "engine.week.tighten.detail",
  },
  resume_gently: {
    headlineKey: "engine.week.resume.headline",
    detailKey: "engine.week.resume.detail",
  },
};

export function buildWeeklyAdaptation(
  profile: OnboardingAnswers,
  signals: WeeklyRecentSignals,
): WeeklyAdaptation {
  normalizeProfileForEngine(profile);
  let primary: WeeklyAdaptationPrimary = "keep_course";

  if (signals.exceptionMode) {
    primary = "protect_recovery";
  } else if (signals.overeatingRebalance) {
    primary = "add_correction";
  } else if (signals.missedWorkout && signals.highConsistency) {
    primary = "tighten_rhythm";
  } else if (signals.missedWorkout) {
    primary = "resume_gently";
  } else if (signals.lowActivity && signals.poorRecovery) {
    primary = "reduce_load";
  } else if (signals.lowActivity) {
    primary = "reduce_load";
  } else if (signals.socialDisruption) {
    primary = "simplify_food";
  } else if (signals.skippedLogs) {
    primary = "tighten_rhythm";
  } else if (signals.highConsistency) {
    primary = "keep_course";
  }

  const row = TABLE[primary];
  return {
    primary,
    headlineKey: row.headlineKey,
    detailKey: row.detailKey,
  };
}

/** Viikkoraportin metriikoista — sama logiikka kuin päivänipussa, eri signaalit. */
export function weeklySignalsFromReviewMetrics(input: {
  trainingMissed: number;
  calorieDriftDays: number;
  exceptions: boolean;
  consistency: "high" | "mid" | "low";
}): WeeklyRecentSignals {
  return {
    missedWorkout: input.trainingMissed >= 1,
    overeatingRebalance: input.calorieDriftDays >= 2,
    exceptionMode: input.exceptions,
    highConsistency: input.consistency === "high",
    socialDisruption:
      input.calorieDriftDays >= 2 && input.consistency !== "high",
    lowActivity: input.trainingMissed >= 2,
  };
}
