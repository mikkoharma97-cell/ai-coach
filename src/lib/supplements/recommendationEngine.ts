/**
 * Tarveperusteiset lisäravinnesuositukset — prioriteetti: puute → kuorma → tavoite → käyttö.
 */
import { buildNutritionEngineSnapshot } from "@/lib/coach/nutritionEngine";
import { normalizeProfileForEngine } from "@/lib/coach/profileNormalizer";
import { buildUserPerformanceState } from "@/lib/coach/performanceAnalysis";
import { estimateConsumedFromKcalLog } from "@/lib/food/dayMacros";
import { loadFoodLog } from "@/lib/foodStorage";
import { loadSupplementPreferences } from "@/lib/supplementPreferencesStorage";
import { loadWorkoutSessions } from "@/lib/workoutLogStorage";
import type {
  ProgressionTrend,
  SupplementProductRecommendation,
  SupplementRecommendationFrame,
} from "@/types/adaptiveCoaching";
import type { Goal, OnboardingAnswers } from "@/types/coach";

export type SupplementRecommendationInput = {
  goal: Goal;
  /** kulutettu / tavoite, 1 = täynnä */
  proteinRatio: number;
  kcalRatio: number;
  fatigueLevel: "low" | "moderate" | "high";
  progressionTrend: ProgressionTrend;
  usesCreatine: boolean;
  usesProteinPowder: boolean;
};

function sprId(): string {
  return `spr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function dedupeByProduct(
  list: SupplementProductRecommendation[],
): SupplementProductRecommendation[] {
  const seen = new Map<string, SupplementProductRecommendation>();
  for (const item of list) {
    const prev = seen.get(item.productId);
    if (!prev || item.priority > prev.priority) {
      seen.set(item.productId, item);
    }
  }
  return [...seen.values()].sort((a, b) => b.priority - a.priority);
}

/**
 * Rakentaa syötteen profiilista ja tämän päivän lokista (sama logiikka kuin coaching-engine).
 */
export function buildSupplementRecommendationInput(
  profile: OnboardingAnswers,
  referenceDate: Date,
): SupplementRecommendationInput {
  const p = normalizeProfileForEngine(profile);
  const sessions = loadWorkoutSessions();
  const performance = buildUserPerformanceState(sessions, p.daysPerWeek ?? 3);
  const nut = buildNutritionEngineSnapshot(profile);
  const log = loadFoodLog(referenceDate);
  const kcalSum = log.reduce((s, x) => s + x.kcal, 0);
  const consumed = estimateConsumedFromKcalLog(kcalSum, nut.macros);
  const proteinRatio =
    nut.macros.proteinG > 0 ? consumed.protein / nut.macros.proteinG : 1;
  const kcalRatio = nut.targetKcal > 0 ? kcalSum / nut.targetKcal : 1;
  const prefs = loadSupplementPreferences();
  return {
    goal: p.goal,
    proteinRatio,
    kcalRatio,
    fatigueLevel: performance.fatigueLevel,
    progressionTrend: performance.progressionTrend,
    usesCreatine: prefs.usesCreatine,
    usesProteinPowder: prefs.usesProteinPowder,
  };
}

const STRENGTH_GOALS: Goal[] = ["build_muscle", "improve_fitness"];

/**
 * Prioriteetti: korkeampi = tärkeämpi näyttää ensin.
 * Kehykset: tarve (recommended) → valmentajan linja (coach) → dataan sidottu (progress).
 */
export function buildSupplementProductRecommendations(
  input: SupplementRecommendationInput,
  maxItems = 3,
): SupplementProductRecommendation[] {
  const {
    goal,
    proteinRatio,
    kcalRatio,
    fatigueLevel,
    progressionTrend,
    usesCreatine,
    usesProteinPowder,
  } = input;

  const out: SupplementProductRecommendation[] = [];

  if (!usesProteinPowder && proteinRatio < 0.82) {
    out.push({
      id: sprId(),
      productId: "ptv_whey_isolate",
      frame: "recommended_for_you",
      priority:
        100 +
        (goal === "build_muscle" ? 5 : 0) +
        (kcalRatio < 0.75 ? 3 : 0),
      reasonFi:
        "Proteiinisi jää alle päivätavoitteen — käytännöllinen tapa tasoittaa väli ilman ylimääräistä rasvaa.",
      reasonEn:
        "Your protein is below today’s target — a practical way to close the gap without extra fuss.",
    });
  }

  if (fatigueLevel === "high") {
    out.push({
      id: sprId(),
      productId: "ptv_recharge",
      frame: "coach_suggestion",
      priority: 93,
      reasonFi:
        "Kuormitus näkyy suorituksessa — neste ja magnesium tukevat palautumista; uni ja lepo ensin.",
      reasonEn:
        "Load shows in your output — fluids and magnesium support recovery; sleep comes first.",
    });
  }

  if (STRENGTH_GOALS.includes(goal) && !usesCreatine) {
    const progressBoost =
      progressionTrend === "progressing"
        ? 14
        : progressionTrend === "plateau"
          ? 10
          : progressionTrend === "regressing"
            ? 4
            : 6;
    const frame: SupplementRecommendationFrame =
      progressionTrend === "progressing" || progressionTrend === "plateau"
        ? "based_on_progress"
        : "coach_suggestion";
    out.push({
      id: sprId(),
      productId: "ptv_creatine_mono",
      frame,
      priority: 72 + progressBoost,
      reasonFi:
        progressionTrend === "progressing"
          ? "Edistyt — kreatiini tukee toistuvaa voimatyötä; ei pakollinen, mutta näyttö vahva."
          : "Tavoitteesi sopii kreatiinille — se tukee toistuvaa voima- ja tehotyötä.",
      reasonEn:
        progressionTrend === "progressing"
          ? "You’re moving forward — creatine supports repeated strength work; optional but evidence-backed."
          : "Your goal fits creatine — it supports repeated strength and power work.",
    });
  }

  if (fatigueLevel === "moderate" && proteinRatio >= 0.88) {
    out.push({
      id: sprId(),
      productId: "ptv_daily_basis",
      frame: "coach_suggestion",
      priority: 36,
      reasonFi:
        "Kevyt kertymä ja tasainen proteiini — monivitamiini voi tukea peruspeittoa kiireviikkoina.",
      reasonEn:
        "Mild fatigue with decent protein — a multivitamin can back baseline cover on hectic weeks.",
    });
  }

  return dedupeByProduct(out).slice(0, maxItems);
}
