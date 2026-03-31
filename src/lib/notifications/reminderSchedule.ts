/**
 * HÄRMÄ20 — milloin saa muistuttaa (ei spämmiä).
 */
import type { ReminderPrefs } from "@/lib/notifications/reminderStorage";
import type { CoachDailyPlan } from "@/types/coach";
import { getMondayBasedIndex } from "@/lib/plan";

export type ReminderKind = "workout" | "food" | "dayIncomplete";

const MAX_PER_DAY = 3;
const MIN_GAP_MS = 90 * 60 * 1000;

/** Hiljaiset tunnit: esim. 22–07 → yöllä ei ilmoituksia. */
export function isQuietHour(now: Date, prefs: ReminderPrefs): boolean {
  const h = now.getHours();
  const start = prefs.quietStartHour;
  const end = prefs.quietEndHour;
  if (start === end) return false;
  if (start > end) {
    return h >= start || h < end;
  }
  return h >= start && h < end;
}

function hourReached(now: Date, targetHour: number): boolean {
  return now.getHours() >= targetHour;
}

export function pickNextReminder(args: {
  now: Date;
  prefs: ReminderPrefs;
  plan: CoachDailyPlan | null;
  dayMarkedDone: boolean;
  lastNotificationAt: number;
  sentWorkout: boolean;
  sentFood: boolean;
  sentDayIncomplete: boolean;
  sentCount: number;
}): ReminderKind | null {
  const {
    now,
    prefs,
    plan,
    dayMarkedDone,
    lastNotificationAt,
    sentWorkout,
    sentFood,
    sentDayIncomplete,
    sentCount,
  } = args;

  if (!prefs.enabled) return null;
  if (dayMarkedDone) return null;
  if (sentCount >= MAX_PER_DAY) return null;
  if (
    sentCount > 0 &&
    lastNotificationAt > 0 &&
    Date.now() - lastNotificationAt < MIN_GAP_MS
  ) {
    return null;
  }
  if (isQuietHour(now, prefs)) return null;

  const todayIdx = getMondayBasedIndex(now);
  const entry = plan?.weeklyPlan.days[todayIdx];
  const isRest = Boolean(entry?.isRest);

  if (
    !sentWorkout &&
    !isRest &&
    plan &&
    hourReached(now, prefs.workoutHour)
  ) {
    return "workout";
  }
  if (!sentFood && hourReached(now, prefs.foodHour)) {
    return "food";
  }
  if (!sentDayIncomplete && hourReached(now, prefs.dayIncompleteHour)) {
    return "dayIncomplete";
  }
  return null;
}

export { MAX_PER_DAY, MIN_GAP_MS };
