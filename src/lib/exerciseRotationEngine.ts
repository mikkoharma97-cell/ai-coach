/**
 * Liikevaihto — säilyttää movement patternin, ehdottaa vaihtoehtoja.
 */
import { classifyExercise } from "@/lib/exerciseClassification";
import { getExerciseById } from "@/lib/training/exercises";
import type { Exercise } from "@/types/exercise";

export type RotationAdvice = {
  currentExercise: Exercise;
  alternatives: Exercise[];
  keepOrRotate: "keep" | "rotate_now";
  rotationReasonFi: string;
  rotationReasonEn: string;
};

export function rotationAdviceForExercise(
  exerciseId: string,
  week: number,
  _locale: "fi" | "en",
): RotationAdvice | null {
  const ex = getExerciseById(exerciseId);
  if (!ex) return null;
  const meta = classifyExercise(ex);
  const alts = ex.alternatives
    .map((a) => (a.targetExerciseId ? getExerciseById(a.targetExerciseId) : undefined))
    .filter((x): x is Exercise => Boolean(x));

  const block = Math.floor((Math.max(1, week) - 1) / 6);
  const cls = meta.trainingClass;
  const isMain =
    cls === "compound_strength" || cls === "compound_hypertrophy";
  const rotateEvery = isMain ? 3 : 2;
  const keepOrRotate =
    block % rotateEvery === rotateEvery - 1 ? "rotate_now" : "keep";

  const reasonFi =
    keepOrRotate === "rotate_now"
      ? isMain
        ? "Pääliike: vaihtoehto kun tekniikka on kunnossa (noin 6 vk välein)."
        : "Sivuliike: vaihda useammin tarvittaessa."
      : "Pidä liike toistaiseksi — vaihto blokin vaihtuessa.";
  const reasonEn =
    keepOrRotate === "rotate_now"
      ? isMain
        ? "Main lift: rotate when technique is solid (~every 6 weeks)."
        : "Accessory: rotate more often if needed."
      : "Keep for now — rotate when the block changes.";

  return {
    currentExercise: ex,
    alternatives: alts.slice(0, 4),
    keepOrRotate: keepOrRotate === "rotate_now" ? "rotate_now" : "keep",
    rotationReasonFi: reasonFi,
    rotationReasonEn: reasonEn,
  };
}
