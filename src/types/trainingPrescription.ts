import type { ProgressionStyle } from "@/lib/training/progression";
import type { IntensifierKind } from "@/types/intensifierRules";

export type LoadBias = "heavy" | "moderate" | "light";

export type ProgressionRuleId =
  | "linear_load"
  | "double_progression"
  | "volume_first"
  | "deload_wave";

export type TrainingPrescription = {
  sets: number;
  repsLabelFi: string;
  repsLabelEn: string;
  targetRepRange: { min: number; max: number };
  loadBias: LoadBias;
  effortLabelFi: string;
  effortLabelEn: string;
  effortRpe: string;
  rest: string;
  progressionStyle: ProgressionStyle;
  progressionRule: ProgressionRuleId;
  allowedIntensifiers: IntensifierKind[];
  prescriptionLineFi: string | null;
  prescriptionLineEn: string | null;
};
