const KEY = "ai-coach-minimum-day-v1";

export const MINIMUM_DAY_CHANGED = "ai-coach-minimum-day-changed";

type MinimumDayState = {
  /** YYYY-M-D — sama kuin dayKeyFromDate */
  dayKey: string;
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadMinimumDayForDay(dayKey: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const s = safeParse<MinimumDayState>(localStorage.getItem(KEY));
    return s?.dayKey === dayKey;
  } catch {
    return false;
  }
}

export function saveMinimumDayForDay(dayKey: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ dayKey } satisfies MinimumDayState));
    window.dispatchEvent(new CustomEvent(MINIMUM_DAY_CHANGED));
  } catch {
    /* ignore */
  }
}

export function clearMinimumDay(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent(MINIMUM_DAY_CHANGED));
  } catch {
    /* ignore */
  }
}
