/**
 * Vuorotyömukautus V1 — käytännön valmennuslogiikkaa, ei lääketieteellistä mallia.
 * Kalenteri-/mallitoisto: myöhemmin; tässä vain päivätason päätökset.
 */
import { calendarDayKey } from "@/lib/dateKeys";
import type { CoachSignalPriority } from "@/lib/coach/decisionEngine";
import type { CoachDailyPlan, TodayWithAdjustments } from "@/types/coach";
import type { Locale, MessageKey } from "@/lib/i18n";
import { translate } from "@/lib/i18n";
import { normalizeShiftDateKey } from "@/lib/workShiftStorage";
import type { WorkShiftEntry, WorkShiftType } from "@/types/workShifts";

const SHIFT_COACH_PRIORITIES: CoachSignalPriority[] = [
  "default",
  "rest_day",
  "streak",
  "timeline",
  "activity_short",
];

export function findShiftEntryForDate(
  entries: WorkShiftEntry[],
  ref: Date,
): WorkShiftEntry | null {
  const k = calendarDayKey(ref);
  return (
    entries.find((e) => normalizeShiftDateKey(e.date) === k) ?? null
  );
}

type ShiftMeta = NonNullable<CoachDailyPlan["shiftToday"]>;

function badgeKeyFor(st: WorkShiftType): MessageKey {
  const m: Record<WorkShiftType, MessageKey> = {
    morning: "shift.badge.morning",
    evening: "shift.badge.evening",
    night: "shift.badge.night",
    off: "shift.badge.off",
  };
  return m[st];
}

/**
 * Sovella vuorokerros päivän säätöihin — ajetaan `generateDailyAdjustments` jälkeen.
 */
export function applyShiftLayerToAdjustments(
  adjusted: TodayWithAdjustments,
  locale: Locale,
  ref: Date,
  entries: WorkShiftEntry[],
): { merged: TodayWithAdjustments; shiftToday: ShiftMeta | null } {
  const ent = findShiftEntryForDate(entries, ref);
  if (!ent) {
    return { merged: adjusted, shiftToday: null };
  }

  const st = ent.shiftType;
  const sep = locale === "en" ? " " : " ";
  let { todayWorkout, todayFoodTask, todayActivityTask, systemLine } =
    adjusted;

  const foodPrefix = translate(locale, `shift.food.${st}` as MessageKey);
  const workoutPrefix = translate(locale, `shift.workout.${st}` as MessageKey);
  const activityPrefix = translate(locale, `shift.activity.${st}` as MessageKey);

  todayFoodTask = `${foodPrefix}${sep}${todayFoodTask}`;
  todayWorkout = `${workoutPrefix}${sep}${todayWorkout}`;
  todayActivityTask = `${activityPrefix}${sep}${todayActivityTask}`;

  const sysKey = `shift.sys.${st}` as MessageKey;
  const shiftSys = translate(locale, sysKey);
  if (systemLine?.trim()) {
    systemLine = `${shiftSys}${locale === "en" ? " — " : " — "}${systemLine}`;
  } else {
    systemLine = shiftSys;
  }

  return {
    merged: {
      todayWorkout,
      todayFoodTask,
      todayActivityTask,
      systemLine,
    },
    shiftToday: {
      shiftType: st,
      badgeKey: badgeKeyFor(st),
      rationaleKey: "shift.rationale.line",
    },
  };
}

export function mergeShiftCoachHero(
  priority: CoachSignalPriority,
  shift: ShiftMeta | null | undefined,
  mainFi: string,
  mainEn: string,
  dirFi: string,
  dirEn: string,
): { mainFi: string; mainEn: string; dirFi: string; dirEn: string } {
  if (!shift || !SHIFT_COACH_PRIORITIES.includes(priority)) {
    return { mainFi, mainEn, dirFi, dirEn };
  }
  const t = shift.shiftType;
  return {
    mainFi: translate("fi", `shift.coach.main.${t}` as MessageKey),
    mainEn: translate("en", `shift.coach.main.${t}` as MessageKey),
    dirFi: translate("fi", `shift.coach.dir.${t}` as MessageKey),
    dirEn: translate("en", `shift.coach.dir.${t}` as MessageKey),
  };
}
