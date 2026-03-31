/**
 * Päivän toteutus — checklist tallenne (V1).
 */
import { calendarDayKey } from "@/lib/dateKeys";

const PREFIX = "ai-coach-day-exec-v1:";

export type DayExecutionChecklist = {
  workout: boolean;
  eaten: boolean;
  rhythm: boolean;
  savedAt: string;
};

function keyFor(date: Date): string {
  return PREFIX + calendarDayKey(date);
}

export function saveDayExecution(
  date: Date,
  checklist: Omit<DayExecutionChecklist, "savedAt">,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: DayExecutionChecklist = {
      ...checklist,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(keyFor(date), JSON.stringify(payload));
    window.dispatchEvent(new Event("coach-day-exec-changed"));
  } catch {
    /* ignore */
  }
}

export function loadDayExecution(date: Date): DayExecutionChecklist | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(keyFor(date));
    if (!raw) return null;
    return JSON.parse(raw) as DayExecutionChecklist;
  } catch {
    return null;
  }
}

export function clearDayExecution(date: Date): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(keyFor(date));
  } catch {
    /* ignore */
  }
}

export const DAY_EXECUTION_CHANGED = "coach-day-exec-changed";
