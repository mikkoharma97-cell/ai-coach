/**
 * Valmiit ruokarungot — ateriarytmi ja moottoripainotukset (ei reseptikirjaa).
 */
import { resolveNutritionBlueprintFromProfile } from "@/lib/profileProgramResolver";
import type {
  MealStructurePreference,
  NutritionBlueprintId,
  OnboardingAnswers,
  ProgramPackageId,
} from "@/types/coach";
import { normalizeProgramPackageId } from "@/lib/programPackages";

export type NutritionBlueprint = {
  id: NutritionBlueprintId;
  nameFi: string;
  nameEn: string;
  summaryFi: string;
  summaryEn: string;
  audienceFi: string;
  audienceEn: string;
  benefitLineFi: string;
  benefitLineEn: string;
  /** Viikkonäkymän / päivän ruokaohje (lyhyt) */
  planFoodLineFi: string;
  planFoodLineEn: string;
  mealCount: number;
  timingMode: "standard" | "training_day" | "shift_based" | "flex";
  style: "easy" | "balanced" | "high_protein" | "performance" | "fatloss";
  includesWorkoutNutrition: boolean;
  supportsBatchCooking: boolean;
  supportsQuickFallbacks: boolean;
};

const IDS = new Set<string>([
  "easy_daily",
  "steady_meals",
  "muscle_fuel",
  "light_cut_meal",
  "train_vs_rest",
  "shift_clock",
  "event_balance",
  "pro_nutrition",
]);

export const NUTRITION_BLUEPRINTS: NutritionBlueprint[] = [
  {
    id: "easy_daily",
    nameFi: "Helppo arki",
    nameEn: "Easy everyday",
    summaryFi:
      "Nopea rytmi, vähän kitkaa — perustuotteilla pysyt linjassa.",
    summaryEn:
      "A fast rhythm with low friction — staple foods keep you on track.",
    audienceFi: "Kiireinen arki",
    audienceEn: "Busy everyday life",
    benefitLineFi:
      "Kun haluat selkeän rytmin ilman monimutkaista valmistelua.",
    benefitLineEn:
      "When you want a clear rhythm without complicated prep.",
    planFoodLineFi: "Kolme ateriaa — sama rytmi, yksi kasvislisä tänään.",
    planFoodLineEn: "Three meals — same rhythm, add vegetables once today.",
    mealCount: 3,
    timingMode: "standard",
    style: "easy",
    includesWorkoutNutrition: false,
    supportsBatchCooking: true,
    supportsQuickFallbacks: true,
  },
  {
    id: "steady_meals",
    nameFi: "Tasainen rytmi",
    nameEn: "Steady rhythm",
    summaryFi:
      "Neljä ateriaa — tasainen energia ja vähemmän piikkejä päivän aikana.",
    summaryEn:
      "Four meals — steadier energy and fewer spikes through the day.",
    audienceFi: "Säännöllinen päivärytmi",
    audienceEn: "A regular daily rhythm",
    benefitLineFi:
      "Energia pysyy tasaisena ilman jatkuvaa napostelua.",
    benefitLineEn:
      "Energy stays even without constant snacking.",
    planFoodLineFi: "Neljä ateriaa — jakso energiaa tasaisesti.",
    planFoodLineEn: "Four meals — spread energy evenly.",
    mealCount: 4,
    timingMode: "standard",
    style: "balanced",
    includesWorkoutNutrition: false,
    supportsBatchCooking: true,
    supportsQuickFallbacks: true,
  },
  {
    id: "muscle_fuel",
    nameFi: "Lihaskasvun rytmi",
    nameEn: "Muscle-growth rhythm",
    summaryFi:
      "Enemmän energiaa ja lämpimiä ankkuriaterioita — tukee nostopäiviä.",
    summaryEn:
      "More energy and warm anchor meals — supports lifting days.",
    audienceFi: "Kasvutavoite ja säännöllinen treeni",
    audienceEn: "Growth goal and regular training",
    benefitLineFi:
      "Tämä tukee lihaskasvua ilman jatkuvaa säätöä.",
    benefitLineEn:
      "This supports muscle growth without constant tweaking.",
    planFoodLineFi: "Neljä ateriaa — lämpimät pääateriat tukevat treeniä.",
    planFoodLineEn: "Four meals — warm mains support training.",
    mealCount: 4,
    timingMode: "training_day",
    style: "performance",
    includesWorkoutNutrition: true,
    supportsBatchCooking: true,
    supportsQuickFallbacks: false,
  },
  {
    id: "light_cut_meal",
    nameFi: "Kevyt leikkaus",
    nameEn: "Light cut",
    summaryFi:
      "Proteiini edellä, kylläisyys kuntoon ja ilta kevyempi.",
    summaryEn:
      "Protein first, fullness in place, lighter evening.",
    audienceFi: "Maltillinen alijäämä",
    audienceEn: "Modest deficit",
    benefitLineFi:
      "Nälkä pysyy hallittuna kun rakenne on selvä.",
    benefitLineEn:
      "Hunger stays manageable when structure is clear.",
    planFoodLineFi: "Proteiini edellä — ilta pidetään kevyempänä.",
    planFoodLineEn: "Protein first — keep dinner lighter.",
    mealCount: 4,
    timingMode: "standard",
    style: "fatloss",
    includesWorkoutNutrition: false,
    supportsBatchCooking: true,
    supportsQuickFallbacks: true,
  },
  {
    id: "train_vs_rest",
    nameFi: "Treeni / lepo",
    nameEn: "Train / rest",
    summaryFi:
      "Eri rakenne treeni- ja lepopäiville — palautuminen näkyy ruoassa.",
    summaryEn:
      "Different structure on training vs rest days — recovery shows up in food.",
    audienceFi: "Useita treenipäiviä viikossa",
    audienceEn: "Several training days per week",
    benefitLineFi:
      "Kuorma ja keveys vuorottelevat päivän mukaan.",
    benefitLineEn:
      "Load and lightness alternate by day.",
    planFoodLineFi: "Viisi ateriaa — treenin ympärille rakennettu rytmi.",
    planFoodLineEn: "Five meals — rhythm built around training.",
    mealCount: 5,
    timingMode: "training_day",
    style: "performance",
    includesWorkoutNutrition: true,
    supportsBatchCooking: true,
    supportsQuickFallbacks: true,
  },
  {
    id: "shift_clock",
    nameFi: "Vuorotyö",
    nameEn: "Shift work",
    summaryFi:
      "Ajoitus heräämisen ympärille — ei kiinteää kellonaikapakkoa.",
    summaryEn:
      "Timing around wake time — no fixed clock pressure.",
    audienceFi: "Vuorotyö tai vaihtelevat vuorokaudet",
    audienceEn: "Shift work or changing hours",
    benefitLineFi:
      "Vuororytmi huomioidaan ilman kellonaikapakkoa.",
    benefitLineEn:
      "Shift rhythm without rigid clock rules.",
    planFoodLineFi: "Ateriat heräämisen ympärille — ei kellonaikapakkoa.",
    planFoodLineEn: "Meals around wake time — no fixed clock pressure.",
    mealCount: 4,
    timingMode: "shift_based",
    style: "balanced",
    includesWorkoutNutrition: false,
    supportsBatchCooking: true,
    supportsQuickFallbacks: true,
  },
  {
    id: "event_balance",
    nameFi: "Tapahtumajousto",
    nameEn: "Event flexibility",
    summaryFi:
      "Juhlat, ulkona syöminen ja ohisyöminen — viikko tasapainotetaan loppuun.",
    summaryEn:
      "Parties, eating out, slips — the week balances toward the end.",
    audienceFi: "Sosiaalinen syöminen ja tapahtumat",
    audienceEn: "Social eating and events",
    benefitLineFi:
      "Yksi ilta ei kaada viikkoa kun rytmi korjaa loppupään.",
    benefitLineEn:
      "One night doesn’t wreck the week when rhythm fixes the tail.",
    planFoodLineFi: "Joustava viikko — loppupäivä tasapainottaa makrot.",
    planFoodLineEn: "Flexible week — tail of day balances macros.",
    mealCount: 4,
    timingMode: "flex",
    style: "balanced",
    includesWorkoutNutrition: false,
    supportsBatchCooking: false,
    supportsQuickFallbacks: true,
  },
  {
    id: "pro_nutrition",
    nameFi: "Pro-ruokarunko",
    nameEn: "Pro meal framework",
    summaryFi:
      "Oma rakenne ja automaattiset korjaukset — makrot ja ateriamallit päivittyvät päätösten mukaan.",
    summaryEn:
      "Your structure plus automatic adjustments — macros and meal patterns follow decisions.",
    audienceFi: "Pro-tila / kokenut käyttäjä",
    audienceEn: "Pro mode / advanced user",
    benefitLineFi:
      "Säätö tapahtuu ohjauksessa — et jää yksin laskemaan.",
    benefitLineEn:
      "Adjustments happen in guidance — you’re not left calculating alone.",
    planFoodLineFi: "Makrot ja ateriat — mukautuvat päivän päätöksiin.",
    planFoodLineEn: "Macros and meals — adapt to the day’s choices.",
    mealCount: 5,
    timingMode: "flex",
    style: "performance",
    includesWorkoutNutrition: true,
    supportsBatchCooking: true,
    supportsQuickFallbacks: true,
  },
];

const DEFAULT_BY_PACKAGE: Record<ProgramPackageId, NutritionBlueprintId> = {
  steady_start: "easy_daily",
  muscle_rhythm: "muscle_fuel",
  light_cut: "light_cut_meal",
  performance_block: "train_vs_rest",
};

export function normalizeNutritionBlueprintId(
  id: string | null | undefined,
): NutritionBlueprintId | undefined {
  if (!id) return undefined;
  return IDS.has(id) ? (id as NutritionBlueprintId) : undefined;
}

export function getNutritionBlueprint(id: NutritionBlueprintId): NutritionBlueprint {
  const b = NUTRITION_BLUEPRINTS.find((x) => x.id === id);
  if (!b) return NUTRITION_BLUEPRINTS[0];
  return b;
}

export function defaultNutritionBlueprintForPackage(
  packageId: ProgramPackageId,
): NutritionBlueprintId {
  return DEFAULT_BY_PACKAGE[packageId] ?? "easy_daily";
}

export function resolveNutritionBlueprintId(
  answers: OnboardingAnswers,
): NutritionBlueprintId {
  const manual = normalizeNutritionBlueprintId(answers.nutritionBlueprintId);
  if (manual) return manual;
  return resolveNutritionBlueprintFromProfile(answers);
}

export function resolveNutritionBlueprint(answers: OnboardingAnswers): NutritionBlueprint {
  return getNutritionBlueprint(resolveNutritionBlueprintId(answers));
}

/**
 * Ruokamoottori: ateriarakenne blueprintin ja tyylin mukaan.
 */
export function mealStructureFromNutritionBlueprint(
  bp: NutritionBlueprint,
): MealStructurePreference {
  if (bp.mealCount >= 4) return "snack_forward";
  if (bp.style === "fatloss") return "lighter_evening";
  return "three_meals";
}

/**
 * Tehokas ateriarakenne: valittu blueprint ohittaa profiilin, jos asetettu.
 */
export function effectiveMealStructureForEngine(
  answers: OnboardingAnswers,
): MealStructurePreference {
  const nb = resolveNutritionBlueprint(answers);
  return mealStructureFromNutritionBlueprint(nb);
}

/** Kevyet kertoimet ruokakohteeseen — kerrotaan paketin kertoimien kanssa */
export function nutritionBlueprintNutritionMultipliers(
  bp: NutritionBlueprint,
): { kcal: number; protein: number } {
  switch (bp.style) {
    case "fatloss":
      return { kcal: 0.98, protein: 1.06 };
    case "performance":
      return { kcal: 1.02, protein: 1.06 };
    case "high_protein":
      return { kcal: 0.99, protein: 1.1 };
    case "easy":
      return { kcal: 1, protein: 1 };
    default:
      return { kcal: 1, protein: 1.02 };
  }
}
