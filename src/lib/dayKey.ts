/**
 * Yksi päiväavain (kalenteripäivä) — YYYY-MM-DD, nollat täytettynä.
 * Käytä tätä workout-set-lokissa, ruokalogeissa ja Today-ankkureissa.
 */

function toDate(input: Date | string | undefined): Date {
  if (input === undefined) return new Date();
  if (input instanceof Date) return input;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

/** Kalenteripäivä ISO-merkkijonosta tai Datestä; `undefined` = tänään. */
export function getDayKey(input?: Date | string): string {
  const d = toDate(input);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getTodayDayKey(): string {
  return getDayKey(new Date());
}

/** Yhtenäistää vanhat avaimet (esim. 2026-4-5 vs 2026-04-05) vertailuun. */
export function normalizeDayKey(raw: string): string {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(raw.trim());
  if (!m) return raw.trim();
  const mo = String(parseInt(m[2]!, 10)).padStart(2, "0");
  const d = String(parseInt(m[3]!, 10)).padStart(2, "0");
  return `${m[1]}-${mo}-${d}`;
}
