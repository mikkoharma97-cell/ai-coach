/**
 * Meal engine bias from ready package — templates stay in mealTemplates.ts.
 * Ruokarunko (nutrition blueprint) voi säätää painotuksia päällekkäin paketin kanssa.
 */
import type { MealFlexibilityLevel } from "@/lib/mealEngine";
import {
  resolveNutritionBlueprint,
  type NutritionBlueprint,
} from "@/lib/nutritionBlueprints";
import { normalizeProgramPackageId } from "@/lib/programPackages";
import type { Goal, OnboardingAnswers } from "@/types/coach";

export type MealEnginePackageConfig = {
  /** Boost these template tags when ranking pools */
  boostTags: string[];
  /** Nudge dinner pool selection */
  dinnerBias: "balanced" | "strict" | "flex";
  /** Prefer quick / minimal-prep breakfast & lunch when true */
  preferQuick: boolean;
  /** Extra protein nudge multiplier (1 = default) */
  proteinBias: number;
};

export function getMealEngineConfigFromPackage(
  packageId: string | null | undefined,
): MealEnginePackageConfig {
  const id = normalizeProgramPackageId(packageId);
  switch (id) {
    case "steady_start":
      return {
        boostTags: ["balanced", "quick"],
        dinnerBias: "balanced",
        preferQuick: true,
        proteinBias: 1,
      };
    case "muscle_rhythm":
      return {
        boostTags: ["protein", "carbs"],
        dinnerBias: "balanced",
        preferQuick: false,
        proteinBias: 1.06,
      };
    case "light_cut":
      return {
        boostTags: ["light", "protein"],
        dinnerBias: "strict",
        preferQuick: false,
        proteinBias: 1.08,
      };
    case "performance_block":
      return {
        boostTags: ["protein", "carbs", "balanced"],
        dinnerBias: "strict",
        preferQuick: false,
        proteinBias: 1.05,
      };
    default:
      return {
        boostTags: [],
        dinnerBias: "balanced",
        preferQuick: false,
        proteinBias: 1,
      };
  }
}

function mergeNutritionBlueprint(
  base: MealEnginePackageConfig,
  nb: NutritionBlueprint,
): MealEnginePackageConfig {
  const tags = new Set(base.boostTags);
  let dinnerBias = base.dinnerBias;
  let preferQuick = base.preferQuick;
  let proteinBias = base.proteinBias;

  switch (nb.style) {
    case "easy":
      tags.add("balanced");
      tags.add("quick");
      preferQuick = true;
      break;
    case "balanced":
      tags.add("balanced");
      break;
    case "high_protein":
      tags.add("protein");
      tags.add("light");
      proteinBias *= 1.06;
      dinnerBias = "strict";
      break;
    case "performance":
      tags.add("protein");
      tags.add("carbs");
      proteinBias *= 1.04;
      break;
    case "fatloss":
      tags.add("light");
      tags.add("protein");
      dinnerBias = "strict";
      proteinBias *= 1.05;
      break;
    default:
      break;
  }

  if (nb.includesWorkoutNutrition) {
    tags.add("carbs");
  }
  if (nb.supportsQuickFallbacks) {
    preferQuick = true;
    tags.add("quick");
  }
  if (nb.timingMode === "shift_based") {
    preferQuick = true;
  }
  if (nb.timingMode === "flex") {
    dinnerBias = "flex";
  }

  return {
    boostTags: [...tags],
    dinnerBias,
    preferQuick,
    proteinBias,
  };
}

/** Paketti + valittu ruokarunko — moottorin käyttämä konfiguraatio */
export function getMergedMealEngineConfig(
  profile: OnboardingAnswers,
): MealEnginePackageConfig {
  const base = getMealEngineConfigFromPackage(profile.selectedPackageId);
  const nb = resolveNutritionBlueprint(profile);
  return mergeNutritionBlueprint(base, nb);
}

export function mealFlexFromDinnerBias(
  base: MealFlexibilityLevel,
  bias: MealEnginePackageConfig["dinnerBias"],
): MealFlexibilityLevel {
  if (bias === "strict") return "strict";
  if (bias === "flex") return "flex";
  return base;
}

/** Konkreettiset “syö tämä nyt” -ehdotukset — ei pelkkää makrolukua */
export type ConcreteMealIdea = { fi: string; en: string };

export function concreteMealIdeasForDay(input: {
  packageId: string | null | undefined;
  goal: Goal;
  hasTrainingToday: boolean;
  caloriesTarget: number;
}): ConcreteMealIdea[] {
  const pkg = normalizeProgramPackageId(input.packageId);
  const train = input.hasTrainingToday;
  const k = input.caloriesTarget;

  const ideas: ConcreteMealIdea[] = [];

  if (input.goal === "lose_weight") {
    ideas.push(
      {
        fi: "Lounas: kana + iso kasvislautanen — täyttää ja tukee alijäämää.",
        en: "Lunch: chicken + a big veg plate — filling and supports your deficit.",
      },
      {
        fi: "Välipala: raejuusto + tomaatti — proteiini pysyy päivän mukana.",
        en: "Snack: cottage cheese + tomato — protein stays with the day.",
      },
    );
    if (train) {
      ideas.push({
        fi: "Treenipäivä: lisää yksi maltillinen hiilariankkuri (riisi tai kaura) ennen tai jälkeen.",
        en: "Training day: add one modest carb anchor (rice or oats) before or after.",
      });
    }
    if (pkg === "light_cut") {
      ideas.push({
        fi: "Ilta: kala + vihreät — kevyt mutta proteiinivakaa.",
        en: "Evening: fish + greens — light but protein-steady.",
      });
    }
  } else if (input.goal === "build_muscle") {
    ideas.push(
      {
        fi: "Aamiainen: kaura + muna + marjat — pohja volyymille.",
        en: "Breakfast: oats + egg + berries — a base for volume.",
      },
      {
        fi: "Lounas: naudan jauheliha + peruna + kasvikset — proteiini + hiilarit.",
        en: "Lunch: beef mince + potato + veg — protein + carbs.",
      },
    );
    if (train) {
      ideas.push({
        fi: "Treenin ympärillä: banaani tai riisikakku — energia liikkeelle.",
        en: "Around training: banana or rice cakes — energy for work.",
      });
    }
    if (pkg === "muscle_rhythm") {
      ideas.push({
        fi: "Iltapala: rahka + marjat — sulkee proteiinin ilman ylimääräistä.",
        en: "Evening: quark + berries — closes protein without extra noise.",
      });
    }
  } else {
    ideas.push(
      {
        fi: "Lounas: kala/kana + täysjyvä + salaatti — tasainen päivä.",
        en: "Lunch: fish/chicken + whole grain + salad — an even day.",
      },
      {
        fi: "Välipala: hedelmä + pähkinät — energia ilman sokeripiikkiä.",
        en: "Snack: fruit + nuts — energy without a sugar spike.",
      },
    );
    if (train) {
      ideas.push({
        fi: "Ennen kevyttä treeniä: pieni välipala 1–2 h ennen.",
        en: "Before light training: a small snack 1–2 h ahead.",
      });
    }
  }

  if (k < 2000) {
    ideas.push({
      fi: "Tiukempi kalori — pidä annokset selkeitä, vältä “salaatti + öljy” -ansaa.",
      en: "Tighter calories — keep portions clear; avoid the “salad + oil” trap.",
    });
  } else {
    ideas.push({
      fi: "Kalorit antavat tilaa — jaa hiilarit tasaisesti päivään.",
      en: "Calories give room — spread carbs evenly through the day.",
    });
  }

  return ideas.slice(0, 5);
}
