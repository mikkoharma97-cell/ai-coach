/**
 * Intensifier-politiikat ja sallitut tekniikat (konservatiivinen V1).
 */
export type IntensifierKind =
  | "drop_set"
  | "rest_pause"
  | "high_rep_pump"
  | "failure_last_set";

export type IntensifierPolicyId =
  | "conservative"
  | "balanced"
  | "performance"
  | "shift_friendly";

export type IntensifierResolution = {
  allowed: IntensifierKind[];
  avoided: IntensifierKind[];
  notesFi: string;
  notesEn: string;
};
