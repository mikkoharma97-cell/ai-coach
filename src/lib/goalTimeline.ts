/**
 * Tavoiteaikajana — maltillinen, ei takuita.
 */
import type { OnboardingAnswers } from "@/types/coach";

export type GoalTimelinePaceKey =
  | "goalTimeline.noTarget"
  | "goalTimeline.weeksOnly"
  | "goalTimeline.paceOk"
  | "goalTimeline.paceGentle"
  | "goalTimeline.paceSteep";

export type GoalTimelineResult = {
  hasTarget: boolean;
  weeksTotal?: number;
  /** kg/vko, vain jos lähtö- ja tavoitepaino molemmat */
  impliedWeeklyKg?: number;
  paceKey: GoalTimelinePaceKey;
};

const MS_DAY = 86_400_000;
/** Yleinen maltillinen yläraja laihdutusvauhdille viestinnässä (ei lääketieteellinen neuvo) */
const MAX_WEEKLY_LOSS_KG = 0.55;

function parseISODate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

export function getGoalTimeline(
  profile: OnboardingAnswers,
  referenceDate: Date = new Date(),
): GoalTimelineResult {
  const targetDate = profile.targetDate?.trim();
  const tw = profile.targetWeight;
  if (!targetDate || tw == null || Number.isNaN(tw)) {
    return { hasTarget: false, paceKey: "goalTimeline.noTarget" };
  }

  const end = parseISODate(targetDate);
  if (!end) {
    return { hasTarget: false, paceKey: "goalTimeline.noTarget" };
  }

  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const days = Math.ceil((end.getTime() - start.getTime()) / MS_DAY);
  if (days < 7) {
    return {
      hasTarget: true,
      weeksTotal: 1,
      paceKey: "goalTimeline.weeksOnly",
    };
  }

  const weeksTotal = Math.max(1, Math.round(days / 7));
  const cw = profile.currentWeight;
  const goal = profile.goal;

  if (
    cw != null &&
    !Number.isNaN(cw) &&
    goal === "lose_weight" &&
    cw > tw
  ) {
    const totalKg = cw - tw;
    const impliedWeeklyKg = totalKg / weeksTotal;
    if (impliedWeeklyKg <= MAX_WEEKLY_LOSS_KG && impliedWeeklyKg > 0) {
      return {
        hasTarget: true,
        weeksTotal,
        impliedWeeklyKg: Math.round(impliedWeeklyKg * 100) / 100,
        paceKey: "goalTimeline.paceOk",
      };
    }
    if (impliedWeeklyKg > MAX_WEEKLY_LOSS_KG) {
      return {
        hasTarget: true,
        weeksTotal,
        impliedWeeklyKg: Math.round(impliedWeeklyKg * 100) / 100,
        paceKey: "goalTimeline.paceSteep",
      };
    }
  }

  if (goal === "build_muscle" && cw != null && tw > cw) {
    const totalKg = tw - cw;
    const impliedWeeklyKg = totalKg / weeksTotal;
    return {
      hasTarget: true,
      weeksTotal,
      impliedWeeklyKg: Math.round(impliedWeeklyKg * 100) / 100,
      paceKey:
        impliedWeeklyKg > 0.35
          ? "goalTimeline.paceGentle"
          : "goalTimeline.paceOk",
    };
  }

  return {
    hasTarget: true,
    weeksTotal,
    paceKey: "goalTimeline.weeksOnly",
  };
}
