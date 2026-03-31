import type {
  ExerciseProgressionState,
  ProExercise,
  ProProgressionMode,
} from "@/types/pro";

export function ensureExerciseProgress(
  ex: ProExercise,
  existing?: ExerciseProgressionState,
): ExerciseProgressionState {
  if (existing) return existing;
  const [minS, maxS] = ex.reps.split(/[–-]/).map((s) => parseInt(s.trim(), 10));
  const min = Number.isFinite(minS) ? minS : 8;
  const max = Number.isFinite(maxS) ? maxS : 10;
  return {
    exerciseId: ex.id,
    targetRepRange: { min, max },
    progressSuggestion: undefined,
  };
}

export function suggestProgressionCopy(
  mode: ProProgressionMode,
  state: ExerciseProgressionState,
  locale: "fi" | "en",
): string {
  const fi =
    mode === "linear"
      ? "Tämä liike on valmis seuraavaan nousuun — lisää 2,5 kg kun edellinen sarja meni tavoitteella."
      : mode === "double_progression"
        ? "Pidä kuorma samana ja hae yksi lisätoisto — kun yläraja täynnä, nosta kuormaa."
        : "Palautuminen näyttää heikolta — pidä tämä tasolla vielä yksi kierros ennen kuormaa.";

  const en =
    mode === "linear"
      ? "Ready for the next load jump — add ~2.5 kg when sets hit the target."
      : mode === "double_progression"
        ? "Keep load and add one rep — when you hit the top of the range, increase load."
        : "Recovery looks thin — hold this load for one more week before pushing.";

  if (state.progressSuggestion) {
    return state.progressSuggestion;
  }
  return locale === "fi" ? fi : en;
}
