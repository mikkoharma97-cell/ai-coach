import type { CoachDailyPlan, WeekDayEntry } from "@/types/coach";
import type { MessageKey } from "@/lib/i18n";

/**
 * One decisive line under the week map — rule-based, no AI.
 */
export function planMapSteerKey(
  plan: CoachDailyPlan,
  byIndex: { entry: WeekDayEntry; i: number }[],
): MessageKey {
  if (plan.systemLine?.trim()) {
    return "plan.mapSteerHold";
  }
  const trainIdx = byIndex.filter((x) => !x.entry.isRest).map((x) => x.i);
  const late = trainIdx.filter((i) => i >= 4).length;
  const early = trainIdx.filter((i) => i <= 2).length;
  if (late >= 2 && late >= early) {
    return "plan.mapSteerLateWeek";
  }
  const lighterN = byIndex.filter((x) => x.entry.isRest).length;
  if (lighterN >= 3) {
    return "plan.mapSteerRecovery";
  }
  return "plan.mapSteerSynced";
}
