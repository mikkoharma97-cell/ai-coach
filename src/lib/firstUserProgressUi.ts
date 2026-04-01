import { progressDataFallbackKey } from "@/lib/dataConfidence";
import { countDaysWithFoodLog } from "@/lib/food/foodLogCoverage";

/**
 * Näytetäänkö Progress-esimerkkikerros (ei korvaa oikeaa dataa).
 * Pieni putki tai ei painokäyrää → käyttäjä ei näe tyhjää ruutua.
 */
export function shouldShowProgressExamples(
  combinedStreak: number,
  referenceDate: Date,
  hasWeightChartPoints: boolean,
): boolean {
  if (progressDataFallbackKey(combinedStreak)) return true;
  if (!hasWeightChartPoints) return true;
  return false;
}

/** Ruoka-sivun makroesimerkki kun viikolla vähän kirjauksia. */
export function shouldShowFoodMacroExample(referenceDate: Date): boolean {
  return countDaysWithFoodLog(referenceDate, 7) < 2;
}

/** Tiivis Today-vihje: sama heuristiikka kuin Progress (putki). */
export function shouldShowTodayProgressHint(combinedStreak: number): boolean {
  return Boolean(progressDataFallbackKey(combinedStreak));
}

/**
 * Kuvitteellinen energiakäyrä (pyöreät luvut — ei henkilökohtaista dataa).
 * Vain esimerkkikaavioon.
 */
export const EXAMPLE_KCAL_CHART_POINTS: { dateKey: string; value: number }[] = [
  { dateKey: "sample-0", value: 1900 },
  { dateKey: "sample-1", value: 2000 },
  { dateKey: "sample-2", value: 1950 },
  { dateKey: "sample-3", value: 2050 },
  { dateKey: "sample-4", value: 2000 },
  { dateKey: "sample-5", value: 2100 },
  { dateKey: "sample-6", value: 2050 },
];

/** Esimerkkimakrot vain suhteina (%) — ei tavoitelukuja. */
export const EXAMPLE_MACRO_RATIO_PCT = { p: 36, c: 40, f: 24 } as const;
