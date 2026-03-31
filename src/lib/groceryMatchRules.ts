import type { GroceryMatchRule } from "@/types/grocery";

/**
 * Yhdistää ateriatekstit / ingredientKey → tuoteavaimet.
 * Käytetään fuzzy-matchissa katalogiin (V1: pääasiassa suora foodKey).
 */
export const GROCERY_MATCH_RULES: GroceryMatchRule[] = [
  {
    foodKey: "chicken_breast",
    keywords: ["kana", "broiler", "filee", "chicken"],
    preferredCategories: ["protein"],
  },
  {
    foodKey: "beef_mince",
    keywords: ["jauheliha", "naudan", "mince", "beef"],
    preferredCategories: ["protein"],
  },
  {
    foodKey: "salmon",
    keywords: ["lohi", "salmon", "kala"],
    preferredCategories: ["protein"],
  },
  {
    foodKey: "eggs",
    keywords: ["muna", "egg"],
    preferredCategories: ["protein"],
  },
  {
    foodKey: "rice",
    keywords: ["riisi", "rice"],
    preferredCategories: ["carb"],
  },
  {
    foodKey: "oats",
    keywords: ["kaura", "puuro", "oat"],
    preferredCategories: ["carb"],
  },
  {
    foodKey: "potato",
    keywords: ["peruna", "potato"],
    preferredCategories: ["carb"],
  },
  {
    foodKey: "pasta",
    keywords: ["pasta", "spaghetti", "macaroni"],
    preferredCategories: ["carb"],
  },
  {
    foodKey: "bread",
    keywords: ["leipä", "bread", "sämpylä"],
    preferredCategories: ["carb"],
  },
  {
    foodKey: "tortilla",
    keywords: ["tortilla", "wrap"],
    preferredCategories: ["carb"],
  },
  {
    foodKey: "quark",
    keywords: ["rahka", "quark", "proteiini", "jogurtti"],
    preferredCategories: ["dairy"],
  },
  {
    foodKey: "cottage_cheese",
    keywords: ["raejuusto", "cottage"],
    preferredCategories: ["dairy"],
  },
  {
    foodKey: "yogurt",
    keywords: ["jogurtti", "yogurt", "greeki"],
    preferredCategories: ["dairy"],
  },
  {
    foodKey: "banana",
    keywords: ["banaani", "banana"],
    preferredCategories: ["fruit"],
  },
  {
    foodKey: "frozen_veg",
    keywords: ["pakaste", "kasvis", "wok", "frozen"],
    preferredCategories: ["vegetable"],
  },
  {
    foodKey: "olive_oil",
    keywords: ["öljy", "oliivi", "oil"],
    preferredCategories: ["fat"],
  },
  {
    foodKey: "protein_shake",
    keywords: ["proteiini", "shake", "juoma", "whey"],
    preferredCategories: ["drink"],
  },
  {
    foodKey: "tofu",
    keywords: ["tofu"],
    preferredCategories: ["protein"],
  },
];
