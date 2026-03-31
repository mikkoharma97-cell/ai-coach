import type { ConsistencySignal } from "@/lib/review/weeklyCoachAnalysis";
import type { MessageKey } from "@/lib/i18n";

/** Yksi rivi: miten ensi viikko jatkaa tästä. */
export function computeNextWeekMomentumKey(input: {
  streakDays: number;
  consistency: ConsistencySignal;
  trainingScheduled: number;
  trainingHit: number;
}): MessageKey {
  const rate =
    input.trainingScheduled > 0
      ? input.trainingHit / input.trainingScheduled
      : 0;

  if (
    input.streakDays >= 4 &&
    input.consistency === "high" &&
    rate >= 0.65
  ) {
    return "review.nextWeekMomentum.carry";
  }
  if (input.consistency === "low" || (input.trainingScheduled >= 3 && rate < 0.4)) {
    return "review.nextWeekMomentum.anchor";
  }
  return "review.nextWeekMomentum.lift";
}
