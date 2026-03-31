import { dayKeyFromDate } from "@/lib/dateKey";
import { generateDailyPlan } from "@/lib/dailyEngine";
import type { DailyMealsPlan } from "@/lib/mealEngine";
import { generateDailyMeals } from "@/lib/mealEngine";
import { getTodayGuidanceFromProfile } from "@/lib/packageGuidance";
import { normalizeProgramPackageId } from "@/lib/programPackages";
import { emptyAnswers } from "@/lib/plan";
import { mealOptionGroupsForGoal } from "@/lib/nutrition/meals";
import type {
  Goal,
  MealStructurePreference,
  OnboardingAnswers,
  ProgramPackageId,
} from "@/types/coach";
import type { Locale } from "@/lib/i18n";
import type { MealOptionGroup } from "@/types/meal";

/** API-aliakset */
export type GenerateMealPlanGoal = Goal | "muscle" | "fat_loss";

export type GenerateMealPlanParams = {
  package: ProgramPackageId;
  goal: GenerateMealPlanGoal;
  meals: number;
  locale?: Locale;
  referenceDate?: Date;
};

export type GeneratedMealPlan = {
  packageId: ProgramPackageId;
  goal: Goal;
  mealsPerDay: 3 | 4;
  mealStructure: MealStructurePreference;
  todayCalories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  foodSummary: string;
  dailyMeals: DailyMealsPlan;
  /** Vaihtoehtopohjaiset rivit (ei yksi kiinteä ateria) */
  optionGroups: MealOptionGroup[];
};

function normalizeGoal(g: GenerateMealPlanGoal): Goal {
  if (g === "muscle") return "build_muscle";
  if (g === "fat_loss") return "lose_weight";
  return g;
}

function normalizeMealsPerDay(n: number): 3 | 4 {
  if (Number.isFinite(n) && n >= 4) return 4;
  return 3;
}

function structureFromMeals(perDay: 3 | 4): MealStructurePreference {
  return perDay === 4 ? "snack_forward" : "three_meals";
}

function profileFor(
  pkg: ProgramPackageId,
  goal: Goal,
  structure: MealStructurePreference,
): OnboardingAnswers {
  return {
    ...emptyAnswers(),
    selectedPackageId: pkg,
    goal,
    mealStructure: structure,
  };
}

/**
 * Päivän ruokasuunnitelma: makrot + `generateDailyMeals`-poolit + vaihtoehtoryhmät.
 */
export function generateMealPlan(params: GenerateMealPlanParams): GeneratedMealPlan {
  const locale = params.locale ?? "fi";
  const ref = params.referenceDate ?? new Date();
  const packageId = normalizeProgramPackageId(params.package);
  const goal = normalizeGoal(params.goal);
  const mealsPerDay = normalizeMealsPerDay(params.meals);
  const mealStructure = structureFromMeals(mealsPerDay);
  const answers = profileFor(packageId, goal, mealStructure);

  const plan = generateDailyPlan(answers, ref, locale);

  const dailyMeals = generateDailyMeals(
    answers,
    {
      caloriesTarget: plan.todayCalories,
      proteinTarget: plan.todayMacros.proteinG,
    },
    dayKeyFromDate(ref),
    locale,
  );

  const g = getTodayGuidanceFromProfile(answers, locale);
  const optionGroups = mealOptionGroupsForGoal(goal);

  return {
    packageId,
    goal,
    mealsPerDay,
    mealStructure,
    todayCalories: plan.todayCalories,
    proteinG: plan.todayMacros.proteinG,
    carbsG: plan.todayMacros.carbsG,
    fatG: plan.todayMacros.fatG,
    foodSummary: g.food,
    dailyMeals,
    optionGroups,
  };
}
