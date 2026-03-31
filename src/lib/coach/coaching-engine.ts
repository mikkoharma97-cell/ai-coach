/**
 * Adaptive coaching — yksi keskus: data → insights, varoitukset, tuotevihjeet.
 * Ei muuta ohjelmaa automaattisesti; vain ohjaus.
 */
import { buildNutritionEngineSnapshot } from "@/lib/coach/nutritionEngine";
import { normalizeProfileForEngine } from "@/lib/coach/profileNormalizer";
import { estimateConsumedFromKcalLog } from "@/lib/food/dayMacros";
import { loadFoodLog } from "@/lib/foodStorage";
import { loadWorkoutSessions } from "@/lib/workoutLogStorage";
import {
  buildSupplementProductRecommendations,
  buildSupplementRecommendationInput,
} from "@/lib/supplements/recommendationEngine";
import {
  buildExerciseMemory,
  buildUserPerformanceState,
} from "@/lib/coach/performanceAnalysis";
import type { CoachingEngineResult, CoachingInsight } from "@/types/adaptiveCoaching";
import type { OnboardingAnswers } from "@/types/coach";
import type { Locale } from "@/lib/i18n";

export type ExercisePerformanceHint = {
  exerciseId: string;
  lineFi: string;
  lineEn: string;
};

/** Treenisivulle: viimeisin volyymi / trendi per liike */
export function exercisePerformanceHints(
  exerciseIds: string[],
  locale: Locale,
): ExercisePerformanceHint[] {
  const sessions = loadWorkoutSessions();
  const out: ExercisePerformanceHint[] = [];
  for (const eid of exerciseIds) {
    const mem = buildExerciseMemory(eid, sessions);
    if (mem.lastSessions.length === 0) continue;
    const last = mem.lastSessions[0]!;
    const vol = Math.round(last.estimatedVolume);
    const trendFi =
      mem.trend === "progressing"
        ? "nousu"
        : mem.trend === "regressing"
          ? "lasku"
          : mem.trend === "plateau"
            ? "tasainen"
            : "—";
    const trendEn =
      mem.trend === "progressing"
        ? "up"
        : mem.trend === "regressing"
          ? "down"
          : mem.trend === "plateau"
            ? "flat"
            : "—";
    out.push({
      exerciseId: eid,
      lineFi: `Viimeksi volyymi ~${vol} · ${trendFi}`,
      lineEn: `Last volume ~${vol} · ${trendEn}`,
    });
  }
  return out;
}

function id(): string {
  return `ci_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function buildCoachingEngineResult(
  profile: OnboardingAnswers,
  referenceDate: Date,
  locale: Locale,
): CoachingEngineResult {
  const p = normalizeProfileForEngine(profile);
  const sessions = loadWorkoutSessions();
  const performance = buildUserPerformanceState(sessions, p.daysPerWeek ?? 3);

  const insights: CoachingInsight[] = [];
  const warnings: CoachingInsight[] = [];
  const recommendations: CoachingInsight[] = [];
  const productSuggestions: CoachingInsight[] = [];

  const suppInput = buildSupplementRecommendationInput(profile, referenceDate);
  const supplementProducts = buildSupplementProductRecommendations(suppInput);

  if (sessions.length === 0) {
    insights.push({
      id: id(),
      kind: "progression",
      severity: "info",
      titleFi: "Suoritusdata odottaa",
      titleEn: "Performance data pending",
      bodyFi:
        "Kun merkkaat setit treenissä ja palaat Todayhin, rakennamme trendin ja tunnistamme paikat.",
      bodyEn:
        "When you log sets in a workout and return to Today, we build trends and spot stalls.",
    });
  } else {
    if (performance.progressionTrend === "progressing") {
      insights.push({
        id: id(),
        kind: "progression",
        severity: "positive",
        titleFi: "Edistyt",
        titleEn: "You’re progressing",
        bodyFi: "Kuorma tai toistot nousevat — pidä linja, älä kiirehdi joka viikko.",
        bodyEn: "Load or reps are moving up — stay the course; don’t rush every week.",
      });
    } else if (performance.progressionTrend === "plateau") {
      recommendations.push({
        id: id(),
        kind: "adjustment",
        severity: "info",
        titleFi: "Paikallaan",
        titleEn: "You’ve stalled",
        bodyFi:
          "Sama taso muutamassa treenissä — harkitse yhtä progressiota (paino tai toisto) tai kevyttä liikevaihtoa.",
        bodyEn:
          "Same level for a few sessions — consider one progression (weight or reps) or a small exercise swap.",
      });
    } else if (performance.progressionTrend === "regressing") {
      warnings.push({
        id: id(),
        kind: "progression",
        severity: "warning",
        titleFi: "Suoritus laskee",
        titleEn: "Performance is dropping",
        bodyFi:
          "Tarkista uni, kertymä ja proteiini. Jos väsymys jatkuu, kevyt deload-viikko voi olla fiksu.",
        bodyEn:
          "Check sleep, stress, and protein. If it continues, a light deload week may help.",
      });
    }
  }

  if (performance.fatigueLevel === "high") {
    warnings.push({
      id: id(),
      kind: "fatigue",
      severity: "warning",
      titleFi: "Korkea kuormitus-signaali",
      titleEn: "High fatigue signal",
      bodyFi:
        "RPE nousee ja tuotos laskee — vähennä volyymia tai intensiteettiä seuraavalla viikolla.",
      bodyEn:
        "RPE is up while output drops — reduce volume or intensity next week.",
    });
  } else if (performance.fatigueLevel === "moderate") {
    insights.push({
      id: id(),
      kind: "fatigue",
      severity: "info",
      titleFi: "Kohtalainen väsymys",
      titleEn: "Moderate fatigue",
      bodyFi: "Pidä yksi kevyempi viikko mielessä jos sama jatkuu.",
      bodyEn: "Keep a lighter week in mind if this continues.",
    });
  }

  const nut = buildNutritionEngineSnapshot(p);
  const log = loadFoodLog(referenceDate);
  const kcalSum = log.reduce((s, x) => s + x.kcal, 0);
  const consumed = estimateConsumedFromKcalLog(kcalSum, nut.macros);
  const proteinRatio =
    nut.macros.proteinG > 0 ? consumed.protein / nut.macros.proteinG : 1;

  if (nut.macros.proteinG > 0 && proteinRatio < 0.82) {
    warnings.push({
      id: id(),
      kind: "nutrition",
      severity: "warning",
      titleFi: "Proteiini jää lyhyeksi",
      titleEn: "Protein short today",
      bodyFi:
        "Matala proteiini voi rajata hypertrofiaa — lisää yksi proteiinipainotteinen ateria.",
      bodyEn:
        "Low protein may limit hypertrophy — add one protein-forward meal.",
    });
  }

  const plateauIds = Object.entries(performance.exerciseMemory).filter(
    ([, m]) => m.trend === "plateau",
  );
  if (plateauIds.length > 0 && (p.limitations?.length ?? 0) > 0) {
    recommendations.push({
      id: id(),
      kind: "swap",
      severity: "info",
      titleFi: "Vaihtoehto liikkeeseen",
      titleEn: "Exercise swap",
      bodyFi:
        "Paikallaan + rajoite? Kokeile turvallisempaa variaatiota (esim. polvi → kone tai tempo).",
      bodyEn:
        "Stalled with a limitation? Try a safer variation (e.g. knee → machine or tempo).",
    });
  }

  if (insights.length === 0 && sessions.length > 0) {
    insights.push({
      id: id(),
      kind: "progression",
      severity: "info",
      titleFi: "Valmentajan huomio",
      titleEn: "Coach note",
      bodyFi: `Johdonmukaisuusviikko: ${performance.consistencyScore}/100.`,
      bodyEn: `Consistency score: ${performance.consistencyScore}/100.`,
    });
  }

  return {
    insights,
    warnings,
    recommendations,
    productSuggestions,
    supplementProducts,
    performance,
  };
}
