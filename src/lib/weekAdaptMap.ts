/**
 * Auto-adapt week view — how the system steers day-by-day (visual map).
 */
import { loadOffPlanMealsForDay } from "@/lib/food/offPlanStorage";
import { loadPlannedEvents } from "@/lib/eventsStorage";
import { dayKeyForMondayOffset, getMondayBasedIndex } from "@/lib/plan";
import { loadOutcomeHint } from "@/lib/storage";
import type { PlannedEvent, WeekDayEntry } from "@/types/coach";

export type WeekAdaptState =
  | "baseline"
  | "push"
  | "recovery"
  | "rebalance"
  | "exception"
  | "flexible";

export type WeekAdaptDay = {
  dayKey: string;
  state: WeekAdaptState;
  labelFi: string;
  labelEn: string;
};

function parseDayKey(dayKey: string): Date {
  const p = dayKey.split("-").map((x) => parseInt(x, 10));
  return new Date(p[0]!, p[1]! - 1, p[2]!);
}

const LABELS: Record<
  WeekAdaptState,
  { fi: string; en: string }
> = {
  baseline: { fi: "Runko", en: "Base" },
  push: { fi: "Kuorma", en: "Push" },
  recovery: { fi: "Palautuminen", en: "Recovery" },
  rebalance: { fi: "Tasapainoitus", en: "Rebalance" },
  exception: { fi: "Poikkeus", en: "Exception" },
  flexible: { fi: "Jousto", en: "Flex" },
};

export function buildWeekAdaptMap(input: {
  referenceDate: Date;
  weekDays: WeekDayEntry[];
  /** When set, the week is in active rebalance (system shifts load without breaking structure). */
  rebalanceActive: boolean;
}): WeekAdaptDay[] {
  const { referenceDate, weekDays, rebalanceActive } = input;
  const events = loadPlannedEvents();
  const todayIdx = getMondayBasedIndex(referenceDate);
  const out: WeekAdaptDay[] = [];

  for (let i = 0; i < 7; i++) {
    const dayKey = dayKeyForMondayOffset(referenceDate, i);
    const d = parseDayKey(dayKey);
    const entry = weekDays[i]!;
    const ev = events.find((e: PlannedEvent) => e.dateKey === dayKey);
    const hint = loadOutcomeHint(d) ?? {};
    const offN = loadOffPlanMealsForDay(d).length;

    let state: WeekAdaptState;

    if (ev?.kind === "travel" || ev?.kind === "social") {
      state = "exception";
    } else if (ev?.kind === "flexible_intake") {
      state = "flexible";
    } else if (
      offN > 0 ||
      hint.caloriesOver ||
      (rebalanceActive && (i === todayIdx || i === todayIdx + 1))
    ) {
      state = "rebalance";
    } else if (hint.skippedWorkout) {
      state = "recovery";
    } else if (entry.isRest) {
      state = "recovery";
    } else if (i > todayIdx) {
      state = "baseline";
    } else {
      state = "push";
    }

    const lab = LABELS[state];
    out.push({
      dayKey,
      state,
      labelFi: lab.fi,
      labelEn: lab.en,
    });
  }

  return out;
}
