/**
 * Yhtenäiset client-tapahtumat — sama malli kuin aiemmat CustomEvent-navigoinnit.
 */

/** Session-loki + set-lokit (workoutStore) — sama tapahtuma */
export const WORKOUT_LOG_CHANGED = "coach-workout-log-changed";

export const FOOD_LOG_CHANGED = "coach-food-log-changed";

export const TODAY_STATE_CHANGED = "coach-today-state-changed";

export function emitCoachEvent(name: string, detail?: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      detail !== undefined
        ? new CustomEvent(name, { detail })
        : new CustomEvent(name),
    );
  } catch {
    /* */
  }
}

export function subscribeCoachEvent(
  name: string,
  callback: (ev: Event) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const fn = callback as EventListener;
  window.addEventListener(name, fn);
  return () => window.removeEventListener(name, fn);
}
