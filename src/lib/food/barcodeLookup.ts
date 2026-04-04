/**
 * Viivakoodi → tuote omasta katalogista. Ei ulkoisia scrape-integraatioita.
 */
import type { GroceryProduct } from "@/types/grocery";
import { getProductCatalog } from "@/lib/food/productCatalog";

export type BarcodeLookupMatch = {
  product: GroceryProduct;
  /** Mihin ateriaryhmään tuote istuu (geneerinen) */
  mealFitFi: string;
  mealFitEn: string;
  /** Korvaavuus copy */
  substituteFi: string;
  substituteEn: string;
};

export type BarcodeLookupResult =
  | { found: true; match: BarcodeLookupMatch }
  | {
      found: false;
      hintFi: string;
      hintEn: string;
    };

export function findProductByBarcode(barcode: string): BarcodeLookupResult {
  const code = barcode.trim();
  if (!code) {
    return {
      found: false,
      hintFi: "Syötä viivakoodi tai lisää tuote käsin omaan listaan myöhemmin.",
      hintEn: "Enter a barcode or add the product manually to your list later.",
    };
  }

  const catalog = getProductCatalog();
  const hit = catalog.find((p) => p.barcode === code);

  if (!hit) {
    return {
      found: false,
      hintFi:
        "Tuotetta ei löydy omasta katalogista. Tallenna omana tuotteena tai käytä geneeristä tuotetyyppiä.",
      hintEn:
        "Product not in our catalog yet. Save it as your own item or use a generic food type.",
    };
  }

  const category = hit.category;
  const mealFit =
    category === "protein" || category === "dairy"
      ? {
          fi: "Sopii proteiinipainotteiseen ateriaan tai välipalaan.",
          en: "Fits a protein-forward meal or snack.",
        }
      : category === "carb"
        ? {
            fi: "Sopii hiilaripainotteiseen ateriaan (treeni / päivä).",
            en: "Fits a carb-forward meal (training / daytime).",
          }
        : category === "vegetable" || category === "fruit"
          ? {
              fi: "Sopii lautasen kasvis-/marjaosuuteen.",
              en: "Fits the veg / fruit side of a plate.",
            }
          : {
              fi: "Sopii lisäksi päivän rakennetta tukemaan.",
              en: "Fits as an add-on to your day’s structure.",
            };

  const sub = (hit.substitutes ?? []).slice(0, 3).join(", ");

  return {
    found: true,
    match: {
      product: hit,
      mealFitFi: mealFit.fi,
      mealFitEn: mealFit.en,
      substituteFi: sub
        ? `Vaihtoehtoja: ${sub} (geneeriset tuotetyypit).`
        : "Sama kategoria — vaihda toiseen vastaavaan tuotteeseen.",
      substituteEn: sub
        ? `Alternatives: ${sub} (generic types).`
        : "Same category — swap to a similar product.",
    },
  };
}
