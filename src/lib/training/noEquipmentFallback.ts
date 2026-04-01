/**
 * Ei välineitä — yksi mapping-lähde + luokitus (bodyweight säilyy).
 */
import { classifyExercise } from "@/lib/exerciseClassification";
import { getExerciseById } from "@/lib/training/exercises";
import type { Locale } from "@/lib/i18n";
import type { ProExercise } from "@/types/pro";
import { swapProExerciseIdentityAllowAny } from "@/lib/training/exerciseOverrides";

/** Kone / tanko / käsipaino → kehonpaino (katalogin id:t). Ei mappia = liike jätetään pois mieluummin kuin väkisin väärä. */
const NO_EQUIPMENT_MAP: Record<string, string> = {
  bench_press: "dip",
  dumbbell_flat_press: "dip",
  incline_db_press: "dip",
  close_grip_bench: "dip",
  cable_fly: "dip",
  ohp: "dip",
  skullcrusher: "dip",
  tricep_pushdown: "dip",
  lat_pulldown: "pull_up",
  back_squat: "lunge",
  smith_squat: "lunge",
  hack_squat: "lunge",
  leg_press: "lunge",
  leg_extension: "lunge",
  leg_curl: "lunge",
  bulgarian_split_squat: "lunge",
  lunge: "lunge",
  rdl: "lunge",
  hip_thrust: "lunge",
  calf_standing: "walk",
  calf_seated: "walk",
  cable_crunch: "plank",
  hanging_leg_raise: "plank",
  ab_wheel: "plank",
  sit_up: "plank",
  plank: "plank",
  bike: "walk",
  elliptical: "walk",
  stairs: "walk",
  walk: "walk",
};

export function getNoEquipmentTargetId(exerciseId: string): string | null {
  const ex = getExerciseById(exerciseId);
  if (!ex) return null;
  if (classifyExercise(ex).modality === "bodyweight") return exerciseId;
  const mapped = NO_EQUIPMENT_MAP[exerciseId];
  if (mapped && getExerciseById(mapped)) return mapped;
  return null;
}

export function mapExercisesToNoEquipment(
  exercises: ProExercise[],
  rawCanonicalIds: string[],
  locale: Locale,
): { exercises: ProExercise[]; canonicalIds: string[] } {
  const outEx: ProExercise[] = [];
  const outCanon: string[] = [];
  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const canon = rawCanonicalIds[i] ?? ex.id;
    const tid = getNoEquipmentTargetId(ex.id);
    if (tid == null) continue;
    if (tid === ex.id) {
      outEx.push(ex);
      outCanon.push(canon);
      continue;
    }
    const swapped = swapProExerciseIdentityAllowAny(ex, tid, locale);
    if (swapped) {
      outEx.push(swapped);
      outCanon.push(canon);
    }
  }
  return { exercises: outEx, canonicalIds: outCanon };
}
