/**
 * Työvuorot — localStorage, sama linja kuin muu V1-data.
 */
import { calendarDayKey } from "@/lib/dateKeys";
import type { WorkShiftEntry } from "@/types/workShifts";

export const WORK_SHIFTS_STORAGE_KEY = "ai-coach-work-shifts-v1";

type Stored = {
  entries: WorkShiftEntry[];
  /** Käyttäjä on aktivoinut vuorosuunnittelun */
  shiftMode: boolean;
};

export function normalizeShiftDateKey(raw: string): string {
  const p = raw.trim().split("-").map((x) => parseInt(x, 10));
  if (p.length !== 3 || p.some((n) => Number.isNaN(n))) return raw;
  const [y, mo, d] = p;
  return calendarDayKey(new Date(y, mo - 1, d));
}

/** Yhdistä merkinnät sama päivä → viimeisin voittaa */
function dedupeEntries(entries: WorkShiftEntry[]): WorkShiftEntry[] {
  const map = new Map<string, WorkShiftEntry>();
  for (const e of entries) {
    const k = normalizeShiftDateKey(e.date);
    map.set(k, { ...e, date: k });
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function loadWorkShifts(): WorkShiftEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WORK_SHIFTS_STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as Partial<Stored> | WorkShiftEntry[];
    if (Array.isArray(p)) {
      return dedupeEntries(p);
    }
    return dedupeEntries(p.entries ?? []);
  } catch {
    return [];
  }
}

export function loadShiftMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(WORK_SHIFTS_STORAGE_KEY);
    if (!raw) return false;
    const p = JSON.parse(raw) as Partial<Stored>;
    if (Array.isArray(p)) return p.length > 0;
    return Boolean(p.shiftMode) || (p.entries?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

export function saveWorkShifts(
  entries: WorkShiftEntry[],
  options?: { shiftMode?: boolean },
): void {
  if (typeof window === "undefined") return;
  try {
    const cleaned = dedupeEntries(entries);
    const shiftMode = options?.shiftMode ?? cleaned.length > 0;
    const payload: Stored = { entries: cleaned, shiftMode };
    localStorage.setItem(WORK_SHIFTS_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new Event("coach-work-shifts-changed"));
  } catch {
    /* ignore */
  }
}

export const WORK_SHIFTS_CHANGED = "coach-work-shifts-changed";

export function getWorkShiftForDate(date: Date): WorkShiftEntry | null {
  const k = calendarDayKey(date);
  return loadWorkShifts().find((e) => normalizeShiftDateKey(e.date) === k) ?? null;
}

export function clearWorkShiftStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WORK_SHIFTS_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
