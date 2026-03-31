import type { DailyActivity } from "@/types/activity";

/** Soft cap so extra movement stays a nudge, not a second calorie app. */
const DAILY_BONUS_CAP_KCAL = 220;

/**
 * Directional energy nudge for one logged block — not a precise calorie estimate.
 * Returns 0 when impact is small; otherwise roughly 50–200 kcal band before daily cap.
 */
export function energyBonusKcalForActivity(a: DailyActivity): number {
  const dur = Math.max(0, a.durationMin);

  // Small impact: very short sessions
  if (dur < 12) return 0;
  if (a.intensity === "light" && dur < 22) return 0;

  let anchor: number;
  if (a.intensity === "light") {
    anchor = 52 + Math.min(48, (dur - 22) * 2.2);
  } else if (a.intensity === "moderate") {
    anchor = 78 + Math.min(72, (dur - 15) * 2.0);
  } else {
    anchor = 105 + Math.min(95, (dur - 12) * 2.5);
  }

  const typeWeight: Record<DailyActivity["type"], number> = {
    walk: 1,
    dog_walk: 0.93,
    cycling: 1.12,
    active_work: 0.86,
    other: 0.98,
  };

  const v = Math.round(anchor * typeWeight[a.type]);
  if (v < 48) return 0;
  return Math.min(200, Math.max(50, v));
}

export function totalActivityEnergyBonusKcal(activities: DailyActivity[]): number {
  if (activities.length === 0) return 0;
  let sum = 0;
  for (const a of activities) {
    sum += energyBonusKcalForActivity(a);
  }
  return Math.min(DAILY_BONUS_CAP_KCAL, sum);
}
