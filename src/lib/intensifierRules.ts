/**
 * Intensifier-säännöt — konservatiivinen V1 (policy × taso × luokka).
 */
import type { Level } from "@/types/coach";
import type { ExerciseClassification } from "@/types/exerciseClassification";
import type {
  IntensifierKind,
  IntensifierPolicyId,
  IntensifierResolution,
} from "@/types/intensifierRules";

function baseForClass(
  cls: ExerciseClassification["trainingClass"],
): { drop: boolean; rp: boolean; pump: boolean; fail: boolean } {
  switch (cls) {
    case "compound_strength":
      return { drop: false, rp: false, pump: false, fail: true };
    case "compound_hypertrophy":
      return { drop: false, rp: true, pump: true, fail: true };
    case "machine_hypertrophy":
      return { drop: true, rp: true, pump: true, fail: true };
    case "isolation":
      return { drop: true, rp: true, pump: true, fail: true };
    case "accessory":
      return { drop: false, rp: true, pump: true, fail: true };
    case "skill_or_power":
      return { drop: false, rp: false, pump: false, fail: false };
    case "conditioning_finisher":
      return { drop: false, rp: false, pump: false, fail: false };
    default:
      return { drop: false, rp: false, pump: false, fail: false };
  }
}

export function resolveIntensifiers(
  cls: ExerciseClassification,
  policy: IntensifierPolicyId,
  level: Level,
): IntensifierResolution {
  const b = baseForClass(cls.trainingClass);
  let drop = b.drop && cls.suitableForDropset;
  let rp = b.rp && cls.suitableForRestPause;
  let pump = b.pump && cls.suitableForHighRepPump;
  let fail = b.fail;

  if (policy === "conservative" || level === "beginner") {
    drop = false;
    rp = false;
    pump = pump && cls.trainingClass === "isolation";
    fail = false;
  } else if (policy === "shift_friendly") {
    drop = drop && cls.fatigueCost !== "high";
    rp = false;
    pump = pump && cls.trainingClass === "isolation";
    fail = false;
  } else if (policy === "performance") {
    /* sallitaan hieman laajemmin eristyksissä */
  }

  const allowed: IntensifierKind[] = [];
  const avoided: IntensifierKind[] = [];
  if (drop) allowed.push("drop_set");
  else avoided.push("drop_set");
  if (rp) allowed.push("rest_pause");
  else avoided.push("rest_pause");
  if (pump) allowed.push("high_rep_pump");
  else avoided.push("high_rep_pump");
  if (fail) allowed.push("failure_last_set");
  else avoided.push("failure_last_set");

  return {
    allowed,
    avoided,
    notesFi:
      policy === "conservative"
        ? "Aloitus: vähemmän intensifiointeja — tee laatua ensin."
        : policy === "shift_friendly"
          ? "Vuoro: kevyemmät intensifierit, vähemmän uupumusta."
          : "Intensifierit vain kun tekniikka pysyy.",
    notesEn:
      policy === "conservative"
        ? "Beginner: fewer intensifiers — quality first."
        : policy === "shift_friendly"
          ? "Shift-friendly: lighter intensifiers, less burnout."
          : "Use intensifiers only when technique holds.",
  };
}
