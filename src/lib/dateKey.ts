/** @file Yhteensopiva export — käytä ensisijaisesti `getDayKey` / `getTodayDayKey` moduulista `@/lib/dayKey`. */
import { getDayKey } from "./dayKey";

export { getDayKey, getTodayDayKey, normalizeDayKey } from "./dayKey";

/**
 * Kalenteripäivän avain — `YYYY-MM-DD` (yhtenäinen workout/food/today).
 * @deprecated suora nimi: käytä `getDayKey`
 */
export function dayKeyFromDate(d: Date): string {
  return getDayKey(d);
}
