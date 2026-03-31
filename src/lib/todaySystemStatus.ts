/**
 * Today — yksi system status -rivi (kevyt heuristiikka datasta).
 * Signaalit: streak, makrot/kaloriveto, palautuminen (aktiviteetti), poikkeamat, väliin jäänyt treeni/ruoka.
 */
import { analyzeDailyCoachSignals } from "@/lib/coach/decisionEngine";
import { getGoalTimeline } from "@/lib/goalTimeline";
import { calendarDayKey } from "@/lib/dateKeys";
import { loadPlannedEvents } from "@/lib/eventsStorage";
import { getMondayBasedIndex } from "@/lib/plan";
import type { CoachDailyPlan, OnboardingAnswers } from "@/types/coach";
import type { Locale, MessageKey } from "@/lib/i18n";

type StatusInput = {
  profile: OnboardingAnswers;
  plan: CoachDailyPlan;
  referenceDate: Date;
  locale: Locale;
};

function eventsOnDate(referenceDate: Date) {
  const refKey = calendarDayKey(referenceDate);
  return loadPlannedEvents().filter((e) => e.dateKey === refKey);
}

export function computeTodaySystemStatusKey(input: StatusInput): MessageKey {
  const { priority, signals } = analyzeDailyCoachSignals({
    profile: input.profile,
    referenceDate: input.referenceDate,
    locale: input.locale,
    plan: input.plan,
  });
  const gt = getGoalTimeline(input.profile, input.referenceDate);
  const sys = input.plan.systemLine?.trim();
  const todayEvts = eventsOnDate(input.referenceDate);
  const disruptiveEvent = todayEvts.some(
    (e) => e.kind === "travel" || e.kind === "social",
  );
  const flexibleEvent = todayEvts.some((e) => e.kind === "flexible_intake");

  // Rytmi rikki — väliin jäänyt treeni, logattu skip, tai iso poikkeama tänään
  if (priority === "missed_train") return "today.systemStatus.rhythmBroken";
  if (signals.missedWorkoutLogged) return "today.systemStatus.rhythmBroken";
  if (disruptiveEvent) return "today.systemStatus.rhythmBroken";

  // Kuormitus korkea — aikataulupaine tai pitkä putki + kovat päivät
  if (priority === "timeline" && gt.paceKey === "goalTimeline.paceSteep") {
    return "today.systemStatus.loadHigh";
  }
  if (
    signals.streakN >= 5 &&
    !signals.isRestDay &&
    priority === "streak"
  ) {
    return "today.systemStatus.loadHigh";
  }

  // Korjaus käynnissä — drift, matala liike (palautuminen), lempeä aikataulu, jousto, adaptiivinen säätö
  if (priority === "calorie_drift") return "today.systemStatus.fixInProgress";
  if (priority === "activity_short") return "today.systemStatus.fixInProgress";
  if (flexibleEvent) return "today.systemStatus.fixInProgress";
  if (
    priority === "timeline" &&
    gt.paceKey === "goalTimeline.paceGentle"
  ) {
    return "today.systemStatus.fixInProgress";
  }
  if (sys) return "today.systemStatus.fixInProgress";

  // Hyvä kehitys — putki tai ok-tempo
  if (priority === "streak") return "today.systemStatus.goodProgress";
  if (priority === "timeline" && gt.paceKey === "goalTimeline.paceOk") {
    return "today.systemStatus.goodProgress";
  }

  if (priority === "rest_day") return "today.systemStatus.balanced";
  return "today.systemStatus.balanced";
}

/** A = linjassa, B = osin hajonnut / säätö, C = kova päivä / skip. */
function dayCloseVariant(input: StatusInput): "A" | "B" | "C" {
  const { priority, signals } = analyzeDailyCoachSignals({
    profile: input.profile,
    referenceDate: input.referenceDate,
    locale: input.locale,
    plan: input.plan,
  });
  const gt = getGoalTimeline(input.profile, input.referenceDate);
  const todayEvts = eventsOnDate(input.referenceDate);
  const disruptive = todayEvts.some(
    (e) => e.kind === "travel" || e.kind === "social",
  );

  if (priority === "missed_train" || signals.missedWorkoutLogged) return "C";
  if (disruptive) return "B";
  if (priority === "calorie_drift" || priority === "activity_short") return "B";
  if (priority === "timeline" && gt.paceKey === "goalTimeline.paceSteep") {
    return "B";
  }
  if (priority === "timeline" && gt.paceKey === "goalTimeline.paceGentle") {
    return "B";
  }
  return "A";
}

const HEADLINE: Record<"A" | "B" | "C", MessageKey> = {
  A: "today.dayClose.headlineA",
  B: "today.dayClose.headlineB",
  C: "today.dayClose.headlineC",
};
const FEELING: Record<"A" | "B" | "C", MessageKey> = {
  A: "today.dayClose.feelingA",
  B: "today.dayClose.feelingB",
  C: "today.dayClose.feelingC",
};
const TOMORROW: Record<"A" | "B" | "C", MessageKey> = {
  A: "today.dayClose.tomorrowA",
  B: "today.dayClose.tomorrowB",
  C: "today.dayClose.tomorrowC",
};

/** Päivän sulku: lause + tunne + suunta huomiseen + huomisen tease (vuorotellen). */
export function computeDayCloseRetentionKeys(input: StatusInput): {
  headlineKey: MessageKey;
  feelingKey: MessageKey;
  tomorrowKey: MessageKey;
  teaseKey: MessageKey;
} {
  const v = dayCloseVariant(input);
  const alt =
    (input.referenceDate.getDate() + getMondayBasedIndex(input.referenceDate)) %
      2 ===
    0;
  const teaseKey: MessageKey = alt
    ? "today.tomorrowTease.a"
    : "today.tomorrowTease.b";
  return {
    headlineKey: HEADLINE[v],
    feelingKey: FEELING[v],
    tomorrowKey: TOMORROW[v],
    teaseKey,
  };
}

/** Sama kuin retention-headline (vanha API). */
export function computeDayCloseCoachLineKey(input: StatusInput): MessageKey {
  return computeDayCloseRetentionKeys(input).headlineKey;
}
