import { loadFoodLog } from "@/lib/foodStorage";

/** Päivien määrä ikkunassa, joilla on vähintään yksi kirjattu energiarivi. */
export function countDaysWithFoodLog(
  referenceDate: Date,
  windowDays: number,
): number {
  let n = 0;
  for (let i = 0; i < windowDays; i++) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const log = loadFoodLog(d);
    if (log.some((x) => (x.kcal ?? 0) > 0)) n++;
  }
  return n;
}
