import { generateWeeklyShoppingListForProfile } from "@/lib/food/shoppingList";
import { getRetailCatalog } from "@/lib/groceryCatalog";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";
import type {
  GroceryStoreId,
  PricedCatalogProduct,
  ShoppingListItem,
} from "@/types/grocery";
import type { Locale } from "@/lib/i18n";
import { getOffersForSuggestedBasket, type OfferLine } from "@/lib/groceryOffers";

const STORES: GroceryStoreId[] = ["s_kaupat", "prisma", "k_ruoka"];

/** veg_frozen (lista) → frozen_veg (katalogi) */
const FOOD_KEY_ALIASES: Record<string, string> = {
  veg_frozen: "frozen_veg",
};

function resolveFoodKey(k: string): string {
  return FOOD_KEY_ALIASES[k] ?? k;
}

function productsForStoreAndKey(
  catalog: PricedCatalogProduct[],
  store: GroceryStoreId,
  foodKey: string,
): PricedCatalogProduct[] {
  const key = resolveFoodKey(foodKey);
  return catalog.filter((p) => p.store === store && p.matchesFoodKey === key);
}

/** Valitse edullisin tuote kyseiselle avaimelle (yksi rivi per avain). */
function pickCheapest(
  candidates: PricedCatalogProduct[],
): PricedCatalogProduct | undefined {
  if (candidates.length === 0) return undefined;
  return [...candidates].sort((a, b) => a.priceEur - b.priceEur)[0];
}

function packsNeeded(gramsNeeded: number, packG: number): number {
  const g = Math.max(1, packG);
  return Math.max(1, Math.ceil(gramsNeeded / g));
}

function lineForItem(
  row: ShoppingListItem,
  store: GroceryStoreId,
  catalog: PricedCatalogProduct[],
): OfferLine | null {
  const candidates = productsForStoreAndKey(
    catalog,
    store,
    row.ingredientKey,
  );
  const product = pickCheapest(candidates);
  if (!product) return null;
  const pack = product.packSizeG ?? 500;
  let grams = row.amount;
  if (row.unit === "kg") grams = row.amount * 1000;
  const n = packsNeeded(grams, pack);
  const lineTotalEur = Math.round(product.priceEur * n * 100) / 100;
  return {
    foodKey: row.ingredientKey,
    product,
    packs: n,
    lineTotalEur,
  };
}

export type StoreBasketRetail = {
  store: GroceryStoreId;
  lines: OfferLine[];
  totalEur: number;
  offerLines: OfferLine[];
};

/**
 * Ostoslista käyttäjän viikkosuunnitelmasta (sama moottori kuin Food-näkymä).
 */
export function getSuggestedBasketForPlan(
  profile: OnboardingAnswers,
  plan: CoachDailyPlan,
  locale: Locale,
  daySpan: 3 | 7 = 7,
) {
  return generateWeeklyShoppingListForProfile(profile, plan, {
    daySpan,
    locale,
  });
}

export function buildRetailStoreBaskets(
  shoppingItems: ShoppingListItem[],
): StoreBasketRetail[] {
  const catalog = getRetailCatalog();
  return STORES.map((store) => {
    const lines: OfferLine[] = [];
    for (const row of shoppingItems) {
      const line = lineForItem(row, store, catalog);
      if (line) lines.push(line);
    }
    const totalEur =
      Math.round(lines.reduce((s, l) => s + l.lineTotalEur, 0) * 100) / 100;
    const offerLines = getOffersForSuggestedBasket(lines, store);
    return { store, lines, totalEur, offerLines };
  });
}

export function getCheapestBasketAcrossStores(
  baskets: StoreBasketRetail[],
): GroceryStoreId | null {
  if (baskets.length === 0) return null;
  const sorted = [...baskets].sort((a, b) => a.totalEur - b.totalEur);
  return sorted[0]?.store ?? null;
}

export type RetailComparisonResult = {
  baskets: StoreBasketRetail[];
  cheapestStore: GroceryStoreId | null;
  /** Ydinavaimet joista rivit muodostettiin */
  foodKeys: string[];
};

export function getRetailComparisonForWeeklyItems(
  items: ShoppingListItem[],
): RetailComparisonResult {
  const baskets = buildRetailStoreBaskets(items);
  const cheapestStore = getCheapestBasketAcrossStores(baskets);
  const foodKeys = [...new Set(items.map((i) => i.ingredientKey))];
  return { baskets, cheapestStore, foodKeys };
}
