/**
 * "Valitse puolestani" — päivän automaattivalinnat (V1), sama linja kuin muu data.
 */
import { calendarDayKey } from "@/lib/dateKeys";

const PREFIX = "ai-coach-thinkless-v1:";

export const THINKLESS_CHANGED = "coach-thinkless-changed";

export type ThinklessDayPick = {
  foodLine: string;
  workoutLine: string;
  activityLine: string;
  savedAt: string;
};

function keyFor(date: Date): string {
  return PREFIX + calendarDayKey(date);
}

export function saveThinklessPick(date: Date, pick: Omit<ThinklessDayPick, "savedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const payload: ThinklessDayPick = {
      ...pick,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(keyFor(date), JSON.stringify(payload));
    window.dispatchEvent(new Event(THINKLESS_CHANGED));
  } catch {
    /* ignore */
  }
}

export function loadThinklessPick(date: Date): ThinklessDayPick | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(keyFor(date));
    if (!raw) return null;
    return JSON.parse(raw) as ThinklessDayPick;
  } catch {
    return null;
  }
}

export function clearThinklessPick(date: Date): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(keyFor(date));
    window.dispatchEvent(new Event(THINKLESS_CHANGED));
  } catch {
    /* ignore */
  }
}
