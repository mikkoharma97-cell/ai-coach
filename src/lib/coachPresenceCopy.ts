/**
 * Valmentajan läsnäolo — lyhyet linjat, deterministinen valinta ilman raskasta logiikkaa.
 */
import type { MessageKey } from "@/lib/i18n";

/** Päiväavaimen hash (0–n) */
export function dayKeyHash(dayKey: string): number {
  let h = 0;
  for (let i = 0; i < dayKey.length; i++) {
    h = (h * 31 + dayKey.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const TODAY_COACH_VOICE_KEYS = [
  "today.coachVoice.direct",
  "today.coachVoice.simple",
  "today.coachVoice.third",
] as const satisfies readonly MessageKey[];

export function todayCoachVoiceKey(dayKey: string): MessageKey {
  return TODAY_COACH_VOICE_KEYS[dayKeyHash(dayKey) % TODAY_COACH_VOICE_KEYS.length]!;
}

export function progressInterpretationKey(input: {
  combinedStreakDays: number;
  consistencyPct: number;
}): MessageKey {
  if (input.consistencyPct >= 72 && input.combinedStreakDays >= 5) {
    return "progress.coachPresence.works";
  }
  if (input.consistencyPct < 45) {
    return "progress.coachPresence.uneven";
  }
  return "progress.coachPresence.rhythm";
}

export function foodCoachLineKey(input: {
  rebalanceActive: boolean;
  dayKey: string;
}): MessageKey {
  if (input.rebalanceActive) {
    return "food.coachPresence.rhythmNotPerfect";
  }
  return dayKeyHash(input.dayKey) % 3 === 0
    ? "food.coachPresence.enoughToday"
    : dayKeyHash(input.dayKey) % 3 === 1
      ? "food.coachPresence.dontOverthink"
      : "food.coachPresence.keepRhythm";
}

export function reviewClosingLineKey(dayKey: string): MessageKey {
  return dayKeyHash(dayKey) % 2 === 0
    ? "review.closing.notPerfect"
    : "review.closing.direction";
}

export function workoutCoachNudgeKey(completedSoFar: number, seed: number): MessageKey {
  const keys: MessageKey[] = [
    "workout.coachNudge.nextSet",
    "workout.coachNudge.control",
    "workout.coachNudge.slow",
  ];
  return keys[(completedSoFar + seed) % 3]!;
}

export function countCompletedSets(rows: { sets: { completed?: boolean }[] }[]): number {
  return rows.reduce(
    (s, ex) => s + ex.sets.filter((x) => x.completed).length,
    0,
  );
}

export function totalSetsCount(rows: { sets: unknown[] }[]): number {
  return rows.reduce((s, ex) => s + ex.sets.length, 0);
}
