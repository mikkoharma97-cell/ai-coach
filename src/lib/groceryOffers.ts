import type { GroceryStoreId, PricedCatalogProduct } from "@/types/grocery";

export type OfferLine = {
  foodKey: string;
  product: PricedCatalogProduct;
  packs: number;
  lineTotalEur: number;
};

/** Tarjousrivit valitusta korista (sama kauppa). */
export function getOffersForSuggestedBasket(
  lines: OfferLine[],
  store: GroceryStoreId,
): OfferLine[] {
  return lines.filter(
    (l) =>
      l.product.store === store &&
      Boolean(l.product.offerText?.trim()),
  );
}

export function countOffersInBasket(lines: OfferLine[]): number {
  return lines.filter((l) => Boolean(l.product.offerText?.trim())).length;
}
