import type { DailyMacros, Goal, Level, OnboardingAnswers } from "@/types/coach";
import { effectiveTrainingLevel } from "@/lib/profileTraining";

/**
 * RAVINTOMOOTTORI — V1 periaatteet (ei lääketieteellinen neuvo)
 *
 * - Proteiini: aktiivisen aikuisen **~1,4–2,2 g/kg/vrk** -luokkaa; app käyttää
 *   tavoite- ja taso -säätöä typillisesti **1,6–2,2 g/kg** (katso `proteinGPerKg`).
 * - Rasva: ei vedetä liian alas — **~0,8–1,0 g/kg** tukemaan hormonit / imeytyminen (`fatGPerKg`).
 * - Hiilihydraatit: **täyttävät lopun energian** tavoitekcalista proteiinin ja rasvan vähimmäisen jälkeen.
 * - Paino puuttuu → `FALLBACK_BODY_WEIGHT_KG` + merkintä haarukasta (`nutritionKcalRangeHint`).
 * - Tavoite-erot: `lose_weight` (korkeampi proteiinisuhteessa), `build_muscle` (yläpää),
 *   `improve_fitness` (keskitaso). Vuoro-/kiireprofiili: kalori- ja joustokerrokset `activityMultiplier` /
 *   `flexibility`, ei erillistä “shift macro split” -laskuria V1:ssä.
 */

/** Kun painoa ei ole — makrot lasketaan tällä painolla; kcal-viitteessä näytetään haarukka. */
export const FALLBACK_BODY_WEIGHT_KG = 78;

export function bodyWeightKgForMacros(answers: OnboardingAnswers): {
  kg: number;
  isFallback: boolean;
} {
  const w = answers.currentWeight ?? answers.targetWeight;
  if (w != null && Number.isFinite(w) && w >= 40 && w <= 200) {
    return { kg: Math.round(w * 10) / 10, isFallback: false };
  }
  return { kg: FALLBACK_BODY_WEIGHT_KG, isFallback: true };
}

/** TDEE-tyyppinen kerroin: treenitaso + viikkorytmi + viimeaikainen treenitaajuus */
function activityMultiplier(answers: OnboardingAnswers): number {
  const tl = effectiveTrainingLevel(answers);
  let m = 1.44;
  if (tl === "beginner") m = 1.34;
  else if (tl === "advanced") m = 1.58;
  const d = answers.daysPerWeek;
  m += (Number(d) - 3) * 0.018;
  const freq = answers.recentTrainingFreq;
  if (freq === "rare") m -= 0.06;
  else if (freq === "daily") m += 0.07;
  else if (freq === "weekly_most") m += 0.035;
  return Math.min(1.72, Math.max(1.28, m));
}

function goalCalorieFactor(goal: Goal): number {
  switch (goal) {
    case "lose_weight":
      return 0.87;
    case "build_muscle":
      return 1.09;
    case "improve_fitness":
      return 1.0;
  }
}

/**
 * Päivän energiaviite — painopohjainen ylläpito × tavoite × joustavuus.
 * Päivän kirjattu lisäliike lisätään erikseen `composeCoachDailyPlan`-tasolla.
 */
export function calorieTargetForUser(answers: OnboardingAnswers): number {
  const { kg } = bodyWeightKgForMacros(answers);
  const maintenance = kg * 31 * activityMultiplier(answers);
  let kcal = maintenance * goalCalorieFactor(answers.goal);
  if (answers.flexibility === "flexible") kcal += 80;
  if (answers.flexibility === "structured") kcal -= 50;
  return Math.round(kcal / 10) * 10;
}

function proteinGPerKg(goal: Goal, level: Level): number {
  let p = 1.85;
  if (goal === "build_muscle") p = 2.05;
  if (goal === "lose_weight") p = 1.95;
  if (goal === "improve_fitness") p = 1.72;
  if (level === "advanced" && goal === "build_muscle") p = Math.min(2.2, p + 0.1);
  if (level === "beginner") p = Math.max(1.6, p - 0.12);
  return Math.min(2.2, Math.max(1.6, p));
}

function fatGPerKg(goal: Goal, level: Level): number {
  let f = 0.9;
  if (goal === "lose_weight") f = 0.85;
  if (goal === "build_muscle") f = 0.95;
  if (goal === "improve_fitness") f = 0.82;
  if (level === "beginner") f = Math.max(0.8, f - 0.06);
  return Math.min(1.0, Math.max(0.8, f));
}

/**
 * Proteiini ja rasva g/kg — hiilarit täyttävät loput kalorit (vähimmäistason jälkeen).
 */
export function macrosFromBodyWeight(
  answers: OnboardingAnswers,
  calories: number,
): DailyMacros {
  const { kg } = bodyWeightKgForMacros(answers);
  const level = effectiveTrainingLevel(answers);
  const proteinG = Math.round(kg * proteinGPerKg(answers.goal, level));
  let fatG = Math.round(kg * fatGPerKg(answers.goal, level));
  let carbCals = calories - proteinG * 4 - fatG * 9;
  if (carbCals < 100) {
    const need = 100 - carbCals;
    const take = Math.min(
      Math.max(0, fatG - Math.round(kg * 0.78)),
      Math.ceil(need / 9),
    );
    if (take > 0) {
      fatG -= take;
      carbCals = calories - proteinG * 4 - fatG * 9;
    }
  }
  let carbsG = Math.max(45, Math.round(Math.max(0, carbCals) / 4));
  const total = proteinG * 4 + carbsG * 4 + fatG * 9;
  if (Math.abs(total - calories) > 20) {
    carbsG = Math.max(
      45,
      Math.round(Math.max(0, calories - proteinG * 4 - fatG * 9) / 4),
    );
  }
  return { proteinG, carbsG, fatG };
}

/** Legacy / testit — keski-paino, sama g/kg-logiikka */
export function macrosForGoal(goal: Goal, calories: number): DailyMacros {
  const synthetic: OnboardingAnswers = {
    goal,
    level: "intermediate",
    daysPerWeek: 3,
    eatingHabits: "okay",
    biggestChallenge: "motivation",
    eventDisruption: "snap_back",
    socialEatingFrequency: "sometimes",
    mealStructure: "three_meals",
    flexibility: "balanced",
    currentWeight: 80,
  };
  return macrosFromBodyWeight(synthetic, calories);
}

export function macrosForUser(answers: OnboardingAnswers): DailyMacros {
  return macrosFromBodyWeight(answers, calorieTargetForUser(answers));
}

/** Kun paino puuttuu — näytä haarukka (ei lääketieteellinen tarkkuus). */
export function nutritionKcalRangeHint(answers: OnboardingAnswers): string | null {
  const { isFallback } = bodyWeightKgForMacros(answers);
  if (!isFallback) return null;
  const mid = calorieTargetForUser(answers);
  const lo = Math.round((mid * 0.88) / 10) * 10;
  const hi = Math.round((mid * 1.12) / 10) * 10;
  return `${lo}–${hi}`;
}
