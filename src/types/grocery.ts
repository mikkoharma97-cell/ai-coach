/**
 * Ostoslista- ja kauppakerros — oma data, ei ulkoisten kauppojen kopiointia.
 */

/** V1: kolme hintatasoa / kauppakanavaa (käsin ylläpidetyt esimerkkihinnat, ei live-API). */
export type GroceryStoreId = "s_kaupat" | "prisma" | "k_ruoka";

/**
 * Yksittäinen hinnoiteltu rivi katalogissa.
 * (Nimi `GroceryProduct` varattu alla legacy-tyypille → tämä on vähittäishinta-V1.)
 */
export type PricedCatalogProduct = {
  id: string;
  store: GroceryStoreId;
  name: string;
  brand?: string;
  category: string;
  unit: string;
  sizeText?: string;
  priceEur: number;
  pricePerUnitText?: string;
  offerText?: string | null;
  offerValidUntil?: string | null;
  tags?: string[];
  /** Yhdistää `ShoppingListItem.ingredientKey` / meal-engine -avaimiin */
  matchesFoodKey: string;
  /** Myyntipakkauksen koko (g tai ml) — määrälaskenta */
  packSizeG?: number;
};

export type GroceryMatchRule = {
  foodKey: string;
  keywords: string[];
  preferredCategories?: string[];
};

export type StoreId = "store_a" | "store_b" | "store_c";

export type GroceryPreference = {
  preferredStores?: StoreId[];
  avoidIngredients?: string[];
  favoriteProducts?: string[];
  budgetLevel?: "low" | "balanced" | "premium";
  batchCooking?: boolean;
};

export type GroceryProduct = {
  id: string;
  nameFi: string;
  nameEn: string;
  brand?: string;
  storeId?: StoreId;
  category:
    | "protein"
    | "carb"
    | "fat"
    | "vegetable"
    | "fruit"
    | "dairy"
    | "snack"
    | "drink"
    | "other";
  unit: "g" | "kg" | "ml" | "l" | "piece" | "pack";
  /** Myyntiyksikön koko (g/ml/kpl/pkt) — hinta koskee tätä yksikköä */
  packSize?: number;
  estimatedPrice?: number;
  barcode?: string;
  tags?: string[];
  substitutes?: string[];
};

export type ShoppingListItem = {
  ingredientKey: string;
  labelFi: string;
  labelEn: string;
  amount: number;
  unit: string;
  daysUsed: string[];
  category: GroceryProduct["category"];
  productSuggestions: GroceryProduct[];
};

export type StoreBasket = {
  storeId: StoreId;
  items: {
    ingredientKey: string;
    productId?: string;
    productName: string;
    quantity: number;
    unit: string;
    estimatedPrice: number;
  }[];
  estimatedTotal: number;
};

/** Viikon ateriat — generaattorin syöte */
export type WeeklyMealPlanSlot = {
  slot: string;
  mealNameFi: string;
  mealNameEn: string;
  tags?: string[];
};

export type WeeklyMealPlanDay = {
  dayKey: string;
  labelFi: string;
  labelEn: string;
  slots: WeeklyMealPlanSlot[];
};

export type WeeklyMealPlanInput = {
  days: WeeklyMealPlanDay[];
};
