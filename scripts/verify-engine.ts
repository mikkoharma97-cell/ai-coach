/**
 * Aja: npx tsx scripts/verify-engine.ts
 * BUILD PASS 02 — neljä pakollista tapausta.
 */
import { generateWorkoutDay } from "../src/lib/training/generator";
import {
  exercisesInCategory,
  filterExercisesByTrainingLevel,
  getExerciseById,
  pickExercisesUnique,
  resolveExerciseWithAlternatives,
} from "../src/lib/training/exercises";

function assert(name: string, ok: boolean, detail?: string) {
  if (!ok) {
    throw new Error(`${name} FAILED${detail ? `: ${detail}` : ""}`);
  }
  console.log(`OK: ${name}`);
}

function case1() {
  const { picks } = pickExercisesUnique(
    ["push", "pull", "legs", "core"],
    "case1-seed",
    "beginner",
    undefined,
    "basic_strength",
    "fi",
  );
  const exercises = picks.map((p) => p.resolved.exercise);
  const bad = exercises.filter((e) => e.difficulty === "advanced");
  assert(
    "CASE 1 beginner + no lim: ei advanced-liikkeitä valinnassa",
    bad.length === 0,
    bad.map((e) => e.id).join(","),
  );
}

function case2() {
  const r = resolveExerciseWithAlternatives(
    getExerciseById("bench_press")!,
    ["shoulder_sensitive"],
    "fi",
  );
  assert(
    "CASE 2 shoulder: penkki vaihtuu",
    r.wasSubstituted && r.exercise.id !== "bench_press",
    `${r.exercise.id} substituted=${r.wasSubstituted}`,
  );
}

function case3() {
  const push = exercisesInCategory("push");
  const advPush = filterExercisesByTrainingLevel(push, "advanced", "c3");
  const begPush = filterExercisesByTrainingLevel(push, "beginner", "c3");
  const advancedDiffCount = push.filter((e) => e.difficulty === "advanced").length;
  assert(
    "CASE 3 advanced-poolissa on enemmän liikkeitä kuin beginner-poolissa (kun advanced-liikkeitä on)",
    advancedDiffCount === 0 || advPush.length > begPush.length,
    `adv=${advPush.length} beg=${begPush.length}`,
  );
}

function case4() {
  const r = resolveExerciseWithAlternatives(
    getExerciseById("rdl")!,
    ["lower_back_sensitive"],
    "fi",
  );
  assert(
    "CASE 4 lower_back + RDL: ketju leg_curl:iin",
    r.wasSubstituted && r.exercise.id === "leg_curl",
    `${r.exercise.id}`,
  );
}

function caseGuided() {
  const day = generateWorkoutDay({
    package: "steady_start",
    goal: "build_muscle",
    level: "beginner",
    dayIndex: 0,
    limitations: ["shoulder_sensitive"],
    locale: "fi",
  });
  assert(
    "guided generateWorkoutDay palauttaa debugin",
    day.exerciseSelectionDebug != null && day.exerciseSelectionDebug.slots.length > 0,
  );
}

case1();
case2();
case3();
case4();
caseGuided();
console.log("Kaikki moottoritapaukset OK.");
