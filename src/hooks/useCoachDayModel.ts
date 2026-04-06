"use client";

import { useClientProfile } from "@/hooks/useClientProfile";
import { useTranslation } from "@/hooks/useTranslation";
import {
  buildCoachDailyPlanForSession,
  normalizeProfileForEngine,
} from "@/lib/coach";
import {
  FOOD_LOG_CHANGED,
  subscribeCoachEvent,
  TODAY_STATE_CHANGED,
} from "@/lib/coachEvents";
import { resolveCoachDayModel, type CoachDayModel } from "@/lib/coachEngine";
import { dayKeyFromDate, normalizeDayKey } from "@/lib/dateKey";
import { getMondayBasedIndex } from "@/lib/plan";
import type { Locale } from "@/lib/i18n";
import { loadFoodLog } from "@/lib/foodStorage";
import type { FoodLogItem } from "@/types/coach";
import { isDayMarkedDone } from "@/lib/storage";
import { hasSetLogsForDay } from "@/lib/workoutStore";
import { loadWorkoutSessions, WORKOUT_LOG_CHANGED } from "@/lib/workoutLogStorage";
import {
  EXCEPTION_STATE_CHANGED,
  loadActiveExceptionForDay,
} from "@/lib/exceptionStorage";
import {
  MINIMUM_DAY_CHANGED,
  loadMinimumDayForDay,
} from "@/lib/minimumDayStorage";
import {
  clearFeedbackForDay,
  loadTodayFlowRecord,
  TODAY_FLOW_CHANGED,
} from "@/lib/todayFlowStorage";
import type { TodayFlowUiState } from "@/lib/todayFlowStorage";
import { isFoodOnlyMode } from "@/lib/appUsageMode";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function resolveTodayFlowUi(args: {
  isDayDone: boolean;
  hasWorkoutLog: boolean;
  isRest: boolean;
  foodOnly: boolean;
  dayKey: string;
}): TodayFlowUiState {
  const { isDayDone, hasWorkoutLog, isRest, foodOnly, dayKey } = args;
  if (isDayDone) return "completed";
  const rec = loadTodayFlowRecord(dayKey);
  if (rec?.flowState === "skipped") return "skipped";
  if (foodOnly || isRest) {
    if (rec?.primaryTapped) return "in_progress";
    return "not_started";
  }
  if (hasWorkoutLog) return "in_progress";
  if (rec?.flowState === "in_progress" || rec?.primaryTapped) {
    return "in_progress";
  }
  return "not_started";
}

export type UseCoachDayModelResult = {
  coachDayModel: CoachDayModel | null;
  resolvedFlow: TodayFlowUiState;
  dayKeyToday: string;
  flowRecord: ReturnType<typeof loadTodayFlowRecord>;
  /** Päivittyy flow/storage -tapahtumissa — käytä riippuvuutena kun luet storagea */
  flowTick: number;
  isCompleted: boolean;
  isRestDay: boolean;
  foodOnly: boolean;
  hasWorkoutLoggedToday: boolean;
  hasSetLogsToday: boolean;
  foodLogs: FoodLogItem[];
  plan: ReturnType<typeof buildCoachDailyPlanForSession> | null;
  todayIdx: number;
};

/**
 * Yhteinen päivämalli Today / Workout / Food — sama syöte kuin Todaylla.
 * `justFinishedWorkoutSession`: vain Today välittää totuuden (consume-flag), muut false.
 */
export function useCoachDayModel(options: {
  justFinishedWorkoutSession: boolean;
}): UseCoachDayModelResult {
  const { justFinishedWorkoutSession } = options;
  const { t, locale } = useTranslation();
  const pathname = usePathname();
  const profile = useClientProfile();
  const [now] = useState(() => new Date());
  const [isCompleted, setIsCompleted] = useState(() => isDayMarkedDone(now));
  const [workoutLogTick, setWorkoutLogTick] = useState(0);
  const [flowTick, setFlowTick] = useState(0);
  const [coachDataTick, setCoachDataTick] = useState(0);

  useEffect(() => {
    setIsCompleted(isDayMarkedDone(now));
  }, [now, pathname]);

  useEffect(() => {
    const bump = () => setCoachDataTick((x) => x + 1);
    const u1 = subscribeCoachEvent(FOOD_LOG_CHANGED, bump);
    const u2 = subscribeCoachEvent(TODAY_STATE_CHANGED, bump);
    return () => {
      u1();
      u2();
    };
  }, []);

  const dayKeyToday = useMemo(() => dayKeyFromDate(now), [now]);

  useEffect(() => {
    const up = () => setWorkoutLogTick((x) => x + 1);
    window.addEventListener(WORKOUT_LOG_CHANGED, up);
    return () => window.removeEventListener(WORKOUT_LOG_CHANGED, up);
  }, []);

  useEffect(() => {
    const bump = () => setFlowTick((x) => x + 1);
    window.addEventListener(TODAY_FLOW_CHANGED, bump);
    window.addEventListener(MINIMUM_DAY_CHANGED, bump);
    window.addEventListener(EXCEPTION_STATE_CHANGED, bump);
    return () => {
      window.removeEventListener(TODAY_FLOW_CHANGED, bump);
      window.removeEventListener(MINIMUM_DAY_CHANGED, bump);
      window.removeEventListener(EXCEPTION_STATE_CHANGED, bump);
    };
  }, []);

  useEffect(() => {
    const r = loadTodayFlowRecord(dayKeyToday);
    if (r?.feedbackUntil && Date.now() > r.feedbackUntil) {
      clearFeedbackForDay(dayKeyToday);
      setFlowTick((x) => x + 1);
    }
  }, [dayKeyToday, flowTick]);

  const normalizedProfile = useMemo(
    () => (profile ? normalizeProfileForEngine(profile) : null),
    [profile],
  );

  const activeException = useMemo(
    () => loadActiveExceptionForDay(dayKeyToday),
    [dayKeyToday, flowTick],
  );

  const minimumDayActive = useMemo(
    () => loadMinimumDayForDay(dayKeyToday),
    [dayKeyToday, flowTick],
  );

  const plan = useMemo(() => {
    if (!normalizedProfile) return null;
    return buildCoachDailyPlanForSession({
      profile: normalizedProfile,
      now,
      locale,
      activeException,
      minimumDayActive,
    });
  }, [normalizedProfile, now, locale, activeException, minimumDayActive]);

  const todayIdx = useMemo(() => getMondayBasedIndex(now), [now]);

  const isRestDay = useMemo(() => {
    if (!plan) return true;
    return Boolean(plan.weeklyPlan.days[todayIdx]?.isRest);
  }, [plan, todayIdx]);

  const foodOnly = Boolean(profile && isFoodOnlyMode(profile));

  const hasWorkoutLoggedToday = useMemo(() => {
    void workoutLogTick;
    void coachDataTick;
    const dk = normalizeDayKey(dayKeyToday);
    return loadWorkoutSessions().some(
      (s) => normalizeDayKey(s.dayKey) === dk,
    );
  }, [dayKeyToday, workoutLogTick, coachDataTick]);

  const hasSetLogsToday = useMemo(() => {
    void coachDataTick;
    void workoutLogTick;
    return hasSetLogsForDay(dayKeyToday);
  }, [dayKeyToday, coachDataTick, workoutLogTick]);

  const foodLogs = useMemo(() => {
    void workoutLogTick;
    void flowTick;
    void coachDataTick;
    return loadFoodLog(now);
  }, [now, workoutLogTick, flowTick, coachDataTick]);

  const flowRecord = useMemo(
    () => loadTodayFlowRecord(dayKeyToday),
    [dayKeyToday, flowTick],
  );

  const resolvedFlow = useMemo(
    () =>
      resolveTodayFlowUi({
        isDayDone: isCompleted,
        hasWorkoutLog: hasWorkoutLoggedToday || hasSetLogsToday,
        isRest: isRestDay,
        foodOnly,
        dayKey: dayKeyToday,
      }),
    [
      isCompleted,
      hasWorkoutLoggedToday,
      hasSetLogsToday,
      isRestDay,
      foodOnly,
      dayKeyToday,
      flowTick,
    ],
  );

  const coachDayModel = useMemo((): CoachDayModel | null => {
    if (!profile) return null;
    const hasWorkoutToday = !isRestDay && !foodOnly;
    return resolveCoachDayModel({
      locale: locale as Locale,
      t,
      profile,
      todayIdx,
      foodOnly,
      isRestDay,
      hasWorkoutToday,
      resolvedFlow,
      flowSkipKind: flowRecord?.skipKind,
      hasWorkoutLoggedToday,
      hasSetLogsToday,
      isCompleted,
      justFinishedWorkoutSession,
      foodLogCount: foodLogs.length,
      now,
    });
  }, [
    profile,
    locale,
    t,
    todayIdx,
    foodOnly,
    isRestDay,
    resolvedFlow,
    flowRecord,
    hasWorkoutLoggedToday,
    hasSetLogsToday,
    isCompleted,
    justFinishedWorkoutSession,
    foodLogs.length,
    now,
  ]);

  return {
    coachDayModel,
    resolvedFlow,
    dayKeyToday,
    flowRecord,
    flowTick,
    isCompleted,
    isRestDay,
    foodOnly,
    hasWorkoutLoggedToday,
    hasSetLogsToday,
    foodLogs,
    plan,
    todayIdx,
  };
}
