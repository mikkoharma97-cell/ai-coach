/** Session flag: käyttäjä juuri viimeisteli treenin ja ohjataan /app:iin (ei tuplaa "valmis"-gatea). */

export const JUST_COMPLETED_WORKOUT_STORAGE_KEY = "justCompletedWorkout";

export function setJustCompletedWorkoutFlag(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(JUST_COMPLETED_WORKOUT_STORAGE_KEY, "1");
  } catch {
    /* quota / private mode */
  }
}

/**
 * Lukee ja poistaa flagin — kutsu kerran mountissa (Today).
 */
export function consumeJustCompletedWorkoutFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(JUST_COMPLETED_WORKOUT_STORAGE_KEY) === "1") {
      sessionStorage.removeItem(JUST_COMPLETED_WORKOUT_STORAGE_KEY);
      return true;
    }
  } catch {
    /* */
  }
  return false;
}
