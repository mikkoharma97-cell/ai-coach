/**
 * Coach Decision Engine v2 — v1 + profiilin rajoitteet + ohjelmarata,
 * tiivis ulostulo (main + direction).
 */
import {
  analyzeDailyCoachSignals,
  getDailyCoachDecision,
  trimCoachCopy,
  type CoachSignalPriority,
  type DailyCoachDecision,
  type DailyCoachDecisionInput,
} from "@/lib/coach/decisionEngine";
import { resolveProgramTrackId } from "@/lib/programTracks";
import type { ProgramTrackId } from "@/types/coach";
import type { LimitationTag } from "@/types/exercise";

export type CoachDecisionSignals = {
  missedTrainingDay: boolean;
  missedWorkoutLogged: boolean;
  calorieDrift: boolean;
  activityShortfall: boolean;
  isRestDay: boolean;
  streakN: number;
  hasTimelineMsg: boolean;
};

export type CoachDecisionV2 = DailyCoachDecision & {
  engineVersion: "v2";
  priority: CoachSignalPriority;
  signals: CoachDecisionSignals;
  programTrackId: ProgramTrackId;
};

function limitationDirectionSuffix(
  tags: LimitationTag[] | undefined,
): { fi: string; en: string } | null {
  if (!tags?.length) return null;
  return {
    fi: "Rajoitteet ohjaavat liikevalintoja.",
    en: "Your limits guide exercise picks.",
  };
}

function trackDirectionSuffix(
  trackId: ProgramTrackId,
  priority: CoachSignalPriority,
  isRestDay: boolean,
): { fi: string; en: string } | null {
  if (isRestDay || priority !== "default") return null;
  const m: Partial<Record<ProgramTrackId, { fi: string; en: string }>> = {
    muscle_growth: {
      fi: "Kasvurata — volyymi maltillisesti ylös.",
      en: "Growth track — volume up gradually.",
    },
    light_fat_loss: {
      fi: "Kevyt rytmi — energia ensin.",
      en: "Light rhythm — energy first.",
    },
    performance: {
      fi: "Suorituskyky — laatu ennen määrää.",
      en: "Performance — quality before quantity.",
    },
    returning: {
      fi: "Paluu — pienet askeleet.",
      en: "Return — small steps.",
    },
    milestone_day: {
      fi: "Tavoitepäivä — johdonmukaisuus.",
      en: "Milestone ahead — consistency.",
    },
    tight_block: {
      fi: "Tiukka blokki — uni ja ruoka kantavat.",
      en: "Tight block — sleep and food carry you.",
    },
  };
  return m[trackId] ?? null;
}

export function getDailyCoachDecisionV2(
  input: DailyCoachDecisionInput,
): CoachDecisionV2 {
  const base = getDailyCoachDecision(input);
  const { priority, signals } = analyzeDailyCoachSignals(input);
  const programTrackId = resolveProgramTrackId(input.profile);

  let directionFi = base.directionFi;
  let directionEn = base.directionEn;

  const lim = limitationDirectionSuffix(input.profile.limitations);
  if (lim && !signals.isRestDay) {
    directionFi = `${directionFi} ${lim.fi}`;
    directionEn = `${directionEn} ${lim.en}`;
  }

  const tr = trackDirectionSuffix(programTrackId, priority, signals.isRestDay);
  if (tr) {
    directionFi = `${directionFi} ${tr.fi}`;
    directionEn = `${directionEn} ${tr.en}`;
  }

  return {
    mainMessageFi: trimCoachCopy(base.mainMessageFi, 2),
    mainMessageEn: trimCoachCopy(base.mainMessageEn, 2),
    directionFi: trimCoachCopy(directionFi, 2),
    directionEn: trimCoachCopy(directionEn, 2),
    engineVersion: "v2",
    priority,
    signals,
    programTrackId,
  };
}
