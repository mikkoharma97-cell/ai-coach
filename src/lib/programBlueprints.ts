/**
 * Valmiit treenirungot — appin oma data, rakenteellinen taso (ei ulkoisten ohjelmien kopiointia).
 */
import { resolveProgramBlueprintFromProfile } from "@/lib/profileProgramResolver";
import type {
  OnboardingAnswers,
  ProgramBlueprintId,
  ProgramPackageId,
} from "@/types/coach";
import type { ExerciseCategory } from "@/types/exercise";

export type ProgramBlueprint = {
  id: ProgramBlueprintId;
  nameFi: string;
  nameEn: string;
  summaryFi: string;
  summaryEn: string;
  /** Lyhyt “kenelle” -kuvaus korteille */
  audienceFi: string;
  audienceEn: string;
  /** Yksi vahva hyötylause (kortti) */
  benefitLineFi: string;
  benefitLineEn: string;
  /** Viikkonäkymän treenirivi (lyhyt), kun blueprint on käytössä */
  planWorkoutLineFi: string;
  planWorkoutLineEn: string;
  /** Viikkonäkymän ruokaohjeen rivi */
  planFoodLineFi: string;
  planFoodLineEn: string;
  splitType:
    | "full_body"
    | "upper_lower"
    | "push_pull_legs"
    | "bodypart"
    | "flex";
  trainingDays: number;
  focus: "strength" | "hypertrophy" | "fatloss" | "performance" | "return";
  level: "beginner" | "intermediate" | "advanced";
  defaultWeek: {
    day: number;
    focus: string;
    categories: ExerciseCategory[];
  }[];
  progressionStyle: "linear" | "double_progression" | "adaptive";
};

const IDS = new Set<string>([
  "steady_begin",
  "base_strength",
  "hypertrophy_4",
  "hypertrophy_5",
  "fat_loss_light",
  "tight_block",
  "shift_flex",
  "pro_training",
]);

export const PROGRAM_BLUEPRINTS: ProgramBlueprint[] = [
  {
    id: "steady_begin",
    nameFi: "Vakaa alku",
    nameEn: "Steady start",
    summaryFi:
      "Koko kehon perusrunko harjoittelun alkuun tai paluuseen — selkeä kolmen päivän rytmi.",
    summaryEn:
      "A simple full-body frame for starting out or returning — a clear three-day rhythm.",
    audienceFi: "Aloittelija tai paluu treeniin",
    audienceEn: "Beginner or returning to training",
    benefitLineFi:
      "Rakennettu sinulle, joka haluat selkeän viikon ilman tyhjää pöytää.",
    benefitLineEn:
      "Built for you if you want a clear week without a blank slate.",
    planWorkoutLineFi: "Koko keho — perusliikkeet, lyhyt sessio",
    planWorkoutLineEn: "Full body — basics, short session",
    planFoodLineFi: "Kolme ateriaa — sama rytmi, yksi kasvislisä tänään.",
    planFoodLineEn: "Three meals — same rhythm, add vegetables once today.",
    splitType: "full_body",
    trainingDays: 3,
    focus: "return",
    level: "beginner",
    defaultWeek: [
      { day: 1, focus: "Työntö + jalka", categories: ["push", "legs", "core"] },
      { day: 2, focus: "Veto + keskivartalo", categories: ["pull", "legs", "core"] },
      { day: 3, focus: "Koko keho tasapainoon", categories: ["push", "pull", "legs"] },
    ],
    progressionStyle: "adaptive",
  },
  {
    id: "base_strength",
    nameFi: "Perusvoima",
    nameEn: "Base strength",
    summaryFi:
      "Pääliikkeisiin ankkuroitu viikko — progressio etenee hallitusti.",
    summaryEn:
      "A week anchored on main lifts — progression moves forward in a controlled way.",
    audienceFi: "Keskitaso tai kokeneempi nostaja",
    audienceEn: "Intermediate or advanced lifter",
    benefitLineFi:
      "Tämä tukee voimaa ilman että viikko muuttuu arvaamattomaksi.",
    benefitLineEn:
      "This supports strength without making the week unpredictable.",
    planWorkoutLineFi: "Pääliikkeet — sarjat ja rytmi seuraavat ohjelmaa",
    planWorkoutLineEn: "Main lifts — sets and rhythm follow the plan",
    planFoodLineFi: "Neljä ateriaa — proteiini jakautuu tasaisesti.",
    planFoodLineEn: "Four meals — protein spread evenly.",
    splitType: "upper_lower",
    trainingDays: 4,
    focus: "strength",
    level: "intermediate",
    defaultWeek: [
      { day: 1, focus: "Ylä: työntö-painotus", categories: ["push", "pull", "core"] },
      { day: 2, focus: "Ala: etu-taka", categories: ["legs", "legs", "core"] },
      { day: 3, focus: "Ylä: veto-painotus", categories: ["pull", "push"] },
      { day: 4, focus: "Ala: tukiliikkeet", categories: ["legs", "legs"] },
    ],
    progressionStyle: "linear",
  },
  {
    id: "hypertrophy_4",
    nameFi: "Lihaskasvu (4 pv)",
    nameEn: "Hypertrophy (4 d)",
    summaryFi:
      "Neljän päivän volyymi — ylä/ala tai työntö/veto -painotus ilman ylimääräistä säätöä.",
    summaryEn:
      "Four-day volume — upper/lower or push/pull bias without extra noise.",
    audienceFi: "Keskitaso, kasvutavoite",
    audienceEn: "Intermediate, muscle gain",
    benefitLineFi:
      "Tämä tukee lihaskasvua ilman jatkuvaa säätöä.",
    benefitLineEn:
      "This supports muscle growth without constant tweaking.",
    planWorkoutLineFi: "Hypertrofia — keskittynyt päiväkohtainen painotus",
    planWorkoutLineEn: "Hypertrophy — focused day-to-day emphasis",
    planFoodLineFi: "Neljä ateriaa — lämpimät pääateriat tukevat treeniä.",
    planFoodLineEn: "Four meals — warm mains support training.",
    splitType: "upper_lower",
    trainingDays: 4,
    focus: "hypertrophy",
    level: "intermediate",
    defaultWeek: [
      { day: 1, focus: "Ylä A", categories: ["push", "pull", "core"] },
      { day: 2, focus: "Ala A", categories: ["legs", "legs"] },
      { day: 3, focus: "Ylä B", categories: ["pull", "push", "core"] },
      { day: 4, focus: "Ala B", categories: ["legs", "legs", "core"] },
    ],
    progressionStyle: "double_progression",
  },
  {
    id: "hypertrophy_5",
    nameFi: "Lihaskasvu (5 pv)",
    nameEn: "Hypertrophy (5 d)",
    summaryFi:
      "Viiden päivän kuorma — enemmän tilaa volyymille ja eristäville täsmäliikkeille.",
    summaryEn:
      "Five-day load — more room for volume and targeted accessory work.",
    audienceFi: "Kokenut, korkea sieto",
    audienceEn: "Advanced, high recovery capacity",
    benefitLineFi:
      "Kun haluat enemmän viikkoon ilman että rakenne katoaa.",
    benefitLineEn:
      "When you want more in the week without losing structure.",
    planWorkoutLineFi: "Viisi sessiota — volyymi ja vaihtelu jakautuvat",
    planWorkoutLineEn: "Five sessions — volume and variety distributed",
    planFoodLineFi: "Viisi ateriaa — energia seuraa kuormaa.",
    planFoodLineEn: "Five meals — energy follows load.",
    splitType: "push_pull_legs",
    trainingDays: 5,
    focus: "hypertrophy",
    level: "advanced",
    defaultWeek: [
      { day: 1, focus: "Työntävät", categories: ["push", "push", "core"] },
      { day: 2, focus: "Vetävät", categories: ["pull", "pull"] },
      { day: 3, focus: "Jalat", categories: ["legs", "legs"] },
      { day: 4, focus: "Ylä kevyt", categories: ["push", "pull"] },
      { day: 5, focus: "Jalka täsmä", categories: ["legs", "core"] },
    ],
    progressionStyle: "linear",
  },
  {
    id: "fat_loss_light",
    nameFi: "Kevyt rasvanpoltto",
    nameEn: "Light fat loss",
    summaryFi:
      "Muutama kova päivä viikossa — kevyt aerobinen ja palautuminen mukana.",
    summaryEn:
      "A few hard days per week — light cardio and recovery included.",
    audienceFi: "Painonhallinta, maltillinen alijäämä",
    audienceEn: "Weight control, modest deficit",
    benefitLineFi:
      "Kuorma ja keveys pysyvät samassa tarinassa koko viikon.",
    benefitLineEn:
      "Load and lightness stay in the same story all week.",
    planWorkoutLineFi: "Koko keho + kevyt syke — kohtuullinen volyymi",
    planWorkoutLineEn: "Full body + easy cardio — moderate volume",
    planFoodLineFi: "Proteiini edellä — ilta pidetään kevyempänä.",
    planFoodLineEn: "Protein first — keep dinner lighter.",
    splitType: "full_body",
    trainingDays: 4,
    focus: "fatloss",
    level: "intermediate",
    defaultWeek: [
      { day: 1, focus: "Koko keho voimaa", categories: ["push", "legs", "core"] },
      { day: 2, focus: "Koko keho veto", categories: ["pull", "legs", "conditioning"] },
      { day: 3, focus: "Keskivartalo + jalka", categories: ["legs", "core", "conditioning"] },
      { day: 4, focus: "Ylä + kevyt finisher", categories: ["push", "pull", "core"] },
    ],
    progressionStyle: "adaptive",
  },
  {
    id: "tight_block",
    nameFi: "Tiukka blokki",
    nameEn: "Tight block",
    summaryFi:
      "Tavoitteellinen jakso — kuormitettu mutta hallittu; päivät on nimetty selvästi.",
    summaryEn:
      "A goal-driven block — heavy but controlled; days are clearly named.",
    audienceFi: "Kokeneelle, lyhyeen kovaan jaksoon",
    audienceEn: "Experienced, short hard block",
    benefitLineFi:
      "Treeni ja palautuminen näkyvät samalla viivalla.",
    benefitLineEn:
      "Training and recovery sit on the same line.",
    planWorkoutLineFi: "Päätreeni + palautumisen tuki",
    planWorkoutLineEn: "Main session + recovery support",
    planFoodLineFi: "Viisi ateriaa — treenin ympärille rakennettu rytmi.",
    planFoodLineEn: "Five meals — rhythm built around training.",
    splitType: "bodypart",
    trainingDays: 5,
    focus: "performance",
    level: "advanced",
    defaultWeek: [
      { day: 1, focus: "Raskas ala", categories: ["legs", "legs", "core"] },
      { day: 2, focus: "Raskas ylä", categories: ["push", "pull"] },
      { day: 3, focus: "Keskivartalo + tuki", categories: ["core", "legs", "conditioning"] },
      { day: 4, focus: "Volyymi ylä", categories: ["push", "pull", "core"] },
      { day: 5, focus: "Jalat + tekniikka", categories: ["legs", "legs"] },
    ],
    progressionStyle: "linear",
  },
  {
    id: "shift_flex",
    nameFi: "Vuororytmi",
    nameEn: "Shift rhythm",
    summaryFi:
      "Epäsäännölliseen arkeen — joustava viikkorunko, jossa treenipäivät löytyvät kun ehdit.",
    summaryEn:
      "For irregular weeks — a flexible frame where you place sessions when you can.",
    audienceFi: "Vuorotyö tai vaihtelevat vuorokaudet",
    audienceEn: "Shift work or changing schedules",
    benefitLineFi:
      "Viikko pysyy kasassa vaikka kello ei pysyisi samassa.",
    benefitLineEn:
      "The week stays together even when the clock doesn’t.",
    planWorkoutLineFi: "Tänän mahdollinen sessio — täytä kun ehdit",
    planWorkoutLineEn: "Session when possible — slot it when you can",
    planFoodLineFi: "Ateriat heräämisen ympärille — ei kellonaikapakkoa.",
    planFoodLineEn: "Meals around wake time — no fixed clock pressure.",
    splitType: "flex",
    trainingDays: 3,
    focus: "performance",
    level: "intermediate",
    defaultWeek: [
      { day: 1, focus: "Koko keho A", categories: ["push", "pull", "legs"] },
      { day: 2, focus: "Koko keho B", categories: ["legs", "push", "core"] },
      { day: 3, focus: "Koko keho C", categories: ["pull", "legs", "conditioning"] },
    ],
    progressionStyle: "adaptive",
  },
  {
    id: "pro_training",
    nameFi: "Pro-runko",
    nameEn: "Pro framework",
    summaryFi:
      "Oma viikkorunko ja ohjauksen tuki — enemmän variaatiota ja viikkokohtaista hienosäätöä.",
    summaryEn:
      "Your weekly frame plus guided support — more variation and weekly fine-tuning.",
    audienceFi: "Pro-tila / kokenut käyttäjä",
    audienceEn: "Pro mode / advanced user",
    benefitLineFi:
      "Runko pysyy sinun — ohjaus täyttää ja korjaa yksityiskohdat.",
    benefitLineEn:
      "The frame stays yours — guidance fills and adjusts details.",
    planWorkoutLineFi: "Pro-sessio — laajennettu valinta ja vaihto",
    planWorkoutLineEn: "Pro session — expanded choice and swaps",
    planFoodLineFi: "Makrot ja ateriat — mukautuvat päivän päätöksiin.",
    planFoodLineEn: "Macros and meals — adapt to the day’s choices.",
    splitType: "flex",
    trainingDays: 4,
    focus: "performance",
    level: "advanced",
    defaultWeek: [
      { day: 1, focus: "Painotettu ylä", categories: ["push", "pull", "core", "legs"] },
      { day: 2, focus: "Painotettu ala", categories: ["legs", "legs", "core"] },
      { day: 3, focus: "Vaihtelu", categories: ["pull", "push", "conditioning"] },
      { day: 4, focus: "Täsmä + heikkous", categories: ["push", "legs", "core"] },
    ],
    progressionStyle: "double_progression",
  },
];

const DEFAULT_BY_PACKAGE: Record<ProgramPackageId, ProgramBlueprintId> = {
  steady_start: "steady_begin",
  muscle_rhythm: "hypertrophy_4",
  light_cut: "fat_loss_light",
  performance_block: "tight_block",
};

export function normalizeProgramBlueprintId(
  id: string | null | undefined,
): ProgramBlueprintId | undefined {
  if (!id) return undefined;
  return IDS.has(id) ? (id as ProgramBlueprintId) : undefined;
}

export function getProgramBlueprint(id: ProgramBlueprintId): ProgramBlueprint {
  const b = PROGRAM_BLUEPRINTS.find((x) => x.id === id);
  if (!b) return PROGRAM_BLUEPRINTS[0];
  return b;
}

export function defaultProgramBlueprintForPackage(
  packageId: ProgramPackageId,
): ProgramBlueprintId {
  return DEFAULT_BY_PACKAGE[packageId] ?? "steady_begin";
}

/**
 * Paketti + valinnainen id + Pro-tila: moottorin käyttämä blueprint.
 */
export function resolveProgramBlueprintId(
  answers: OnboardingAnswers,
): ProgramBlueprintId {
  const manual = normalizeProgramBlueprintId(answers.programBlueprintId);
  if (manual) return manual;
  return resolveProgramBlueprintFromProfile(answers);
}

export function resolveProgramBlueprint(answers: OnboardingAnswers): ProgramBlueprint {
  return getProgramBlueprint(resolveProgramBlueprintId(answers));
}

/** Ma=0 … Su=6 — treenipäivät blueprintin mukaan */
export function trainingWeekdayIndices(bp: ProgramBlueprint): Set<number> {
  const n = Math.min(6, Math.max(1, bp.trainingDays));
  switch (n) {
    case 1:
      return new Set([2]);
    case 2:
      return new Set([0, 4]);
    case 3:
      return new Set([0, 2, 5]);
    case 4:
      return new Set([1, 3, 5, 6]);
    case 5:
      return new Set([0, 1, 3, 4, 5]);
    case 6:
      return new Set([0, 1, 2, 3, 4, 5]);
    default:
      return new Set([0, 2, 5]);
  }
}

export function trainingDaySlotIndex(
  dayIndexMon0: number,
  bp: ProgramBlueprint,
): number {
  const sorted = [...trainingWeekdayIndices(bp)].sort((a, b) => a - b);
  const pos = sorted.indexOf(dayIndexMon0);
  if (pos < 0) return 0;
  const week = bp.defaultWeek;
  if (week.length === 0) return 0;
  return pos % week.length;
}
