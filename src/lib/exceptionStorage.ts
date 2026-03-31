import type { ActiveExceptionState, ExceptionId, ExceptionSeverity } from "@/types/exceptions";

const ACTIVE_KEY = "ai-coach-active-exception-v1";
const LOG_KEY = "ai-coach-exception-week-log-v1";

export const EXCEPTION_STATE_CHANGED = "ai-coach-exception-state-changed";

export type ExceptionWeekLogEntry = {
  dayKey: string;
  id: ExceptionId;
  severity: ExceptionSeverity;
  at: string;
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadActiveException(): ActiveExceptionState | null {
  if (typeof window === "undefined") return null;
  try {
    return safeParse<ActiveExceptionState>(localStorage.getItem(ACTIVE_KEY));
  } catch {
    return null;
  }
}

/** Poikkeus näkyy vain valitulle päivälle — uusi päivä = ei automaattista carryä. */
export function loadActiveExceptionForDay(dayKey: string): ActiveExceptionState | null {
  const a = loadActiveException();
  if (!a || a.dayKey !== dayKey) return null;
  return a;
}

export function saveActiveException(state: ActiveExceptionState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(state));
    appendWeekLog({
      dayKey: state.dayKey,
      id: state.id,
      severity: state.severity,
      at: new Date().toISOString(),
    });
    window.dispatchEvent(new CustomEvent(EXCEPTION_STATE_CHANGED));
  } catch {
    /* ignore */
  }
}

export function clearActiveException(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACTIVE_KEY);
    window.dispatchEvent(new CustomEvent(EXCEPTION_STATE_CHANGED));
  } catch {
    /* ignore */
  }
}

function appendWeekLog(entry: ExceptionWeekLogEntry): void {
  if (typeof window === "undefined") return;
  try {
    const prev = safeParse<ExceptionWeekLogEntry[]>(localStorage.getItem(LOG_KEY)) ?? [];
    const withoutSameDay = prev.filter((e) => e.dayKey !== entry.dayKey);
    const next = [...withoutSameDay, entry].slice(-24);
    localStorage.setItem(LOG_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function loadExceptionWeekLog(): ExceptionWeekLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return safeParse<ExceptionWeekLogEntry[]>(localStorage.getItem(LOG_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function clearExceptionStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACTIVE_KEY);
    localStorage.removeItem(LOG_KEY);
  } catch {
    /* ignore */
  }
}
