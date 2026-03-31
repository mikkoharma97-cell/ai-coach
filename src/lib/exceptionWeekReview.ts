/**
 * Viikkopalautteen poikkeusyhteenveto — lokista, ei diagnooseja.
 */
import { translate, type Locale } from "@/lib/i18n";
import { loadExceptionWeekLog } from "@/lib/exceptionStorage";
import { getMondayBasedIndex } from "@/lib/plan";

function mondayOfWeek(ref: Date): Date {
  const d = new Date(ref);
  d.setHours(12, 0, 0, 0);
  const off = getMondayBasedIndex(ref);
  d.setDate(d.getDate() - off);
  return d;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function parseDayKey(key: string): Date | null {
  const p = key.split("-").map(Number);
  if (p.length !== 3 || p.some((n) => Number.isNaN(n))) return null;
  return new Date(p[0], p[1] - 1, p[2], 12, 0, 0, 0);
}

function dayKeyInWeek(dayKey: string, ref: Date): boolean {
  const d = parseDayKey(dayKey);
  if (!d) return false;
  const mon = mondayOfWeek(ref);
  const sun = addDays(mon, 6);
  mon.setHours(0, 0, 0, 0);
  sun.setHours(23, 59, 59, 999);
  return d >= mon && d <= sun;
}

/** Lyhyt rivi viikkopalautteeseen, jos lokissa on merkintöjä tällä viikolla. */
export function exceptionWeekSummaryLine(
  referenceDate: Date,
  locale: Locale,
): string | null {
  const log = loadExceptionWeekLog();
  const inWeek = log.filter((e) => dayKeyInWeek(e.dayKey, referenceDate));
  if (inWeek.length === 0) return null;
  const uniqueDays = new Set(inWeek.map((e) => e.dayKey)).size;
  const ids = new Set(inWeek.map((e) => e.id));
  return translate(locale, "review.exceptionWeekLine", {
    days: uniqueDays,
    kinds: ids.size,
  });
}
