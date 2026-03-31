/** Single calendar day key — YYYY-M-D (no zero-padding), matches storage keys across the app. */
export function calendarDayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
