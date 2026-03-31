import type { CoachDailyPlan } from "@/types/coach";
import type { MessageKey } from "@/lib/i18n";

/**
 * Rotating live line — signal-first, else deterministic by calendar day (no RNG).
 */
export function todayLiveStatusKey(
  plan: CoachDailyPlan,
  dayKey: string,
): MessageKey {
  if (plan.systemLine?.trim()) {
    return "systemStatus.todaySyncedRecent";
  }
  if (plan.foodAdjustmentNote?.trim()) {
    return "systemStatus.todayRhythmTuned";
  }
  const n = dayKey.split("-").reduce((acc, x) => acc + Number(x), 0);
  if (n % 3 === 0) return "systemStatus.todayProfile";
  if (n % 3 === 1) return "systemStatus.todaySyncedRecent";
  return "systemStatus.todayRhythmTuned";
}
