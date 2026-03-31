/**
 * Treenipäivän ja kokonaisohjelman generointi — paketti + tavoite + viikko.
 */
import type { Locale } from "@/lib/i18n";
import { translate } from "@/lib/i18n";
import { getTodayGuidanceFromProfile } from "@/lib/packageGuidance";
import { normalizeProgramPackageId } from "@/lib/programPackages";
import { emptyAnswers } from "@/lib/plan";
import { effectiveTrainingLevel } from "@/lib/profileTraining";
import {
  resolveProgramTrackId,
  trackProgressionIntensityDelta,
} from "@/lib/programTracks";
import {
  resolveProgramBlueprint,
  trainingDaySlotIndex,
  trainingWeekdayIndices,
} from "@/lib/programBlueprints";
import type {
  CoachMode,
  Goal,
  Level,
  OnboardingAnswers,
  ProgramBlueprintId,
  ProgramPackageId,
  ProgramTrackId,
} from "@/types/coach";
import { coachTipsForExercise } from "@/lib/exerciseCoachTips";
import { getProgramLibraryEntry } from "@/lib/coachProgramCatalog";
import { getLibraryCategoriesOrFallback } from "@/lib/trainingCategoryLibrary";
import {
  exerciseDisplayName,
  type Exercise,
  type ExerciseCategory,
  type ExerciseSelectionDebug,
  type LimitationTag,
} from "@/types/exercise";
import type {
  ProExercise,
  ProExerciseAlternative,
  ProProgressionMode,
  ProSplitPreset,
  ProTrainingDay,
  ProTrainingProgram,
} from "@/types/pro";

const PRO_MODE_TO_PROGRESSION: Record<ProProgressionMode, ProgressionStyle> = {
  linear: "linear",
  double_progression: "double_progression",
  adaptive: "adaptive",
};
import {
  pickExercisesUnique,
  type ResolveExerciseResult,
} from "@/lib/training/exercises";
import {
  generateProgression,
  type ProgressionStyle,
} from "@/lib/training/progression";
import {
  buildExercisePrescription,
  rotationBlockIndex,
} from "@/lib/coach/trainingPrescriptionEngine";
import type { IntensifierPolicyId } from "@/types/intensifierRules";

export type GenerateWorkoutDayGoal = Goal | "muscle";
export type GenerateWorkoutDayLevel = Level | "medium";

export type GenerateWorkoutDayParams = {
  package: ProgramPackageId;
  goal: GenerateWorkoutDayGoal;
  level: GenerateWorkoutDayLevel;
  week?: number;
  /** Ma=0 … Su=6 — oletus: tämä päivä */
  dayIndex?: number;
  locale?: Locale;
  trainingLevel?: Level;
  programTrackId?: ProgramTrackId;
  limitations?: LimitationTag[];
  /** guided = oletus; pro = enemmän liikkeitä + editable */
  coachMode?: CoachMode;
  /** Tyhjä = ratkaistaan paketin / tilan oletusrungosta */
  programBlueprintId?: ProgramBlueprintId;
  /** Täysi profiili — blueprint/track/runko ratkaistaan oikeasti elämäntilan mukaan */
  sourceProfile?: OnboardingAnswers;
};

function intensifierPolicyFromProfile(
  answers: OnboardingAnswers,
): IntensifierPolicyId {
  const e = answers.selectedProgramLibraryId
    ? getProgramLibraryEntry(answers.selectedProgramLibraryId)
    : undefined;
  if (e?.intensifierPolicyId) return e.intensifierPolicyId;
  if (answers.lifeSchedule === "shift_work") return "shift_friendly";
  if (effectiveTrainingLevel(answers) === "beginner") return "conservative";
  return "balanced";
}

export type GeneratedWorkoutDay = {
  packageId: ProgramPackageId;
  goal: Goal;
  level: Level;
  durationLabel: string;
  workout: string;
  food: string;
  activity: string;
  todayKicker: string;
  /** Tämän päivän generoitu treeni (tyhjä lepopäivänä) */
  exercises: ProExercise[];
  /** Viikon progressiorivi jota käytettiin */
  progression: ReturnType<typeof generateProgression>;
  isRestDay: boolean;
  /** Kehitys / testit — ei UI */
  exerciseSelectionDebug?: ExerciseSelectionDebug;
};

type DaySpec = {
  key: string;
  name: string;
  focus: string;
  categories: ExerciseCategory[];
};

const SPLIT_META: Record<
  ProSplitPreset,
  { name: string; mode: ProProgressionMode; trainDaysPerWeek: 3 | 4 | 5 | 6; days: DaySpec[] }
> = {
  push_pull_legs: {
    name: "Push / Pull / Legs",
    mode: "double_progression",
    trainDaysPerWeek: 6,
    days: [
      { key: "d1", name: "Push", focus: "Työntävät", categories: ["push", "push", "core"] },
      { key: "d2", name: "Pull", focus: "Vetävät", categories: ["pull", "pull"] },
      { key: "d3", name: "Legs", focus: "Jalat", categories: ["legs", "legs"] },
      { key: "d4", name: "Lepo", focus: "Palautuminen", categories: [] },
      { key: "d5", name: "Upper", focus: "Yläkroppa (kevyt)", categories: ["push", "pull"] },
      { key: "d6", name: "Lower", focus: "Alakroppa (kevyt)", categories: ["legs", "core"] },
    ],
  },
  upper_lower: {
    name: "Upper / Lower",
    mode: "linear",
    trainDaysPerWeek: 4,
    days: [
      { key: "u1", name: "Upper A", focus: "Työntö + veto", categories: ["push", "pull", "core"] },
      { key: "l1", name: "Lower A", focus: "Jalka perus", categories: ["legs", "legs"] },
      { key: "u2", name: "Upper B", focus: "Vaihtelu", categories: ["pull", "push"] },
      { key: "l2", name: "Lower B", focus: "Taka ketju painotus", categories: ["legs", "legs"] },
    ],
  },
  full_body: {
    name: "Full body",
    mode: "adaptive",
    trainDaysPerWeek: 3,
    days: [
      { key: "fb1", name: "Koko keho A", focus: "Perusliikkeet", categories: ["push", "pull", "legs"] },
      { key: "fb2", name: "Koko keho B", focus: "Sama rakenne, kevyempi", categories: ["legs", "push", "core"] },
      { key: "fb3", name: "Koko keho C", focus: "Veto-painotus", categories: ["pull", "legs", "push"] },
    ],
  },
  custom: {
    name: "Custom",
    mode: "adaptive",
    trainDaysPerWeek: 4,
    days: [{ key: "c1", name: "Päivä 1", focus: "—", categories: ["push", "legs"] }],
  },
};

function normalizeGoal(g: GenerateWorkoutDayGoal): Goal {
  if (g === "muscle") return "build_muscle";
  return g;
}

function normalizeLevel(l: GenerateWorkoutDayLevel): Level {
  if (l === "medium") return "intermediate";
  return l;
}

function durationKeyForLevel(
  level: Level,
): "plan.base.dur.beginner" | "plan.base.dur.intermediate" | "plan.base.dur.advanced" {
  if (level === "beginner") return "plan.base.dur.beginner";
  if (level === "advanced") return "plan.base.dur.advanced";
  return "plan.base.dur.intermediate";
}

function mergedProfileForGeneration(
  pkg: ProgramPackageId,
  goal: Goal,
  level: Level,
  params: Pick<
    GenerateWorkoutDayParams,
    | "trainingLevel"
    | "programTrackId"
    | "limitations"
    | "coachMode"
    | "programBlueprintId"
  >,
): OnboardingAnswers {
  const nl = normalizeLevel(level as GenerateWorkoutDayLevel);
  return {
    ...emptyAnswers(),
    selectedPackageId: pkg,
    goal,
    level: nl,
    trainingLevel: params.trainingLevel ?? nl,
    programTrackId: params.programTrackId,
    limitations: params.limitations,
    mode: params.coachMode ?? "guided",
    programBlueprintId: params.programBlueprintId,
  };
}

function answersForWorkoutGeneration(
  packageId: ProgramPackageId,
  goal: Goal,
  level: Level,
  params: GenerateWorkoutDayParams,
): OnboardingAnswers {
  if (params.sourceProfile) {
    const sp = params.sourceProfile;
    const nl = normalizeLevel(level as GenerateWorkoutDayLevel);
    return {
      ...sp,
      selectedPackageId: packageId,
      goal,
      level: nl,
      trainingLevel: params.trainingLevel ?? sp.trainingLevel ?? nl,
      programTrackId: params.programTrackId ?? sp.programTrackId,
      programBlueprintId: params.programBlueprintId ?? sp.programBlueprintId,
      limitations: params.limitations ?? sp.limitations,
      mode: params.coachMode ?? sp.mode ?? "guided",
    };
  }
  return mergedProfileForGeneration(packageId, goal, level, params);
}

export function exerciseToProExercise(
  ex: Exercise,
  prog: ReturnType<typeof generateProgression>,
  locale: Locale = "fi",
  opts?: {
    editable?: boolean;
    resolved?: ResolveExerciseResult;
    goal?: Goal;
    week?: number;
    trainingLevel?: Level;
    exerciseIndex?: number;
    exerciseCount?: number;
    progressionStyle?: ProgressionStyle;
    intensifierPolicyId?: IntensifierPolicyId;
  },
): ProExercise {
  const alts: ProExerciseAlternative[] = ex.alternatives.map((a) => ({
    id: a.id,
    name: locale === "en" ? a.nameEn : a.nameFi,
    reasonFi: a.reasonFi,
    reasonEn: a.reasonEn,
  }));

  const r = opts?.resolved;
  const subFi =
    r?.wasSubstituted && r.substitutionReasonFi
      ? r.substitutionReasonFi
      : undefined;
  const subEn =
    r?.wasSubstituted && r.substitutionReasonEn
      ? r.substitutionReasonEn
      : undefined;

  const tips = coachTipsForExercise(ex);
  const goal = opts?.goal ?? "improve_fitness";
  const week = opts?.week ?? 1;
  const level = opts?.trainingLevel ?? "intermediate";
  const exerciseIndex = opts?.exerciseIndex ?? 0;
  const exerciseCount = Math.max(1, opts?.exerciseCount ?? 1);

  const rx = buildExercisePrescription(ex, {
    goal,
    week,
    level,
    exerciseIndex,
    exerciseCount,
    baseProgression: prog,
    progressionStyle: opts?.progressionStyle ?? "linear",
    intensifierPolicyId: opts?.intensifierPolicyId ?? "balanced",
  });
  const locFi = locale === "fi";
  const repsStr = locFi ? rx.repsLabelFi : rx.repsLabelEn;
  const prescFi = rx.prescriptionLineFi;
  const prescEn = rx.prescriptionLineEn;

  return {
    id: ex.id,
    name: exerciseDisplayName(ex, locale === "en" ? "en" : "fi"),
    target: ex.primaryMuscles.join(" + "),
    sets: rx.sets,
    reps: repsStr,
    effort: rx.effort,
    rest: rx.rest,
    alternatives: alts,
    editable: opts?.editable,
    substitutionReasonFi: subFi,
    substitutionReasonEn: subEn,
    coachTipFi: tips.tipFi,
    coachTipEn: tips.tipEn,
    coachMistakeFi: tips.mistakeFi,
    coachMistakeEn: tips.mistakeEn,
    coachFocusFi: tips.focusFi,
    coachFocusEn: tips.focusEn,
    prescriptionLineFi: prescFi ?? undefined,
    prescriptionLineEn: prescEn ?? undefined,
  };
}

function buildExercisesForCategories(
  categories: ExerciseCategory[],
  prog: ReturnType<typeof generateProgression>,
  seed: string,
  locale: Locale,
  trainingLevel: Level,
  limitations: LimitationTag[] | undefined,
  programTrackId: ProgramTrackId | undefined,
  opts?: {
    exerciseEditable?: boolean;
    goal?: Goal;
    week?: number;
    sourceProfile?: OnboardingAnswers;
    progressionStyle?: ProgressionStyle;
    intensifierPolicyId?: IntensifierPolicyId;
  },
): { exercises: ProExercise[]; debug: ExerciseSelectionDebug } {
  const week = opts?.week ?? 1;
  const rot = rotationBlockIndex(week);
  const seedRot = `${seed}-meso${rot}`;
  const { picks, debug } = pickExercisesUnique(
    categories,
    seedRot,
    trainingLevel,
    limitations,
    programTrackId,
    locale === "en" ? "en" : "fi",
  );
  const editable = opts?.exerciseEditable ?? false;
  const goal = opts?.goal ?? "improve_fitness";
  const n = picks.length;
  const policy =
    opts?.intensifierPolicyId ??
    (opts?.sourceProfile
      ? intensifierPolicyFromProfile(opts.sourceProfile)
      : "balanced");
  const progStyle = opts?.progressionStyle ?? "linear";
  return {
    exercises: picks.map((p, i) =>
      exerciseToProExercise(p.resolved.exercise, prog, locale, {
        editable,
        resolved: p.resolved,
        goal,
        week,
        trainingLevel,
        exerciseIndex: i,
        exerciseCount: n,
        progressionStyle: progStyle,
        intensifierPolicyId: policy,
      }),
    ),
    debug,
  };
}

/** Pro: yksi lisäkategoria vaihtelua varten */
function boostCategoriesForPro(
  base: ExerciseCategory[],
  rotation: number,
): ExerciseCategory[] {
  if (base.length === 0) return base;
  const extras: ExerciseCategory[] = [
    "core",
    "conditioning",
    "pull",
    "legs",
    "push",
  ];
  for (let i = 0; i < extras.length; i++) {
    const c = extras[(rotation + i) % extras.length];
    if (!base.includes(c)) return [...base, c].slice(0, 5);
  }
  return base;
}

/**
 * Generoi yhden päivän treenin (paketti + tavoite + taso + viikko + viikonpäivä).
 * Lepopäivä paketin kalenterin mukaan → tyhjä lista.
 */
export function generateWorkoutDay(
  params: GenerateWorkoutDayParams,
): GeneratedWorkoutDay {
  const locale = params.locale ?? "fi";
  const packageId = normalizeProgramPackageId(params.package);
  const goal = normalizeGoal(params.goal);
  const level = normalizeLevel(params.level);
  const week = params.week ?? 1;
  const dayIndex = params.dayIndex ?? 0;
  const answers = answersForWorkoutGeneration(packageId, goal, level, params);
  const effLevel = effectiveTrainingLevel(answers);
  const trackId = resolveProgramTrackId(answers);
  const coachMode = params.coachMode ?? "guided";
  const bp = resolveProgramBlueprint(answers);

  const g = getTodayGuidanceFromProfile(answers, locale);
  const durationLabel = translate(locale, durationKeyForLevel(effLevel));
  const prog = generateProgression(week, {
    level: effLevel,
    intensityDelta: trackProgressionIntensityDelta(trackId),
    progressionStyle: bp.progressionStyle as ProgressionStyle,
  });

  const trainDays = trainingWeekdayIndices(bp);
  const isRestDay = !trainDays.has(dayIndex);

  if (isRestDay) {
    return {
      packageId,
      goal,
      level: effLevel,
      durationLabel,
      workout: g.workout,
      food: g.food,
      activity: g.activity,
      todayKicker: g.todayKicker,
      exercises: [],
      progression: prog,
      isRestDay: true,
    };
  }

  const focusRotation = dayIndex % 4;
  const slot = trainingDaySlotIndex(dayIndex, bp);
  const daySpec = bp.defaultWeek[slot] ?? bp.defaultWeek[0];
  const blueprintCats =
    daySpec && daySpec.categories.length >= 2 ? [...daySpec.categories] : undefined;
  const fallbackCats = pickCategoriesForGoal(goal, focusRotation, effLevel);
  let categoryPlan = getLibraryCategoriesOrFallback(
    effLevel,
    goal,
    slot,
    blueprintCats,
    fallbackCats,
  );
  if (coachMode === "pro") {
    categoryPlan = boostCategoriesForPro(categoryPlan, focusRotation);
  }
  const seed = `${packageId}-${goal}-${week}-${dayIndex}`;
  const exerciseEditable = coachMode === "pro";
  const { exercises, debug } = buildExercisesForCategories(
    categoryPlan,
    prog,
    seed,
    locale,
    effLevel,
    params.limitations,
    trackId,
    {
      exerciseEditable,
      goal,
      week,
      sourceProfile: answers,
      progressionStyle: bp.progressionStyle as ProgressionStyle,
    },
  );

  return {
    packageId,
    goal,
    level: effLevel,
    durationLabel,
    workout: g.workout,
    food: g.food,
    activity: g.activity,
    todayKicker: g.todayKicker,
    exercises,
    progression: prog,
    isRestDay: false,
    exerciseSelectionDebug: debug,
  };
}

/** Tavoite + taso: aloittelijalle vähemmän liikkeitä, prolle hieman enemmän vaihtelua */
function pickCategoriesForGoal(
  goal: Goal,
  rotation: number,
  level: Level,
): ExerciseCategory[] {
  const plans: ExerciseCategory[][] = [
    ["push", "pull", "core"],
    ["legs", "legs", "core"],
    ["pull", "push", "legs"],
    ["push", "legs", "pull"],
  ];
  let base = plans[rotation % plans.length];
  if (goal === "lose_weight") {
    base = ["legs", "push", "core", "pull"].slice(0, 4) as ExerciseCategory[];
    base = base.slice(0, 3);
  } else if (goal === "improve_fitness") {
    base = ["push", "legs", "core"];
  }
  if (level === "beginner") {
    const beginnerPlans: ExerciseCategory[][] = [
      ["push", "legs"],
      ["pull", "core"],
      ["legs", "push"],
      ["pull", "legs"],
    ];
    let b = beginnerPlans[rotation % beginnerPlans.length];
    if (goal === "lose_weight") {
      b = ["legs", "core"];
    } else if (goal === "improve_fitness") {
      b = ["push", "legs"];
    }
    return b;
  }
  if (level === "advanced" && goal === "build_muscle") {
    const extra = rotation % 2 === 0 ? "core" : "push";
    return [...base, extra as ExerciseCategory].slice(0, 4);
  }
  return base;
}

export type GenerateTrainingProgramParams = {
  preset: ProSplitPreset;
  week?: number;
  goal?: Goal;
  /** Eriytä generointi esim. käyttäjä-id:llä */
  salt?: string;
  locale?: Locale;
  trainingLevel?: Level;
  limitations?: LimitationTag[];
  programTrackId?: ProgramTrackId;
  /** Oletus pro — koko ohjelman liikkeet muokattavissa */
  coachMode?: CoachMode;
  /** Intensifier-politiikka (oletus: balanced) */
  intensifierPolicyId?: IntensifierPolicyId;
};

/**
 * Kokonainen Pro-tyyppinen ohjelma presetistä — ei kovakoodattuja päiväkohtaisia listoja.
 */
export function generateTrainingProgram(
  params: GenerateTrainingProgramParams,
): ProTrainingProgram {
  const week = params.week ?? 1;
  const goal = params.goal ?? "build_muscle";
  const locale = params.locale ?? "fi";
  const trainingLevel = params.trainingLevel ?? "intermediate";
  const meta = SPLIT_META[params.preset];
  const progressionStyle = PRO_MODE_TO_PROGRESSION[meta.mode];
  const prog = generateProgression(week, {
    level: trainingLevel,
    progressionStyle,
  });
  const saltBase = params.salt ?? `${params.preset}-w${week}-${goal}`;
  const programTrackId = params.programTrackId;
  const coachMode = params.coachMode ?? "pro";
  const exerciseEditable = coachMode === "pro";
  const intensifierPolicy = params.intensifierPolicyId ?? "balanced";

  const days: ProTrainingDay[] = meta.days.map((spec) => {
    if (spec.categories.length === 0) {
      return {
        id: spec.key,
        name: spec.name,
        focus: spec.focus,
        exercises: [],
      };
    }
    let categories = spec.categories;
    if (coachMode === "pro" && categories.length > 0) {
      categories = boostCategoriesForPro(categories, spec.key.length % 4);
    }
    const { exercises, debug } = buildExercisesForCategories(
      categories,
      prog,
      `${saltBase}-${spec.key}`,
      locale,
      trainingLevel,
      params.limitations,
      programTrackId,
      {
        exerciseEditable,
        goal,
        week,
        progressionStyle,
        intensifierPolicyId: intensifierPolicy,
      },
    );
    return {
      id: spec.key,
      name: spec.name,
      focus: spec.focus,
      exercises,
      engineDebug: debug,
    };
  });

  return {
    splitName: meta.name,
    splitPreset: params.preset,
    trainingDaysPerWeek: meta.trainDaysPerWeek,
    progressionMode: meta.mode,
    days,
  };
}
