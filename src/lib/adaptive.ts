/**
 * Core adaptive logic — pure inputs (AdaptiveUserState) for tests and composition.
 */
import type {
  AdaptiveUserState,
  CoachDailyPlan,
  CoachPlan,
  OnboardingAnswers,
  TodayWithAdjustments,
} from "@/types/coach";
import { calendarDayKey } from "@/lib/dateKeys";
import type { Locale, MessageKey } from "@/lib/i18n";
import { dateLocaleForUi, translate } from "@/lib/i18n";
import { calorieTargetForUser, macrosFromBodyWeight } from "@/lib/nutrition";
import { generatePersonalizedPlan, getMondayBasedIndex } from "@/lib/plan";
import { loadPlannedEvents } from "@/lib/eventsStorage";
import {
  isDayMarkedDone,
  loadOutcomeHint,
} from "@/lib/storage";
import {
  nutritionBlueprintNutritionMultipliers,
  resolveNutritionBlueprint,
} from "@/lib/nutritionBlueprints";
import { totalActivityEnergyBonusKcal } from "@/lib/activityEnergy";
import { loadDailyActivitiesForDate } from "@/lib/activityStorage";
import {
  normalizeProgramPackageId,
  packageActivityStepDelta,
  packageNutritionMultipliers,
} from "@/lib/programPackages";
import { effectiveTrainingLevel } from "@/lib/profileTraining";
import type { RebalancePlan } from "@/types/rebalance";
import { applyRebalanceToFoodTargets } from "@/lib/nutrition/rebalance";
import {
  getProgramTrackMeta,
  normalizeProgramTrackId,
  resolveProgramTrackId,
  trackActivityStepDelta,
  trackKcalMultiplier,
} from "@/lib/programTracks";

/** Backwards-compatible name for calendar keys. */
export function dayKey(d: Date): string {
  return calendarDayKey(d);
}

function yesterday(ref: Date): Date {
  const d = new Date(ref);
  d.setDate(d.getDate() - 1);
  return d;
}

export function findRecentDayRecord(
  recentDays: import("@/types/coach").RecentDayRecord[],
  key: string,
): import("@/types/coach").RecentDayRecord | undefined {
  return recentDays.find((r) => r.dateKey === key);
}

export function getYesterdayRecord(
  userState: AdaptiveUserState,
): import("@/types/coach").RecentDayRecord | undefined {
  return findRecentDayRecord(userState.recentDays, dayKey(yesterday(userState.referenceDate)));
}

/** For Balance UI — same signals as adjustment priority logic. */
export function computeYesterdayAdjustmentSignals(
  userState: AdaptiveUserState,
  plan: CoachPlan,
): {
  yesterdayDone: boolean;
  missedTrainingDay: boolean;
  missedWorkoutLogged: boolean;
  calorieDrift: boolean;
  activityShortfall: boolean;
} {
  const yRec = getYesterdayRecord(userState);
  const yDone = Boolean(yRec?.markedDone);
  const yIdx = getMondayBasedIndex(yesterday(userState.referenceDate));
  const yEntry = plan.weeklyPlan.days[yIdx];
  const engaged = engagedFromRecent(userState.recentDays);
  const missedTrainingDay = Boolean(
    engaged && yEntry && !yEntry.isRest && !yDone,
  );
  const missedWorkoutLogged = Boolean(yRec?.skippedWorkout && yDone);

  return {
    yesterdayDone: yDone,
    missedTrainingDay,
    missedWorkoutLogged,
    calorieDrift: Boolean(yRec?.caloriesOver),
    activityShortfall: Boolean(yRec?.activityUnder && yDone),
  };
}

function engagedFromRecent(
  recentDays: import("@/types/coach").RecentDayRecord[],
): boolean {
  return recentDays.some((r) => r.markedDone);
}

function streakEndingYesterday(
  referenceDate: Date,
  recentDays: import("@/types/coach").RecentDayRecord[],
): number {
  let n = 0;
  for (let i = 1; i <= 30; i++) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const rec = findRecentDayRecord(recentDays, dayKey(d));
    if (rec?.markedDone) n++;
    else break;
  }
  return n;
}

function parseSteps(s: string): number | null {
  const m = s.replace(/,/g, "").replace(/\s/g, " ").match(/(\d[\d\s]*\d|\d+)/);
  if (!m) return null;
  const digits = m[1].replace(/\s/g, "");
  return parseInt(digits, 10);
}

function formatSteps(n: number, locale: Locale): string {
  const loc = dateLocaleForUi(locale);
  return `${n.toLocaleString(loc)} ${translate(locale, "daily.stepsUnit")}`;
}

function adjustActivityByDelta(
  activity: string,
  delta: number,
  locale: Locale,
): string {
  const base = parseSteps(activity);
  if (base == null) return activity;
  return formatSteps(Math.max(4_000, Math.round(base + delta)), locale);
}

function goalLabelKey(goal: OnboardingAnswers["goal"]): MessageKey {
  const m: Record<OnboardingAnswers["goal"], MessageKey> = {
    lose_weight: "food.goalLose",
    build_muscle: "food.goalMuscle",
    improve_fitness: "food.goalFitness",
  };
  return m[goal];
}

function flexLabelKey(
  f: OnboardingAnswers["flexibility"],
): MessageKey {
  const m: Record<OnboardingAnswers["flexibility"], MessageKey> = {
    structured: "dashboard.flexStructured",
    balanced: "dashboard.flexBalanced",
    flexible: "dashboard.flexFlexible",
  };
  return m[f];
}

export function toOnboardingAnswers(s: AdaptiveUserState): OnboardingAnswers {
  const e = s.profileExtras;
  return {
    goal: s.goal,
    level: s.level,
    daysPerWeek: s.daysPerWeek,
    eatingHabits: s.eatingHabits,
    flexibility: s.flexibilityPreference,
    biggestChallenge: e?.biggestChallenge ?? "motivation",
    eventDisruption: e?.eventDisruption ?? "snap_back",
    socialEatingFrequency: e?.socialEatingFrequency ?? "sometimes",
    mealStructure: e?.mealStructure ?? "three_meals",
    foodPreferences: e?.foodPreferences ?? [],
    foodDislikes: e?.foodDislikes ?? [],
    selectedPackageId: normalizeProgramPackageId(e?.selectedPackageId),
    programBlueprintId: e?.programBlueprintId,
    nutritionBlueprintId: e?.nutritionBlueprintId,
    mode: e?.mode,
    trainingLevel: e?.trainingLevel,
    programTrackId: normalizeProgramTrackId(e?.programTrackId),
    targetWeight: e?.targetWeight,
    targetDate: e?.targetDate,
    targetReason: e?.targetReason,
    currentWeight: e?.currentWeight,
  };
}

function eventProofKey(
  d: OnboardingAnswers["eventDisruption"],
): MessageKey {
  const m: Record<OnboardingAnswers["eventDisruption"], MessageKey> = {
    snap_back: "today.proof.eventSnap",
    reset: "today.proof.eventReset",
    loose: "today.proof.eventLoose",
  };
  return m[d];
}

function buildPersonalizationProof(
  s: AdaptiveUserState,
  systemLine: string | null,
  locale: Locale,
): string[] {
  const answers = toOnboardingAnswers(s);
  const proof: string[] = [
    translate(locale, "today.proof.goalFocus", {
      goal: translate(locale, goalLabelKey(answers.goal)),
      flex: translate(locale, flexLabelKey(answers.flexibility)),
    }),
    translate(locale, "today.proof.synced"),
    translate(locale, eventProofKey(answers.eventDisruption)),
  ];
  if (systemLine) {
    proof.push(translate(locale, "today.proof.autoAdjusted"));
  }
  proof.push(
    translate(locale, "today.proof.trainingSchedule", {
      n: s.daysPerWeek,
    }),
  );
  const tid = resolveProgramTrackId(answers);
  const tm = getProgramTrackMeta(tid);
  const trackName = locale === "en" ? tm.nameEn : tm.nameFi;
  proof.push(
    translate(locale, "today.proof.programTrack", { name: trackName }),
  );
  const refKey = dayKey(s.referenceDate);
  const upcoming = s.upcomingEvents.find(
    (e) => e.dateKey >= refKey && e.kind === "flexible_intake",
  );
  if (upcoming) {
    proof.push(translate(locale, "today.proof.flexCalendar"));
  }
  return proof.slice(0, 7);
}

function isMissedAdjustment(
  note: string | null,
  locale: Locale,
): boolean {
  if (!note) return false;
  return (
    note.includes(translate(locale, "daily.sys.missed")) ||
    note.includes("Adjusted after missed")
  );
}

/**
 * Food energy + macro split from profile and recent load signals.
 */
export function generateFoodTargets(
  userState: AdaptiveUserState,
  adjustmentNote: string | null,
  locale: Locale,
  rebalancePlan: RebalancePlan | null,
): { todayCalories: number; todayMacros: import("@/types/coach").DailyMacros } {
  const answers = toOnboardingAnswers(userState);
  let calories = calorieTargetForUser(answers);
  if (isMissedAdjustment(adjustmentNote, locale)) {
    calories = Math.round((calories * 0.96) / 10) * 10;
  }
  const { kcal: pk, protein: pp } = packageNutritionMultipliers(
    answers.selectedPackageId,
  );
  const nb = nutritionBlueprintNutritionMultipliers(
    resolveNutritionBlueprint(answers),
  );
  const tk = trackKcalMultiplier(resolveProgramTrackId(answers));
  calories = Math.round((calories * pk * tk * nb.kcal) / 10) * 10;
  const baseMacros = macrosFromBodyWeight(answers, calories);
  let todayMacros = {
    ...baseMacros,
    proteinG: Math.round(baseMacros.proteinG * pp * nb.protein),
  };
  let outCalories = calories;
  if (rebalancePlan) {
    const adj = applyRebalanceToFoodTargets(
      outCalories,
      todayMacros,
      rebalancePlan.dailyAdjustmentCalories,
    );
    outCalories = adj.calories;
    todayMacros = adj.macros;
  }
  return {
    todayCalories: outCalories,
    todayMacros,
  };
}

function activityEnergyBonusKcalForReferenceDate(ref: Date): number {
  if (typeof window === "undefined") return 0;
  const k = dayKey(ref);
  return totalActivityEnergyBonusKcal(loadDailyActivitiesForDate(k));
}

/**
 * Workout / food task / activity strings + adjustment line from recentDays + base week.
 */
export function generateDailyAdjustments(
  userState: AdaptiveUserState,
  base: CoachPlan,
  locale: Locale,
): TodayWithAdjustments {
  let workout = base.todayWorkout;
  let food = base.todayFoodTask;
  let activity = base.todayActivityTask;
  const answersForPkg = toOnboardingAnswers(userState);
  const pkgSteps = packageActivityStepDelta(answersForPkg.selectedPackageId);
  const trSteps = trackActivityStepDelta(
    resolveProgramTrackId(answersForPkg),
  );
  const stepDelta = pkgSteps + trSteps;
  if (stepDelta !== 0) {
    activity = adjustActivityByDelta(activity, stepDelta, locale);
  }

  const ref = userState.referenceDate;
  const todayIdx = getMondayBasedIndex(ref);
  const todayEntry = base.weeklyPlan.days[todayIdx];
  const todayIsRest = Boolean(todayEntry?.isRest);

  const y = yesterday(ref);
  const yKey = dayKey(y);
  const yRec = findRecentDayRecord(userState.recentDays, yKey);
  const yDone = Boolean(yRec?.markedDone);
  const yIdx = getMondayBasedIndex(y);
  const yEntry = base.weeklyPlan.days[yIdx];
  const hint = yRec
    ? {
        caloriesOver: yRec.caloriesOver,
        skippedWorkout: yRec.skippedWorkout,
        activityUnder: yRec.activityUnder,
      }
    : undefined;
  const engaged = engagedFromRecent(userState.recentDays);

  const missedTraining = Boolean(
    engaged && yEntry && !yEntry.isRest && !yDone,
  );

  let systemLine: string | null = null;

  if (missedTraining) {
    systemLine = translate(locale, "daily.sys.missed");
    workout =
      userState.level === "advanced"
        ? translate(locale, "daily.work.makeupAdvanced")
        : translate(locale, "daily.work.makeupLower");
    if (userState.goal === "lose_weight") {
      food = translate(locale, "daily.food.missedLose");
    } else {
      food = translate(locale, "daily.food.missedElse");
    }
    activity = adjustActivityByDelta(activity, -800, locale);
  } else if (hint?.caloriesOver) {
    systemLine = translate(locale, "daily.sys.balancedPrev");
    if (userState.goal === "lose_weight") {
      food = translate(locale, "daily.food.overLose");
    }
    workout = todayIsRest
      ? workout
      : translate(locale, "daily.work.finisher", {
          base: workout.split("—")[0]?.trim() ?? workout,
        });
    activity = adjustActivityByDelta(activity, 400, locale);
  } else if (hint?.skippedWorkout && yDone) {
    systemLine = translate(locale, "daily.sys.missed");
    workout = translate(locale, "daily.work.skipSpread");
    activity = adjustActivityByDelta(activity, -500, locale);
  } else if (hint?.activityUnder && yDone) {
    systemLine = translate(locale, "daily.sys.adjustedYesterday");
    activity = adjustActivityByDelta(activity, 1_200, locale);
  } else if (getMondayBasedIndex(ref) === 0 && yDone) {
    systemLine = translate(locale, "daily.sys.weekAhead");
    activity = adjustActivityByDelta(activity, 200, locale);
  } else if (streakEndingYesterday(ref, userState.recentDays) >= 3 && yDone) {
    systemLine = translate(locale, "daily.sys.streak");
    activity = adjustActivityByDelta(activity, 300, locale);
    if (!todayIsRest) {
      workout = translate(locale, "daily.work.streakExtra", { base: workout });
    }
  } else if (yDone) {
    const pool: MessageKey[] = ["daily.sys.poolA", "daily.sys.poolB"];
    const pick = pool[(ref.getDate() + ref.getMonth()) % pool.length];
    systemLine = translate(locale, pick);
    activity = adjustActivityByDelta(activity, 150, locale);
  } else if (engaged && !yDone && yEntry?.isRest) {
    systemLine = translate(locale, "daily.sys.adjustedYesterday");
    activity = adjustActivityByDelta(activity, -400, locale);
  }

  return {
    todayWorkout: workout,
    todayFoodTask: food,
    todayActivityTask: activity,
    systemLine,
  };
}

/**
 * Täysi päiväsuunnitelma — `rebalancePlan` null = ei tasapainotuskorjausta.
 */
export function composeCoachDailyPlan(
  userState: AdaptiveUserState,
  locale: Locale = "fi",
  rebalancePlan: RebalancePlan | null = null,
): CoachDailyPlan {
  const answers = toOnboardingAnswers(userState);
  const base = generatePersonalizedPlan(
    answers,
    userState.referenceDate,
    locale,
  );
  const adjusted = generateDailyAdjustments(userState, base, locale);
  const { todayCalories, todayMacros } = generateFoodTargets(
    userState,
    adjusted.systemLine,
    locale,
    rebalancePlan,
  );
  const activityEnergyBonusKcal = activityEnergyBonusKcalForReferenceDate(
    userState.referenceDate,
  );
  let finalCalories = todayCalories + activityEnergyBonusKcal;
  let finalMacros = todayMacros;
  if (activityEnergyBonusKcal > 0 && todayCalories > 0) {
    const factor = finalCalories / todayCalories;
    finalMacros = {
      proteinG: Math.round(todayMacros.proteinG * factor),
      carbsG: Math.round(todayMacros.carbsG * factor),
      fatG: Math.round(todayMacros.fatG * factor),
    };
  }
  const personalizationProof = buildPersonalizationProof(
    userState,
    adjusted.systemLine,
    locale,
  );

  const sep = locale === "en" ? " — " : " — ";
  let foodAdjustmentNote: string | null = adjusted.systemLine;
  if (rebalancePlan) {
    const hint = translate(locale, "food.rebalanceHint");
    foodAdjustmentNote = foodAdjustmentNote
      ? `${foodAdjustmentNote}${sep}${hint}`
      : hint;
  }

  return {
    ...base,
    ...adjusted,
    todayCalories: finalCalories,
    todayMacros: finalMacros,
    activityEnergyBonusKcal,
    personalizationProof,
    foodAdjustmentNote,
    rebalancePlan,
  };
}

/** Testit / keräys — ilman tasapainotusta. */
export function generateDailyPlan(
  userState: AdaptiveUserState,
  locale: Locale = "fi",
): CoachDailyPlan {
  return composeCoachDailyPlan(userState, locale, null);
}

/** Build recent day records from localStorage (client). */
export function buildRecentDaysFromStorage(referenceDate: Date): import("@/types/coach").RecentDayRecord[] {
  const out: import("@/types/coach").RecentDayRecord[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    const hint = loadOutcomeHint(d);
    out.push({
      dateKey: k,
      markedDone: isDayMarkedDone(d),
      ...(hint ?? {}),
    });
  }
  return out;
}

export function buildAdaptiveUserState(
  answers: OnboardingAnswers,
  referenceDate: Date = new Date(),
): AdaptiveUserState {
  return {
    referenceDate,
    goal: answers.goal,
    level: effectiveTrainingLevel(answers),
    daysPerWeek: answers.daysPerWeek,
    eatingHabits: answers.eatingHabits,
    flexibilityPreference: answers.flexibility,
    recentDays: buildRecentDaysFromStorage(referenceDate),
    upcomingEvents: loadPlannedEvents(),
    profileExtras: {
      biggestChallenge: answers.biggestChallenge,
      mealStructure: answers.mealStructure,
      socialEatingFrequency: answers.socialEatingFrequency,
      eventDisruption: answers.eventDisruption,
      foodPreferences: answers.foodPreferences ?? [],
      foodDislikes: answers.foodDislikes ?? [],
      selectedPackageId: normalizeProgramPackageId(answers.selectedPackageId),
      programBlueprintId: answers.programBlueprintId,
      nutritionBlueprintId: answers.nutritionBlueprintId,
      mode: answers.mode,
      trainingLevel: answers.trainingLevel,
      programTrackId: normalizeProgramTrackId(answers.programTrackId),
      targetWeight: answers.targetWeight,
      targetDate: answers.targetDate,
      targetReason: answers.targetReason,
      currentWeight: answers.currentWeight,
    },
  };
}
