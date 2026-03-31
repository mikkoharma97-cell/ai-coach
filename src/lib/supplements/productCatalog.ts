/**
 * Lisäravinteiden katalogi — oma tuoteperhe, ei ulkoisten listojen peilausta.
 */
import type { SupplementProductCategory } from "@/types/supplementProducts";

export type SupplementCatalogEntry = {
  id: string;
  brand: string;
  category: SupplementProductCategory;
  nameFi: string;
  nameEn: string;
  /** Lyhyt, faktapohjainen hyöty (ei terveysväitteitä) */
  benefitFi: string;
  benefitEn: string;
};

export const SUPPLEMENT_CATALOG: SupplementCatalogEntry[] = [
  {
    id: "ptv_whey_isolate",
    brand: "PTV Labs",
    category: "protein",
    nameFi: "Clear Whey Isolate",
    nameEn: "Clear Whey Isolate",
    benefitFi: "Nopea proteiinilisä, kun päivän proteiini jää vajaaksi.",
    benefitEn: "Fast protein top-up when your daily intake falls short.",
  },
  {
    id: "ptv_creatine_mono",
    brand: "PTV Labs",
    category: "creatine",
    nameFi: "Creatine Monohydrate",
    nameEn: "Creatine Monohydrate",
    benefitFi: "Tukee toistuvaa voima- ja tehotyötä — tutkimusnäyttö vakiintunut.",
    benefitEn: "Supports repeated strength and power work — well-studied.",
  },
  {
    id: "ptv_recharge",
    brand: "PTV Labs",
    category: "recovery",
    nameFi: "Recharge Electrolyte",
    nameEn: "Recharge Electrolyte",
    benefitFi: "Nestetasapaino ja magnesium tukemaan palautumista kuorman jälkeen.",
    benefitEn: "Electrolytes and magnesium to support recovery after hard loads.",
  },
  {
    id: "ptv_daily_basis",
    brand: "PTV Labs",
    category: "vitamins",
    nameFi: "Daily Basis Multivitamin",
    nameEn: "Daily Basis Multivitamin",
    benefitFi: "Perusravintoaineiden täydennys, kun ruokarytmi on epätasainen.",
    benefitEn: "Baseline micronutrient cover when meal rhythm is uneven.",
  },
];

const byId = new Map(SUPPLEMENT_CATALOG.map((p) => [p.id, p]));

export function getSupplementCatalogEntry(
  id: string,
): SupplementCatalogEntry | undefined {
  return byId.get(id);
}
