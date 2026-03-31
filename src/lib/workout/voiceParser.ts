/**
 * Deterministic command parsing for workout voice control (not conversational).
 * Input should be lowercased / normalized by caller.
 */

export type WorkoutVoiceCommand =
  | { type: "complete_set" }
  | { type: "next_exercise" }
  | { type: "previous" }
  | { type: "skip_exercise" }
  | { type: "finish_workout" }
  | { type: "set_weight"; kg: number }
  | { type: "set_reps"; reps: number }
  | { type: "set_rpe"; rpe: number }
  | { type: "set_weight_and_reps"; weight: number; reps: number };

const NUM = "(\\d{1,3})";

/** Strip combining marks for robust matching of STT output */
export function normalizeVoiceTranscript(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Try "80 kertaa 10" / "80 x 10" / "80×10" style weight × reps before single-intent rules.
 */
function tryWeightTimesReps(normalized: string): WorkoutVoiceCommand | null {
  const re = new RegExp(
    `^${NUM}\\s*(?:kertaa|x|×|\\*)\\s*${NUM}$`,
    "i",
  );
  const m = normalized.match(re);
  if (!m) return null;
  const w = parseInt(m[1], 10);
  const r = parseInt(m[2], 10);
  if (w <= 0 || r <= 0 || w > 500 || r > 200) return null;
  return { type: "set_weight_and_reps", weight: w, reps: r };
}

function tryWeight(normalized: string): WorkoutVoiceCommand | null {
  let m = normalized.match(
    new RegExp(`^(?:paino|weight|kiloa?|kg)\\s*${NUM}$`, "i"),
  );
  if (!m) m = normalized.match(new RegExp(`^${NUM}\\s*(?:kg|kiloa?)$`, "i"));
  if (!m) return null;
  const kg = parseInt(m[m.length - 1], 10);
  if (kg <= 0 || kg > 500) return null;
  return { type: "set_weight", kg };
}

function tryReps(normalized: string): WorkoutVoiceCommand | null {
  const m = normalized.match(
    new RegExp(
      `^${NUM}\\s*(?:toistoa|toisto|reps?|repeat|repetitions?)$`,
      "i",
    ),
  );
  if (!m) return null;
  const reps = parseInt(m[1], 10);
  if (reps <= 0 || reps > 200) return null;
  return { type: "set_reps", reps };
}

function tryRpe(normalized: string): WorkoutVoiceCommand | null {
  const m = normalized.match(
    new RegExp(`^(?:rpe|rp)\\s*${NUM}$`, "i"),
  );
  if (!m) return null;
  const rpe = parseInt(m[1], 10);
  if (rpe < 1 || rpe > 10) return null;
  return { type: "set_rpe", rpe };
}

const PHRASE_RULES: { test: RegExp; cmd: WorkoutVoiceCommand }[] = [
  { test: /^sarja\s+valmis$/, cmd: { type: "complete_set" } },
  { test: /^seuraava\s+liike$/, cmd: { type: "next_exercise" } },
  { test: /^next\s+exercise$/, cmd: { type: "next_exercise" } },
  { test: /^lopeta\s+treeni$/, cmd: { type: "finish_workout" } },
  { test: /^finish\s+workout$/, cmd: { type: "finish_workout" } },
  { test: /^end\s+workout$/, cmd: { type: "finish_workout" } },
  { test: /^valmis$/, cmd: { type: "complete_set" } },
  { test: /^done$/, cmd: { type: "complete_set" } },
  { test: /^seuraava$/, cmd: { type: "complete_set" } },
  { test: /^next$/, cmd: { type: "complete_set" } },
  { test: /^edellinen$/, cmd: { type: "previous" } },
  { test: /^previous$/, cmd: { type: "previous" } },
  { test: /^ohita$/, cmd: { type: "skip_exercise" } },
  { test: /^skip$/, cmd: { type: "skip_exercise" } },
];

/**
 * Parse normalized transcript into a single command, or null if nothing matched.
 */
export function parseWorkoutVoiceCommand(
  normalized: string,
): WorkoutVoiceCommand | null {
  if (!normalized) return null;

  const compound = tryWeightTimesReps(normalized);
  if (compound) return compound;

  for (const { test, cmd } of PHRASE_RULES) {
    if (test.test(normalized)) return cmd;
  }

  const w = tryWeight(normalized);
  if (w) return w;

  const r = tryReps(normalized);
  if (r) return r;

  const rpe = tryRpe(normalized);
  if (rpe) return rpe;

  return null;
}
