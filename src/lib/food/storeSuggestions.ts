/**
 * Kolme kauppavaihtoehtoa — arvioidut korit, ei reaaliaikaista hinnoittelua.
 */
import type {
  GroceryProduct,
  ShoppingListItem,
  StoreBasket,
  StoreId,
} from "@/types/grocery";
import { productsForIngredientKey, productsForStore } from "@/lib/food/productCatalog";

const STORE_ORDER: StoreId[] = ["store_a", "store_b", "store_c"];

function priceForLine(
  product: GroceryProduct,
  amountNeeded: number,
  unit: string,
): { qty: number; linePrice: number } {
  const pack = product.packSize ?? 1;
  const ep = product.estimatedPrice ?? 0;
  if (unit === "g" || unit === "ml") {
    const packs = Math.max(1, Math.ceil(amountNeeded / Math.max(1, pack)));
    return { qty: packs, linePrice: packs * ep };
  }
  if (unit === "piece") {
    const packs = Math.max(1, Math.ceil(amountNeeded / Math.max(1, pack)));
    return { qty: packs, linePrice: packs * ep };
  }
  if (unit === "kg") {
    const grams = amountNeeded;
    const packs = Math.max(1, Math.ceil(grams / Math.max(100, pack)));
    return { qty: packs, linePrice: packs * ep };
  }
  const packs = Math.max(1, Math.ceil(amountNeeded / Math.max(1, pack)));
  return { qty: packs, linePrice: packs * ep };
}

function pickProductForStore(
  catalog: GroceryProduct[],
  ingredientKey: string,
  storeId: StoreId,
): GroceryProduct | undefined {
  const pool = productsForStore(
    productsForIngredientKey(catalog, ingredientKey),
    storeId,
  );
  return pool[0];
}

export type StoreBasketLabel = {
  kind: "budget" | "balanced" | "premium";
  labelFi: string;
  labelEn: string;
};

export function buildStoreBaskets(params: {
  shoppingList: ShoppingListItem[];
  productCatalog: GroceryProduct[];
  preferredStores?: StoreId[];
}): { baskets: StoreBasket[]; labels: StoreBasketLabel[] } {
  const { shoppingList, productCatalog, preferredStores } = params;
  const order = preferredStores?.length
    ? [...new Set([...preferredStores, ...STORE_ORDER])].filter((s, i, a) =>
        a.indexOf(s) === i,
      )
    : STORE_ORDER;

  const labels: StoreBasketLabel[] = [
    {
      kind: "budget",
      labelFi: "Edullisin arvio",
      labelEn: "Lowest estimate",
    },
    {
      kind: "balanced",
      labelFi: "Tasapainoinen",
      labelEn: "Balanced",
    },
    {
      kind: "premium",
      labelFi: "Laadukkaampi valikoima",
      labelEn: "Premium selection",
    },
  ];

  const baskets: StoreBasket[] = order.slice(0, 3).map((storeId, i) => {
    const items: StoreBasket["items"] = [];
    let estimatedTotal = 0;

    for (const row of shoppingList) {
      const product = pickProductForStore(
        productCatalog,
        row.ingredientKey,
        storeId,
      );
      if (!product) continue;
      const { qty, linePrice } = priceForLine(
        product,
        row.amount,
        row.unit,
      );
      const name = product.nameFi;
      estimatedTotal += linePrice;
      items.push({
        ingredientKey: row.ingredientKey,
        productId: product.id,
        productName: name,
        quantity: qty,
        unit: row.unit === "g" ? "pkt" : row.unit,
        estimatedPrice: Math.round(linePrice * 100) / 100,
      });
    }

    return {
      storeId,
      items,
      estimatedTotal: Math.round(estimatedTotal * 100) / 100,
    };
  });

  return { baskets, labels: labels.slice(0, baskets.length) };
}
