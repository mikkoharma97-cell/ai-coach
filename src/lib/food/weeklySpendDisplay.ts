import type { StoreBasket } from "@/types/grocery";

export type WeeklySpendDisplay = {
  lowEur: number;
  highEur: number;
  saveEur: number;
};

function roundNice(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (n < 22) return Math.round(n);
  return Math.round(n / 5) * 5;
}

/**
 * Arvioi viikon kori kolmesta hintakerroksesta — näytä haarukka, ei yksittäistä "2000 €" -summaa.
 */
export function weeklySpendFromStoreBaskets(
  baskets: StoreBasket[],
): WeeklySpendDisplay {
  const totals = baskets
    .map((b) => b.estimatedTotal)
    .filter((x) => Number.isFinite(x) && x > 0);
  if (totals.length === 0) {
    return { lowEur: 45, highEur: 75, saveEur: 15 };
  }
  let low = Math.min(...totals);
  let high = Math.max(...totals);
  if (high > 135) {
    const f = 92 / high;
    low *= f;
    high *= f;
  }
  const save = Math.max(0, high - low);
  return {
    lowEur: roundNice(low),
    highEur: roundNice(high),
    saveEur: Math.max(5, roundNice(save)),
  };
}
