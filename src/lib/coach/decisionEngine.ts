/**
 * Coach Decision Engine — tiivis päätös: yksi pääviesti + yksi suunta.
 */
import {
  buildAdaptiveUserState,
  computeYesterdayAdjustmentSignals,
} from "@/lib/adaptive";
import { calendarDayKey } from "@/lib/dateKeys";
import { getGoalTimeline } from "@/lib/goalTimeline";
import { getMondayBasedIndex } from "@/lib/plan";
import { getTodayGuidanceFromProfile } from "@/lib/packageGuidance";
import type {
  AdaptiveUserState,
  CoachPlan,
  OnboardingAnswers,
  RecentDayRecord,
} from "@/types/coach";
import type { GoalTimelineResult } from "@/lib/goalTimeline";
import type { Locale } from "@/lib/i18n";

export type DailyCoachDecisionInput = {
  profile: OnboardingAnswers;
  referenceDate: Date;
  locale: Locale;
  plan: CoachPlan;
  recentActivity?: RecentDayRecord[];
  goalTimeline?: GoalTimelineResult | null;
};

/** Yksi pääviesti + yksi suuntaviiva — ei pitkää listaa */
export type DailyCoachDecision = {
  mainMessageFi: string;
  mainMessageEn: string;
  directionFi: string;
  directionEn: string;
};

export type CoachSignalPriority =
  | "missed_train"
  | "calorie_drift"
  | "activity_short"
  | "timeline"
  | "streak"
  | "rest_day"
  | "default";

type SignalPriority = CoachSignalPriority;

function streakEndingYesterday(
  referenceDate: Date,
  recentDays: RecentDayRecord[],
): number {
  let n = 0;
  for (let i = 1; i <= 30; i++) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const k = calendarDayKey(d);
    const rec = recentDays.find((r) => r.dateKey === k);
    if (rec?.markedDone) n++;
    else break;
  }
  return n;
}

function timelinePressureShort(
  gt: ReturnType<typeof getGoalTimeline>,
): { mainFi: string; mainEn: string; dirFi: string; dirEn: string } | null {
  if (!gt.hasTarget || gt.paceKey === "goalTimeline.noTarget") return null;
  if (gt.paceKey === "goalTimeline.paceSteep") {
    return {
      mainFi: "Liikaa kuormaa alkuviikossa — pidetään tänään maltillisena.",
      mainEn: "Heavy load early in the week — keep today lighter.",
      dirFi: "Rytmi ennen sprinttiä: yksi askel kerrallaan.",
      dirEn: "Rhythm before sprint: one step at a time.",
    };
  }
  if (gt.paceKey === "goalTimeline.paceOk") {
    return {
      mainFi: "Tahti näyttää kestävältä — tämä päivä tukee pitkää linjaa.",
      mainEn: "The pace looks sustainable — today supports the long line.",
      dirFi: "Treeni ja ruoka samassa rytmissä.",
      dirEn: "Training and food in the same rhythm.",
    };
  }
  if (gt.paceKey === "goalTimeline.paceGentle") {
    return {
      mainFi: "Tavoite vaatii hieman tiukempaa rytmiä — ei paniikkia, vaan johdonmukaisuutta.",
      mainEn: "The goal needs a slightly tighter rhythm — consistency, not panic.",
      dirFi: "Pidä päivä hallittuna; vältä kompensaatiopäiviä.",
      dirEn: "Keep the day controlled; skip compensation swings.",
    };
  }
  if (gt.paceKey === "goalTimeline.weeksOnly") {
    return {
      mainFi: "Rakennetaan viikkoja kohti tavoitepäivää.",
      mainEn: "Building week by week toward your date.",
      dirFi: "Pieni eteneminen riittää tänään.",
      dirEn: "Small progress is enough today.",
    };
  }
  return null;
}

function resolvePriority(
  sig: ReturnType<typeof computeYesterdayAdjustmentSignals>,
  isRestDay: boolean,
  streakN: number,
  hasTimelineMsg: boolean,
): SignalPriority {
  if (sig.missedTrainingDay) return "missed_train";
  if (sig.calorieDrift) return "calorie_drift";
  if (sig.activityShortfall) return "activity_short";
  if (hasTimelineMsg) return "timeline";
  if (streakN >= 3) return "streak";
  if (isRestDay) return "rest_day";
  return "default";
}

export function trimCoachCopy(text: string, maxSentences: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  const parts = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length > maxSentences) {
    return parts.slice(0, maxSentences).join(" ").trim();
  }
  if (normalized.length > 220) {
    return `${normalized.slice(0, 217).trim()}…`;
  }
  return normalized;
}

export function getDailyCoachDecision(
  input: DailyCoachDecisionInput,
): DailyCoachDecision {
  const { profile, referenceDate, plan } = input;
  const baseState = buildAdaptiveUserState(profile, referenceDate);
  const userState: AdaptiveUserState =
    input.recentActivity != null
      ? { ...baseState, recentDays: input.recentActivity }
      : baseState;
  const sig = computeYesterdayAdjustmentSignals(userState, plan);
  const todayIdx = getMondayBasedIndex(referenceDate);
  const todayEntry = plan.weeklyPlan.days[todayIdx];
  const isRestDay = Boolean(todayEntry?.isRest);

  const g = getTodayGuidanceFromProfile(profile, input.locale);
  const gEn = getTodayGuidanceFromProfile(profile, "en");

  const gt =
    input.goalTimeline !== undefined
      ? input.goalTimeline ?? {
          hasTarget: false,
          paceKey: "goalTimeline.noTarget" as const,
        }
      : getGoalTimeline(profile, referenceDate);
  const timelineShort = timelinePressureShort(gt);

  const streakN = streakEndingYesterday(referenceDate, userState.recentDays);

  const priority = resolvePriority(
    sig,
    isRestDay,
    streakN,
    Boolean(timelineShort),
  );

  let mainFi: string;
  let mainEn: string;
  let dirFi: string;
  let dirEn: string;

  switch (priority) {
    case "missed_train":
      mainFi = "Eilen jäi väliin — tänään riittää että palaat rytmiin.";
      mainEn = "Yesterday slipped — today, just get back in rhythm.";
      dirFi = "Treeni hallittuna · ruoka tutulla kaavalla.";
      dirEn = "Training controlled · food on a familiar pattern.";
      break;
    case "calorie_drift":
      mainFi = "Eilisessä oli poikkeama — tänään tasainen päivä, ei kompensaatiota.";
      mainEn = "Yesterday drifted — today is steady, not payback.";
      dirFi = "Proteiini ankkurina · vältä jyrkkää kiristystä.";
      dirEn = "Protein as anchor · skip harsh tightening.";
      break;
    case "activity_short":
      mainFi = "Askeleet jäivät mataliksi — lisää kevyttä liikettä ilman suorituspaineita.";
      mainEn = "Steps were low — add light movement without pressure.";
      dirFi = "Kävely tai kevyt kävely päivän sisään.";
      dirEn = "A walk or easy movement fits the day.";
      break;
    case "timeline":
      if (timelineShort) {
        mainFi = timelineShort.mainFi;
        mainEn = timelineShort.mainEn;
        dirFi = timelineShort.dirFi;
        dirEn = timelineShort.dirEn;
      } else {
        mainFi = `${g.todayKicker} Yksi selkeä askel riittää.`;
        mainEn = `${gEn.todayKicker} One clear step is enough.`;
        dirFi = "Tavoite mielessä · ei kiirettä.";
        dirEn = "Goal in mind · no rush.";
      }
      break;
    case "streak":
      mainFi = "Hyvä putki — pidä se kevyenä mutta kasassa.";
      mainEn = "Solid streak — keep it light but honest.";
      dirFi = "Älä nosta kuormaa turhaan tänään.";
      dirEn = "Don’t add load for no reason today.";
      break;
    case "rest_day":
      mainFi = "Lepo on osa ohjelmaa — anna hermostolle tilaa.";
      mainEn = "Rest is part of the plan — give your system room.";
      dirFi = "Kevyt kävely tai mobiliteetti riittää.";
      dirEn = "A light walk or mobility is enough.";
      break;
    default:
      mainFi = `${g.todayKicker} Tänään yksi askel kerrallaan.`;
      mainEn = `${gEn.todayKicker} One step at a time today.`;
      dirFi = "Treeni ja arki samaan suuntaan.";
      dirEn = "Training and daily life aligned.";
  }

  if (profile.goal === "lose_weight" && priority === "default" && !isRestDay) {
    mainFi = trimCoachCopy(`${mainFi} Energia ja liike kulkevat samaan suuntaan.`, 2);
    mainEn = trimCoachCopy(`${mainEn} Energy and movement pull the same way.`, 2);
  }

  return {
    mainMessageFi: trimCoachCopy(mainFi, 2),
    mainMessageEn: trimCoachCopy(mainEn, 2),
    directionFi: trimCoachCopy(dirFi, 2),
    directionEn: trimCoachCopy(dirEn, 2),
  };
}

/** Analyysi — Coach V2 ja testit. */
export function analyzeDailyCoachSignals(
  input: DailyCoachDecisionInput,
): {
  priority: CoachSignalPriority;
  signals: {
    missedTrainingDay: boolean;
    missedWorkoutLogged: boolean;
    calorieDrift: boolean;
    activityShortfall: boolean;
    isRestDay: boolean;
    streakN: number;
    hasTimelineMsg: boolean;
  };
} {
  const { profile, referenceDate, plan } = input;
  const baseState = buildAdaptiveUserState(profile, referenceDate);
  const userState: AdaptiveUserState =
    input.recentActivity != null
      ? { ...baseState, recentDays: input.recentActivity }
      : baseState;
  const sig = computeYesterdayAdjustmentSignals(userState, plan);
  const todayIdx = getMondayBasedIndex(referenceDate);
  const todayEntry = plan.weeklyPlan.days[todayIdx];
  const isRestDay = Boolean(todayEntry?.isRest);
  const gt =
    input.goalTimeline !== undefined
      ? input.goalTimeline ?? {
          hasTarget: false,
          paceKey: "goalTimeline.noTarget" as const,
        }
      : getGoalTimeline(profile, referenceDate);
  const timelineShort = timelinePressureShort(gt);
  const streakN = streakEndingYesterday(referenceDate, userState.recentDays);
  const priority = resolvePriority(
    sig,
    isRestDay,
    streakN,
    Boolean(timelineShort),
  );
  return {
    priority,
    signals: {
      missedTrainingDay: sig.missedTrainingDay,
      missedWorkoutLogged: sig.missedWorkoutLogged,
      calorieDrift: sig.calorieDrift,
      activityShortfall: sig.activityShortfall,
      isRestDay,
      streakN,
      hasTimelineMsg: Boolean(timelineShort),
    },
  };
}
