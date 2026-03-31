import { emptyAnswers } from "@/lib/plan";
import { normalizeProgramPackageId } from "@/lib/programPackages";
import type { Goal, Level, OnboardingAnswers } from "@/types/coach";

const GOALS: Goal[] = ["lose_weight", "build_muscle", "improve_fitness"];
const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

/** Hakuparametreista profiili highlight-valintaan — ei täyttä tallennettua profiilia. */
export function profileFromSearchParams(
  sp: URLSearchParams,
): OnboardingAnswers {
  const base = emptyAnswers();
  const g = sp.get("goal");
  const l = sp.get("level");
  const pkg = sp.get("package");
  const goal = g && GOALS.includes(g as Goal) ? (g as Goal) : base.goal;
  const level =
    l && LEVELS.includes(l as Level) ? (l as Level) : base.level;
  return {
    ...base,
    goal,
    level,
    trainingLevel: level,
    selectedPackageId: normalizeProgramPackageId(pkg ?? base.selectedPackageId),
  };
}
