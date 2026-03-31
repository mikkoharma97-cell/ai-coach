/**
 * Arvioi makrot pelkästä kcal-lokista päivän tavoitemakrojen suhteella.
 */
import type { MacroTotals } from "@/lib/food/offPlan";
import type { DailyMacros } from "@/types/coach";

/** Jakaa lokin kcal:t tavoitemakrosuhteen mukaan (yksinkertainen MVP). */
export function estimateConsumedFromKcalLog(
  kcalTotal: number,
  target: DailyMacros,
): MacroTotals {
  const tp = target.proteinG * 4;
  const tc = target.carbsG * 4;
  const tf = target.fatG * 9;
  const tsum = tp + tc + tf;
  if (tsum <= 0 || kcalTotal <= 0) {
    return { calories: kcalTotal, protein: 0, carbs: 0, fat: 0 };
  }
  const pK = (tp / tsum) * kcalTotal;
  const cK = (tc / tsum) * kcalTotal;
  const fK = (tf / tsum) * kcalTotal;
  return {
    calories: kcalTotal,
    protein: Math.round(pK / 4),
    carbs: Math.round(cK / 4),
    fat: Math.round(fK / 9),
  };
}

export function dailyTargetsFromPlan(
  calories: number,
  macros: DailyMacros,
): MacroTotals {
  return {
    calories,
    protein: macros.proteinG,
    carbs: macros.carbsG,
    fat: macros.fatG,
  };
}
