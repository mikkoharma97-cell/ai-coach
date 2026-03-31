import type {
  Goal,
  ProgramBlueprintId,
  ProgramPackageId,
  ProgramTrackId,
  TrainingVenue,
} from "@/types/coach";

export type ProgramLibraryVenueFilter = TrainingVenue | "any";

/** Kirjaston tavoite = appin `Goal` (“fitness” → improve_fitness) */
export type ProgramLibraryGoal = Goal;

export type ProgramLevel = "beginner" | "intermediate" | "advanced" | "any";

/** Näyttö: gym / home / mixed (any → mixed) */
export type ProgramVenueUi = "gym" | "home" | "mixed";

export type ProgramStyleTag =
  | "busy"
  | "comeback"
  | "hypertrophy"
  | "fat_loss"
  | "foundation"
  | "performance"
  | "shift_friendly"
  | "minimal"
  | "home"
  | "split"
  | "pro"
  | "koti"
  | "kiire"
  | "aloitus"
  | "paluu"
  | "rytmi"
  | "sali"
  | "suoritus";

export type ProgramLibraryEntry = {
  id: string;
  nameFi: string;
  nameEn: string;
  goal: Goal;
  trainingVenue: ProgramLibraryVenueFilter;
  weeklyDays: { min: number; max: number };
  shortDescriptionFi: string;
  shortDescriptionEn: string;
  whyItFitsFi: string;
  whyItFitsEn: string;
  /** Lyhyt näyttötagi */
  styleTag: string;
  /** Laajennus: useita tageja (filtterit / kortti) */
  styleTags?: ProgramStyleTag[];
  level?: ProgramLevel;
  venueUi?: ProgramVenueUi;
  recommendedFor?: {
    busy?: boolean;
    comeback?: boolean;
    shiftWork?: boolean;
    lowFlexibility?: boolean;
  };
  /** Vastaa `ProgramPresetId` */
  presetId: string;
  linkedPackageId: ProgramPackageId;
  programTrackId: ProgramTrackId;
  programBlueprintId?: ProgramBlueprintId;
  requiresProMode?: boolean;
};
