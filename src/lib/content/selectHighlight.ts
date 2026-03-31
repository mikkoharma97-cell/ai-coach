/**
 * Yksi korostus kerrallaan — suodatus tavoitteen ja tason mukaan, ei loputonta feediä.
 */
import { effectiveTrainingLevel } from "@/lib/profileTraining";
import type { OnboardingAnswers } from "@/types/coach";
import type { TrainingArticle } from "@/types/content";

function scoreArticle(
  a: TrainingArticle,
  profile: OnboardingAnswers,
): number {
  const level = effectiveTrainingLevel(profile);
  const goal = profile.goal;
  let s = 0;

  if (a.evidenceLevel === "high") s += 4;
  else if (a.evidenceLevel === "medium") s += 2;
  else s += 1;

  if (goal === "lose_weight") {
    if (a.category === "nutrition" || a.category === "conditioning") s += 5;
    if (a.tags.includes("volume")) s += 1;
  }
  if (goal === "build_muscle") {
    if (a.category === "hypertrophy" || a.tags.includes("hypertrophy")) s += 5;
    if (a.category === "nutrition") s += 2;
  }
  if (goal === "improve_fitness") {
    if (a.category === "conditioning" || a.category === "recovery") s += 4;
  }

  if (level === "beginner") {
    if (a.category === "technique" || a.tags.includes("technique")) s += 3;
    if (a.evidenceLevel === "high") s += 2;
    s -= a.tags.length > 4 ? 1 : 0;
  } else if (level === "intermediate") {
    if (a.category === "hypertrophy" || a.category === "strength") s += 2;
  } else {
    if (a.category === "technique" || a.tags.includes("volume")) s += 3;
    if (a.category === "recovery") s += 2;
  }

  const pkg = profile.selectedPackageId ?? "steady_start";
  if (pkg === "light_cut" && (a.category === "nutrition" || a.category === "conditioning"))
    s += 2;
  if (pkg === "performance_block" && (a.category === "strength" || a.category === "recovery"))
    s += 2;

  const t = Date.parse(a.publishedAt);
  if (!Number.isNaN(t)) {
    const days = (Date.now() - t) / 86_400_000;
    if (days < 21) s += 1;
  }

  return s;
}

/**
 * Valitsee yhden artikkelin näytettäväksi — ei listaa kaikkia käyttöliittymässä.
 */
export function selectTrainingHighlight(
  profile: OnboardingAnswers,
  articles: TrainingArticle[],
): TrainingArticle | null {
  if (articles.length === 0) return null;
  const ranked = [...articles]
    .map((a) => ({ a, s: scoreArticle(a, profile) }))
    .sort((x, y) => y.s - x.s);
  return ranked[0]?.a ?? null;
}
