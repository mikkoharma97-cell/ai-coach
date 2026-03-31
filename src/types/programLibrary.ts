import type { Goal, ProgramPackageId, ProgramTrackId, TrainingVenue } from "@/types/coach";

export type ProgramLibraryVenueFilter = TrainingVenue | "any";

export type ProgramLibraryEntry = {
  id: string;
  nameFi: string;
  nameEn: string;
  goal: Goal;
  /** Näytön suodatus — ei kovaa lukitusta */
  level?: "beginner" | "intermediate" | "advanced" | "any";
  trainingVenue: ProgramLibraryVenueFilter;
  weeklyDays: { min: number; max: number };
  shortDescriptionFi: string;
  shortDescriptionEn: string;
  whyItFitsFi: string;
  whyItFitsEn: string;
  styleTag: string;
  /** Vastaa `ProgramPresetId` stringejä */
  presetId: string;
  linkedPackageId: ProgramPackageId;
  programTrackId: ProgramTrackId;
  /** Näytetään vain jos käyttäjä on Pro-tilassa */
  requiresProMode?: boolean;
};
