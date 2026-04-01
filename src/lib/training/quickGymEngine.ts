/**
 * 30 min -tila: karsitaan sama päivä, ei uutta ohjelmaa.
 */
import { classifyExercise } from "@/lib/exerciseClassification";
import { getExerciseById } from "@/lib/training/exercises";
import type { ProExercise } from "@/types/pro";

function compoundScore(exerciseId: string): number {
  const ex = getExerciseById(exerciseId);
  if (!ex) return 0;
  const c = classifyExercise(ex);
  if (c.trainingClass === "compound_strength") return 4;
  if (c.trainingClass === "compound_hypertrophy") return 3;
  if (c.trainingClass === "machine_hypertrophy") return 2;
  if (c.trainingClass === "isolation") return 1;
  return 0;
}

/**
 * Palauttaa enintään 3 liikettä: painotettu compoundit + yksi tuki,
 * järjestys säilyy alkuperäisessä järjestyksessä valittujen kesken.
 */
export function pickQuickGymExercises(
  exercises: ProExercise[],
  rawCanonicalIds: string[],
): { exercises: ProExercise[]; canonicalIds: string[] } {
  if (exercises.length <= 3) {
    return { exercises: [...exercises], canonicalIds: [...rawCanonicalIds] };
  }
  const indexed = exercises.map((ex, i) => ({
    ex,
    canon: rawCanonicalIds[i] ?? ex.id,
    i,
    score: compoundScore(ex.id),
  }));
  const sorted = [...indexed].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.i - b.i;
  });
  const pick: typeof indexed = [];
  const used = new Set<number>();
  for (const row of sorted) {
    if (pick.length >= 3) break;
    pick.push(row);
    used.add(row.i);
  }
  pick.sort((a, b) => a.i - b.i);
  return {
    exercises: pick.map((p) => p.ex),
    canonicalIds: pick.map((p) => p.canon),
  };
}
