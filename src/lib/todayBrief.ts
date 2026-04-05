/**
 * Today B — tiivis yhteenveto + viikkotason trendit (client-only lokit).
 */
import { calendarDayKey } from "@/lib/dateKeys";
import { getMondayBasedIndex } from "@/lib/plan";
import { getWeeklyPatternFromProfile } from "@/lib/packageGuidance";
import type { OnboardingAnswers } from "@/types/coach";
import type { WorkoutSessionLog } from "@/types/adaptiveCoaching";
import type { ChartPoint } from "@/lib/progress";

export function parseCalendarDayKey(key: string): Date | null {
  const parts = key.split("-").map(Number);
  if (parts.length !== 3) return null;
  const [y, m, d] = parts;
  if (y == null || m == null || d == null) return null;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function startOfMondayWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function endOfSundayWeek(weekStart: Date): Date {
  return addDays(weekStart, 6);
}

/** Uniikit päivät joissa on vähintään yksi salitreenikirjaus (kuluva ma–su -viikko). */
export function completedTrainingDaysThisWeek(
  sessions: WorkoutSessionLog[],
  ref: Date,
): number {
  const wStart = startOfMondayWeek(ref);
  const wEnd = endOfSundayWeek(wStart);
  const days = new Set<string>();
  for (const s of sessions) {
    const dt = parseCalendarDayKey(s.dayKey);
    if (!dt || dt < wStart || dt > wEnd) continue;
    if (s.exercises.length === 0) continue;
    days.add(s.dayKey);
  }
  return days.size;
}

/** Suunniteltujen salipäivien määrä tälle kalenteriviikolle (ma–su). */
export function plannedTrainingDaysThisWeek(profile: OnboardingAnswers, ref: Date): number {
  const wStart = startOfMondayWeek(ref);
  const train = getWeeklyPatternFromProfile(profile);
  let n = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(wStart, i);
    const idx = getMondayBasedIndex(d);
    if (train.has(idx)) n++;
  }
  return n;
}

/**
 * Viimeiset `weekCount` täyttä kalenteriviikkoa (vanhin ensin).
 * Arvo = kirjattujen sessioiden lukumäärä viikossa (yksi skaala).
 */
export function buildWeeklyTrainingTrendPoints(
  sessions: WorkoutSessionLog[],
  ref: Date,
  weekCount: number,
): ChartPoint[] {
  const out: ChartPoint[] = [];
  const thisMonday = startOfMondayWeek(ref);
  for (let w = weekCount - 1; w >= 0; w--) {
    const weekStart = addDays(thisMonday, -7 * w);
    const weekEnd = endOfSundayWeek(weekStart);
    const capEnd = ref < weekEnd ? ref : weekEnd;
    let sessN = 0;
    for (const s of sessions) {
      const dt = parseCalendarDayKey(s.dayKey);
      if (!dt || dt < weekStart || dt > capEnd) continue;
      if (s.exercises.length === 0) continue;
      sessN++;
    }
    out.push({ dateKey: calendarDayKey(capEnd), value: sessN });
  }
  return out;
}
