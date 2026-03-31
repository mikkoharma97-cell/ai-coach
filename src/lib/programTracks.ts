/**
 * Ohjelmasuunnat — engine-kerros: rytmi, copy-vihjeet, kevyet aktiviteetti-/ravintoväännöt.
 */
import { resolveProgramTrackFromProfile } from "@/lib/profileProgramResolver";
import type {
  OnboardingAnswers,
  ProgramPackageId,
  ProgramTrackId,
} from "@/types/coach";
import { normalizeProgramPackageId } from "@/lib/programPackages";

export type ProgramTrackMeta = {
  id: ProgramTrackId;
  nameFi: string;
  nameEn: string;
  /** Lepoaskelten säätö (yhdistetään paketin deltaan) */
  activityStepDelta: number;
  /** Kerroin kaloriin (1 = neutraali) */
  kcalMultiplier: number;
  /** Progression intensiteetti ± */
  progressionIntensityDelta: number;
};

export const PROGRAM_TRACKS: ProgramTrackMeta[] = [
  {
    id: "basic_strength",
    nameFi: "Perusvoima",
    nameEn: "Basic strength",
    activityStepDelta: 0,
    kcalMultiplier: 1,
    progressionIntensityDelta: 0,
  },
  {
    id: "muscle_growth",
    nameFi: "Lihaskasvu",
    nameEn: "Muscle growth",
    activityStepDelta: 0,
    kcalMultiplier: 1.02,
    progressionIntensityDelta: 0,
  },
  {
    id: "light_fat_loss",
    nameFi: "Kevyt rasvanpoltto",
    nameEn: "Light fat loss",
    activityStepDelta: 200,
    kcalMultiplier: 0.98,
    progressionIntensityDelta: -1,
  },
  {
    id: "performance",
    nameFi: "Suorituskyky",
    nameEn: "Performance",
    activityStepDelta: 100,
    kcalMultiplier: 1.02,
    progressionIntensityDelta: 1,
  },
  {
    id: "daily_rhythm",
    nameFi: "Arjen rytmi",
    nameEn: "Daily rhythm",
    activityStepDelta: 0,
    kcalMultiplier: 1,
    progressionIntensityDelta: 0,
  },
  {
    id: "milestone_day",
    nameFi: "Hääprojekti / tavoitepäivä",
    nameEn: "Wedding / milestone day",
    activityStepDelta: 150,
    kcalMultiplier: 0.99,
    progressionIntensityDelta: 0,
  },
  {
    id: "returning",
    nameFi: "Paluu takaisin",
    nameEn: "Return to training",
    activityStepDelta: -100,
    kcalMultiplier: 1,
    progressionIntensityDelta: -1,
  },
  {
    id: "tight_block",
    nameFi: "Tiukka blokki",
    nameEn: "Tight block",
    activityStepDelta: 250,
    kcalMultiplier: 0.97,
    progressionIntensityDelta: 1,
  },
];

const DEFAULT_TRACK: ProgramTrackId = "daily_rhythm";

const PACKAGE_DEFAULT_TRACK: Record<ProgramPackageId, ProgramTrackId> = {
  steady_start: "returning",
  muscle_rhythm: "muscle_growth",
  light_cut: "light_fat_loss",
  performance_block: "performance",
};

export function normalizeProgramTrackId(
  id: string | null | undefined,
): ProgramTrackId {
  if (!id) return DEFAULT_TRACK;
  if (PROGRAM_TRACKS.some((t) => t.id === id)) {
    return id as ProgramTrackId;
  }
  return DEFAULT_TRACK;
}

export function defaultTrackForPackage(
  packageId: string | null | undefined,
): ProgramTrackId {
  const p = normalizeProgramPackageId(packageId);
  return PACKAGE_DEFAULT_TRACK[p] ?? DEFAULT_TRACK;
}

export function resolveProgramTrackId(answers: OnboardingAnswers): ProgramTrackId {
  if (answers.programTrackId) {
    return normalizeProgramTrackId(answers.programTrackId);
  }
  return resolveProgramTrackFromProfile(answers);
}

export function getProgramTrackMeta(
  id: ProgramTrackId,
): ProgramTrackMeta {
  return (
    PROGRAM_TRACKS.find((t) => t.id === id) ?? PROGRAM_TRACKS[4]
  );
}

export function trackActivityStepDelta(trackId: ProgramTrackId): number {
  return getProgramTrackMeta(trackId).activityStepDelta;
}

export function trackKcalMultiplier(trackId: ProgramTrackId): number {
  return getProgramTrackMeta(trackId).kcalMultiplier;
}

export function trackProgressionIntensityDelta(
  trackId: ProgramTrackId,
): number {
  return getProgramTrackMeta(trackId).progressionIntensityDelta;
}
