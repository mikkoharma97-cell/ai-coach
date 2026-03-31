/**
 * Poikkeustilat — "elämä tapahtui" -valinnat (ei diagnooseja).
 */

export type ExceptionSeverity = "light" | "clear" | "bad";

export type ExceptionGroupId =
  | "health_feeling"
  | "load_recovery"
  | "life_schedule"
  | "progress_results";

export type ExceptionId =
  | "sick"
  | "poor_sleep"
  | "high_stress"
  | "travel"
  | "no_gym"
  | "skipped_session"
  | "multi_skip"
  | "food_chaos"
  | "no_appetite"
  | "shoulder"
  | "knee"
  | "back"
  | "strain_upper"
  | "strain_lower"
  | "weight_stuck"
  | "weight_fast"
  | "strength_down"
  | "poor_recovery";

/** Yksi valinta + vakavuus, sidottu kalenteripäivään. */
export type ActiveExceptionState = {
  id: ExceptionId;
  severity: ExceptionSeverity;
  /** YYYY-M-D — sama kuin dayKeyFromDate */
  dayKey: string;
};

export type ExceptionGuidanceStrings = {
  training: string;
  food: string;
  recovery: string;
  /** Kesto / milloin tarkistetaan uudelleen */
  durationCheck: string;
  coachNote: string;
};
