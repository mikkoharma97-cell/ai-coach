/** Jaetut tyypit profiili → ohjelmarunko -kartoitukseen */

export type WeeklyStructureType =
  | "foundation"
  | "rhythm"
  | "upper_lower"
  | "split"
  | "performance"
  | "shift";

export type CoachingToneBias = "supportive" | "direct" | "performance";
export type RecoverySensitivity = "low" | "medium" | "high";
export type ProgramComplexity = "foundation" | "intermediate" | "advanced";
export type ScheduleBias = "regular" | "shift" | "busy";
