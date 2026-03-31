/**
 * Liikeluokitus — moottorin päätökset (ei satunnaista valintaa).
 */
export type MovementPattern =
  | "squat"
  | "hinge"
  | "horizontal_push"
  | "vertical_push"
  | "horizontal_pull"
  | "vertical_pull"
  | "lunge"
  | "core"
  | "carry"
  | "conditioning";

export type TrainingClass =
  | "compound_strength"
  | "compound_hypertrophy"
  | "machine_hypertrophy"
  | "isolation"
  | "accessory"
  | "skill_or_power"
  | "conditioning_finisher";

export type FatigueCost = "low" | "medium" | "high";

export type EquipmentModality =
  | "free_weight"
  | "machine"
  | "cable"
  | "bodyweight";

export type RecoveryDemand = "low" | "medium" | "high";

export type ExerciseClassification = {
  movementPattern: MovementPattern;
  trainingClass: TrainingClass;
  fatigueCost: FatigueCost;
  beginnerFriendly: boolean;
  modality: EquipmentModality;
  rotationGroup: string;
  recoveryDemand: RecoveryDemand;
  suitableForDropset: boolean;
  suitableForRestPause: boolean;
  suitableForHighRepPump: boolean;
};
