"use client";

import { DailyActivityInput } from "@/components/coach/DailyActivityInput";
import { DayCompletionModal } from "@/components/today/DayCompletionModal";
import { MinimumDayModal } from "@/components/today/MinimumDayModal";
import { AutopilotWeekStrip } from "@/components/today/AutopilotWeekStrip";
import { TodayCard } from "@/components/TodayCard";
import { WeekProgress } from "@/components/WeekProgress";
import { Container } from "@/components/ui/Container";
import { HelpVideoCard } from "@/components/ui/HelpVideoCard";
import { useTranslation } from "@/hooks/useTranslation";
import {
  buildCoachAiEngineResult,
  mergeExceptionIntoDailyPlan,
  normalizeProfileForEngine,
  resolveExceptionGuidance,
  shouldSuppressWorkoutLink,
} from "@/lib/coach";
import { mergeMinimumDayIntoDailyPlan } from "@/lib/coach/minimumDayPlan";
import { getCoachFeatureToggles } from "@/lib/coachFeatureToggles";
import { getDailyFocus } from "@/lib/dailyFocus";
import { generateDailyPlan } from "@/lib/dailyEngine";
import { appDataFallbackKey } from "@/lib/dataConfidence";
import { getGoalTimeline } from "@/lib/goalTimeline";
import {
  dateLocaleForUi,
  type Locale,
  type MessageKey,
} from "@/lib/i18n";
import { flowLog } from "@/lib/flowLog";
import { dayKeyFromDate } from "@/lib/dateKey";
import { DAILY_ACTIVITIES_CHANGED } from "@/lib/activityStorage";
import { countTrainingDays, getMondayBasedIndex } from "@/lib/plan";
import { streakRhythmTone } from "@/components/streak/StreakRhythmBlock";
import { buildRealityScore } from "@/lib/realityScore";
import { gatherRealityScoreContext } from "@/lib/realityScoreContext";
import { computeStreakSummary } from "@/lib/streaks";
import { trackEvent } from "@/lib/analytics";
import { todayCoachVoiceKey } from "@/lib/coachPresenceCopy";
import { resolveProgramFromProfile } from "@/lib/profileProgramResolver";
import { getProgramLibraryEntry } from "@/lib/coachProgramCatalog";
import { recommendSplitForProfile } from "@/lib/coach/splitRecommendationEngine";
import { getNutritionLibraryEntry } from "@/lib/nutritionLibrary";
import { getProgramPackage, normalizeProgramPackageId } from "@/lib/programPackages";
import { effectiveTrainingLevel } from "@/lib/profileTraining";
import { generateWorkoutDay } from "@/lib/training/generator";
import {
  computeDayCloseRetentionKeys,
  computeTodaySystemStatusKey,
} from "@/lib/todaySystemStatus";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { useClientProfile } from "@/hooks/useClientProfile";
import {
  EXCEPTION_STATE_CHANGED,
  clearActiveException,
  loadActiveExceptionForDay,
} from "@/lib/exceptionStorage";
import {
  MINIMUM_DAY_CHANGED,
  loadMinimumDayForDay,
} from "@/lib/minimumDayStorage";
import {
  AUTOPILOT_CHANGED,
  loadAutopilotEnabled,
  saveAutopilotEnabled,
} from "@/lib/autopilotStorage";
import { getSubscriptionSnapshot } from "@/lib/subscription";
import {
  hasEverMarkedDayDone,
  isDayMarkedDone,
  loadOutcomeHint,
  mergeOutcomeHint,
  OUTCOME_HINT_CHANGED,
  setDayMarkedDone,
} from "@/lib/storage";
import {
  clearDayExecution,
  saveDayExecution,
  type DayExecutionChecklist,
} from "@/lib/dayExecutionStorage";
import {
  clearThinklessPick,
  loadThinklessPick,
  saveThinklessPick,
  THINKLESS_CHANGED,
} from "@/lib/thinklessDayStorage";
import { WORK_SHIFTS_CHANGED } from "@/lib/workShiftStorage";
import { WORKOUT_LOG_CHANGED } from "@/lib/workoutLogStorage";
import { CoachingInsightsSection } from "@/components/coach/CoachingInsightsSection";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function formatDateParts(
  d: Date,
  locale: Locale,
): { weekday: string; calendarDate: string } {
  const loc = dateLocaleForUi(locale);
  return {
    weekday: d.toLocaleDateString(loc, { weekday: "long" }),
    calendarDate: d.toLocaleDateString(loc, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };
}

export function AppDashboard() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const [now] = useState(() => new Date());
  const [dayDone, setDayDone] = useState(() => isDayMarkedDone(new Date()));
  const [activityPlanTick, setActivityPlanTick] = useState(0);
  const [signalTick, setSignalTick] = useState(0);
  const [exTick, setExTick] = useState(0);
  const [shiftTick, setShiftTick] = useState(0);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [minimumModalOpen, setMinimumModalOpen] = useState(false);
  const [minimumTick, setMinimumTick] = useState(0);
  const [autopilotTick, setAutopilotTick] = useState(0);
  const [streakRefresh, setStreakRefresh] = useState(0);
  const [thinklessTick, setThinklessTick] = useState(0);
  const [workoutLogTick, setWorkoutLogTick] = useState(0);

  useEffect(() => {
    if (profile === undefined) return;
    if (!profile) {
      router.replace("/start");
    }
  }, [profile, router]);

  useEffect(() => {
    const bump = () => setActivityPlanTick((x) => x + 1);
    window.addEventListener(DAILY_ACTIVITIES_CHANGED, bump);
    return () => window.removeEventListener(DAILY_ACTIVITIES_CHANGED, bump);
  }, []);

  useEffect(() => {
    const bump = () => setExTick((x) => x + 1);
    window.addEventListener(EXCEPTION_STATE_CHANGED, bump);
    return () => window.removeEventListener(EXCEPTION_STATE_CHANGED, bump);
  }, []);

  useEffect(() => {
    const bump = () => setMinimumTick((x) => x + 1);
    window.addEventListener(MINIMUM_DAY_CHANGED, bump);
    return () => window.removeEventListener(MINIMUM_DAY_CHANGED, bump);
  }, []);

  useEffect(() => {
    const bump = () => setAutopilotTick((x) => x + 1);
    window.addEventListener(AUTOPILOT_CHANGED, bump);
    return () => window.removeEventListener(AUTOPILOT_CHANGED, bump);
  }, []);

  useEffect(() => {
    const bump = () => setSignalTick((x) => x + 1);
    window.addEventListener(OUTCOME_HINT_CHANGED, bump);
    return () => window.removeEventListener(OUTCOME_HINT_CHANGED, bump);
  }, []);

  useEffect(() => {
    const bump = () => setShiftTick((x) => x + 1);
    window.addEventListener(WORK_SHIFTS_CHANGED, bump);
    return () => window.removeEventListener(WORK_SHIFTS_CHANGED, bump);
  }, []);

  useEffect(() => {
    const bump = () => setThinklessTick((x) => x + 1);
    window.addEventListener(THINKLESS_CHANGED, bump);
    return () => window.removeEventListener(THINKLESS_CHANGED, bump);
  }, []);

  useEffect(() => {
    const bump = () => setWorkoutLogTick((x) => x + 1);
    window.addEventListener(WORKOUT_LOG_CHANGED, bump);
    return () => window.removeEventListener(WORKOUT_LOG_CHANGED, bump);
  }, []);

  const dayKeyToday = useMemo(() => dayKeyFromDate(now), [now]);
  const activeException = useMemo(
    () => loadActiveExceptionForDay(dayKeyToday),
    [dayKeyToday, exTick],
  );

  const minimumDayActive = useMemo(
    () => loadMinimumDayForDay(dayKeyToday),
    [dayKeyToday, minimumTick],
  );

  const autopilotEnabled = useMemo(
    () => loadAutopilotEnabled(),
    [autopilotTick],
  );

  const normalizedProfile = useMemo(
    () => (profile ? normalizeProfileForEngine(profile) : null),
    [profile],
  );

  const plan = useMemo(() => {
    if (!normalizedProfile) return null;
    try {
      const base = generateDailyPlan(normalizedProfile, now, locale);
      let merged = activeException
        ? mergeExceptionIntoDailyPlan(base, activeException, locale)
        : base;
      if (minimumDayActive) {
        merged = mergeMinimumDayIntoDailyPlan(merged, locale);
      }
      return merged;
    } catch {
      return null;
    }
  }, [
    normalizedProfile,
    now,
    locale,
    activityPlanTick,
    signalTick,
    shiftTick,
    activeException,
    minimumDayActive,
  ]);

  const coachAi = useMemo(() => {
    if (!normalizedProfile || !plan) return null;
    return buildCoachAiEngineResult({
      profile: normalizedProfile,
      locale,
      now,
      plan,
      activeException: Boolean(activeException),
    });
  }, [normalizedProfile, locale, now, plan, activeException]);

  useEffect(() => {
    if (profile && plan) {
      flowLog("today.planReady", dayKeyToday);
    }
  }, [profile, plan, dayKeyToday]);

  const streaks = useMemo(
    () => (normalizedProfile ? computeStreakSummary(normalizedProfile, now) : null),
    [normalizedProfile, now, streakRefresh],
  );

  const thinklessPick = useMemo(
    () => loadThinklessPick(now),
    [now, thinklessTick],
  );

  const thinklessLines = useMemo((): {
    food: string;
    workout: string;
    activity: string;
  } | null => {
    if (!thinklessPick) return null;
    return {
      food: thinklessPick.foodLine,
      workout: thinklessPick.workoutLine,
      activity: thinklessPick.activityLine,
    };
  }, [thinklessPick]);

  const realityScore = useMemo(() => {
    if (!normalizedProfile) return null;
    const ctx = gatherRealityScoreContext(normalizedProfile, now);
    return buildRealityScore({ ...ctx, locale });
  }, [normalizedProfile, now, locale]);

  const streakTone = useMemo(() => {
    if (!streaks) return undefined;
    const brokenRecently =
      streaks.combined === 0 && hasEverMarkedDayDone();
    return streakRhythmTone(streaks, brokenRecently);
  }, [streaks]);

  const dataFallbackKey = useMemo((): MessageKey | null => {
    if (!normalizedProfile || !streaks) return null;
    return appDataFallbackKey(normalizedProfile, streaks.combined);
  }, [normalizedProfile, streaks]);

  const trialBanner = useMemo(() => {
    const snap = getSubscriptionSnapshot();
    if (snap.subscribed) return null;
    if (snap.inTrial && snap.daysLeftInTrial > 0) {
      return t("trial.headerLine", { days: snap.daysLeftInTrial });
    }
    return null;
  }, [t]);

  const features = useMemo(
    () => getCoachFeatureToggles(normalizedProfile ?? null),
    [normalizedProfile],
  );

  const exceptionGuidance = useMemo(() => {
    if (!activeException) return null;
    return resolveExceptionGuidance(
      locale,
      activeException.id,
      activeException.severity,
    );
  }, [activeException, locale]);

  const suppressWorkout = Boolean(
    activeException && shouldSuppressWorkoutLink(activeException),
  );

  const dateParts = useMemo(() => formatDateParts(now, locale), [now, locale]);

  const todayIdx = useMemo(() => getMondayBasedIndex(now), [now]);

  const focus = useMemo(() => {
    if (!plan || !normalizedProfile) return null;
    const entry = plan.weeklyPlan.days[todayIdx];
    const isRest = Boolean(entry?.isRest);
    return getDailyFocus(
      normalizedProfile.selectedPackageId,
      todayIdx,
      isRest,
      plan.todayWorkout,
      locale,
    );
  }, [plan, normalizedProfile, todayIdx, locale]);

  const packageBadge = useMemo(() => {
    if (!normalizedProfile) return null;
    const pkg = getProgramPackage(normalizedProfile.selectedPackageId);
    return locale === "en" ? pkg.nameEn : pkg.nameFi;
  }, [normalizedProfile, locale]);

  const { programRationaleLine, programPresetLine } = useMemo(() => {
    if (!normalizedProfile) {
      return { programRationaleLine: null as string | null, programPresetLine: null as string | null };
    }
    const r = resolveProgramFromProfile(normalizedProfile);
    return {
      programRationaleLine: t(r.programRationaleKey),
      programPresetLine: `${t(r.presetFrameLabelKey)} · ${t(r.presetNameKey)}`,
    };
  }, [normalizedProfile, t]);

  const mealStructureLabel = useMemo(() => {
    if (!profile) return "";
    const m = profile.mealStructure;
    if (m === "three_meals") return t("onboarding.structThree");
    if (m === "lighter_evening") return t("onboarding.structLight");
    return t("onboarding.structSnack");
  }, [profile, t]);

  const { libraryProgramLine, libraryNutritionLine } = useMemo(() => {
    if (!normalizedProfile) {
      return {
        libraryProgramLine: null as string | null,
        libraryNutritionLine: null as string | null,
      };
    }
    const fi = locale === "fi";
    const pid =
      normalizedProfile.selectedProgramLibraryId ??
      normalizedProfile.recommendedProgramLibraryId;
    const nid =
      normalizedProfile.selectedNutritionLibraryId ??
      normalizedProfile.recommendedNutritionLibraryId;
    const pl = pid ? getProgramLibraryEntry(pid) : null;
    const nl = nid ? getNutritionLibraryEntry(nid) : null;
    return {
      libraryProgramLine: pl
        ? `${fi ? "Ohjelma" : "Program"}: ${fi ? pl.nameFi : pl.nameEn}`
        : null,
      libraryNutritionLine: nl
        ? `${fi ? "Ruoka" : "Food"}: ${fi ? nl.nameFi : nl.nameEn}`
        : null,
    };
  }, [normalizedProfile, locale]);

  const splitRecommendationLine = useMemo(() => {
    if (!normalizedProfile) return null;
    const r = recommendSplitForProfile(normalizedProfile);
    return locale === "fi"
      ? `Jako: ${r.splitLabelFi} — ${r.rationaleFi}`
      : `Split: ${r.splitLabelEn} — ${r.rationaleEn}`;
  }, [normalizedProfile, locale]);

  const engineWeekLine = useMemo(() => {
    if (!features.showCoachLines || !coachAi) return null;
    return t(coachAi.bundle.adaptation.headlineKey);
  }, [features.showCoachLines, coachAi, t]);

  const quickNoteLine = useMemo(() => {
    if (!normalizedProfile) return null;
    return loadOutcomeHint(now)?.quickNote?.trim() || null;
  }, [normalizedProfile, now, signalTick]);

  const coachPresenceLine = useMemo(() => {
    if (!features.showCoachLines) return null;
    return t(todayCoachVoiceKey(dayKeyToday));
  }, [features.showCoachLines, dayKeyToday, t]);

  const goalProgressRealism = useMemo(() => {
    if (!normalizedProfile) return null;
    if (normalizedProfile.targetWeight == null || !normalizedProfile.targetDate?.trim()) {
      return null;
    }
    const g = getGoalTimeline(normalizedProfile, now);
    if (!g.hasTarget || g.paceKey === "goalTimeline.noTarget") return null;
    const keyMap: Record<string, MessageKey> = {
      "goalTimeline.paceOk": "dashboard.goalPaceOk",
      "goalTimeline.paceSteep": "dashboard.goalPaceSteep",
      "goalTimeline.paceGentle": "dashboard.goalPaceGentle",
      "goalTimeline.weeksOnly": "dashboard.goalPaceNeutral",
    };
    const k = keyMap[g.paceKey] ?? "dashboard.goalPaceNeutral";
    return t(k);
  }, [normalizedProfile, now, t]);

  const coachHero = useMemo(() => {
    if (!coachAi) return null;
    return {
      mainMessage: coachAi.nextAdjustment.heroMain,
      direction: coachAi.nextAdjustment.heroDirection,
    };
  }, [coachAi]);

  const generatedWorkout = useMemo(() => {
    if (!normalizedProfile) return null;
    return generateWorkoutDay({
      package: normalizeProgramPackageId(normalizedProfile.selectedPackageId),
      goal: normalizedProfile.goal,
      level: normalizedProfile.level,
      week: 1,
      dayIndex: todayIdx,
      locale,
      trainingLevel: effectiveTrainingLevel(normalizedProfile),
      limitations: normalizedProfile.limitations,
      coachMode: normalizedProfile.mode ?? "guided",
      programBlueprintId: normalizedProfile.programBlueprintId,
      sourceProfile: normalizedProfile,
    });
  }, [normalizedProfile, todayIdx, locale]);

  const reopenDay = useCallback(() => {
    clearDayExecution(now);
    clearThinklessPick(now);
    try {
      setDayMarkedDone(false, now);
    } catch (e) {
      console.error("[reopenDay]", e);
    }
    setDayDone(false);
  }, [now]);

  const onCompleteCommit = useCallback(
    (checks: Omit<DayExecutionChecklist, "savedAt">) => {
      saveDayExecution(now, checks);
      try {
        setDayMarkedDone(true, now);
        setDayDone(true);
        trackEvent("complete_day");
      } catch (e) {
        console.error("[onCompleteCommit]", e);
      }
      setStreakRefresh((x) => x + 1);
    },
    [now],
  );

  const activateThinkless = useCallback(() => {
    if (!plan) return;
    saveThinklessPick(now, {
      foodLine: plan.todayFoodTask,
      workoutLine: plan.todayWorkout,
      activityLine: plan.todayActivityTask,
    });
  }, [now, plan]);

  const enableAutopilot = useCallback(() => {
    saveAutopilotEnabled(true);
    trackEvent("autopilot_enable");
  }, []);

  const disableAutopilot = useCallback(() => {
    saveAutopilotEnabled(false);
    trackEvent("autopilot_disable");
  }, []);

  const todaySystemStatusKey = useMemo((): MessageKey => {
    if (!normalizedProfile || !plan) return "today.systemStatus.balanced";
    return computeTodaySystemStatusKey({
      profile: normalizedProfile,
      plan,
      referenceDate: now,
      locale,
    });
  }, [normalizedProfile, plan, now, locale]);

  const dayCloseRetention = useMemo(() => {
    if (!normalizedProfile || !plan) return null;
    return computeDayCloseRetentionKeys({
      profile: normalizedProfile,
      plan,
      referenceDate: now,
      locale,
    });
  }, [normalizedProfile, plan, now, locale]);

  const onQuickDone = useCallback(() => {
    const href =
      generatedWorkout &&
      !generatedWorkout.isRestDay &&
      generatedWorkout.exercises.length > 0
        ? "/workout"
        : "/food";
    router.push(href);
  }, [generatedWorkout, router]);

  const onQuickSkip = useCallback(() => {
    mergeOutcomeHint(now, { skippedWorkout: true });
    setSignalTick((x) => x + 1);
  }, [now]);

  if (profile === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[15px] text-muted-2">
        {t("common.loading")}
      </div>
    );
  }

  if (!profile) {
    return <CoachProfileMissingFallback />;
  }

  if (!plan) {
    return (
      <main className="coach-page">
        <Container size="phone" className="px-5 py-12">
          <p className="text-[13px] leading-relaxed text-muted" role="status">
            {t("fallback.sharpensWithUse")}
          </p>
        </Container>
      </main>
    );
  }

  return (
    <main className="coach-page">
      <DayCompletionModal
        open={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        onCommit={onCompleteCommit}
      />
      <MinimumDayModal
        open={minimumModalOpen}
        onClose={() => setMinimumModalOpen(false)}
        dayKey={dayKeyToday}
        active={minimumDayActive}
        onActivated={() => setMinimumTick((x) => x + 1)}
      />
      <Container size="phone" className="px-5">
        <h1 className="sr-only">
          Today — {dateParts.weekday}, {dateParts.calendarDate}
        </h1>

        <HelpVideoCard
          pageId="today"
          enabled={features.showHelpVideos}
          className="mt-2 opacity-95"
        />

        <details className="group mt-2 rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.02]">
          <summary className="cursor-pointer list-none px-4 py-3 text-[13px] font-medium text-muted marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-3">
              <span>{t("today.weekPlanFold")}</span>
              <span className="text-[11px] font-normal text-muted-2 group-open:hidden">
                {t("common.show")}
              </span>
              <span className="hidden text-[11px] font-normal text-muted-2 group-open:inline">
                {t("common.hide")}
              </span>
            </span>
          </summary>
          <div className="border-t border-border/40 px-1 pb-3 pt-1">
            <AutopilotWeekStrip
              enabled={autopilotEnabled}
              onEnable={enableAutopilot}
              onDisable={disableAutopilot}
              days={plan.weeklyPlan.days}
              referenceDate={now}
              trainingDaysCount={countTrainingDays({
                days: plan.weeklyPlan.days,
              })}
              mealStructureLabel={mealStructureLabel}
              programFrameLine={programPresetLine}
              className="!mt-0"
            />
          </div>
        </details>

        <div className="relative">
          <div
            className="pointer-events-none absolute -inset-x-1 -top-2 bottom-6 -z-10 rounded-[2rem] bg-[radial-gradient(95%_75%_at_50%_-5%,rgb(59_130_246/0.18),transparent_70%)] blur-2xl"
            aria-hidden
          />
          <TodayCard
            weekday={dateParts.weekday}
            calendarDate={dateParts.calendarDate}
            packageBadge={packageBadge}
            primaryAnchor={
              generatedWorkout &&
              !generatedWorkout.isRestDay &&
              generatedWorkout.exercises.length > 0 &&
              !suppressWorkout
                ? "workout"
                : "focus"
            }
            coachHero={coachHero}
            proStructureNote={
              profile.mode === "pro" &&
              generatedWorkout &&
              !generatedWorkout.isRestDay &&
              generatedWorkout.exercises.length > 0
                ? t("today.proStructureNote")
                : null
            }
            proExerciseNames={
              profile.mode === "pro" && generatedWorkout
                ? generatedWorkout.exercises.map((e) => e.name)
                : undefined
            }
            focus={focus!}
            food={plan.todayFoodTask}
            activity={plan.todayActivityTask}
            systemStatusKey={todaySystemStatusKey}
            systemStatusLive={
              Boolean(plan.systemLine?.trim()) ||
              Boolean(activeException) ||
              minimumDayActive ||
              autopilotEnabled
            }
            minimumDayActive={minimumDayActive}
            onOpenMinimumDay={() => setMinimumModalOpen(true)}
            autopilotActive={autopilotEnabled}
            startWorkoutHref={
              generatedWorkout &&
              !generatedWorkout.isRestDay &&
              generatedWorkout.exercises.length > 0 &&
              !suppressWorkout
                ? "/workout"
                : undefined
            }
            exceptionGuidance={exceptionGuidance}
            onClearException={
              exceptionGuidance ? () => clearActiveException() : undefined
            }
            extraMoveSlot={
              <DailyActivityInput
                dateKey={dayKeyFromDate(now)}
                showVoice={features.showVoiceWorkout}
              />
            }
            features={features}
            activityEnergyBonusKcal={plan.activityEnergyBonusKcal}
            dayDone={dayDone}
            isMarkingDone={false}
            onToggleDay={reopenDay}
            onRequestCompleteDay={() => setCompleteModalOpen(true)}
            onReopenDay={reopenDay}
            onThinkless={activateThinkless}
            thinklessActive={Boolean(thinklessPick)}
            thinklessLines={thinklessLines}
            dayCloseRetention={dayCloseRetention}
            onQuickDone={onQuickDone}
            onQuickSkip={onQuickSkip}
            quickChangeHref="/food"
            rebalanceDailyKcal={
              plan.rebalancePlan?.dailyAdjustmentCalories ?? null
            }
            trialBanner={trialBanner}
            trialBannerHref={trialBanner ? "/paywall" : undefined}
            libraryProgramLine={libraryProgramLine}
            libraryNutritionLine={libraryNutritionLine}
            showLibraryChangeLinks
            programPresetLine={programPresetLine}
            programRationaleLine={programRationaleLine}
            splitRecommendationLine={splitRecommendationLine}
            engineWeekLine={engineWeekLine}
            quickNoteLine={quickNoteLine}
            coachPresenceLine={coachPresenceLine}
            shiftBadgeKey={plan.shiftToday?.badgeKey ?? null}
            shiftRationaleKey={plan.shiftToday?.rationaleKey ?? null}
            dataFallbackKey={dataFallbackKey}
            realityScore={realityScore}
            streakSummary={streaks ?? undefined}
            streakTone={streakTone}
          />
        </div>

        <details className="coach-panel-subtle mt-8 group">
          <summary className="cursor-pointer list-none px-4 py-3.5 text-[13px] font-medium text-muted marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-3">
              <span>{t("dashboard.weekFold")}</span>
              <span className="text-[11px] font-normal tabular-nums text-muted-2 group-open:hidden">
                {t("common.show")}
              </span>
              <span className="hidden text-[11px] font-normal tabular-nums text-muted-2 group-open:inline">
                {t("common.hide")}
              </span>
            </span>
          </summary>
          <div className="border-t border-border/50 px-4 pb-5 pt-4">
            <div className="space-y-6">
              <WeekProgress days={plan.weeklyPlan.days} referenceDate={now} />
              <CoachingInsightsSection
                profile={profile}
                referenceDate={now}
                locale={locale}
                refreshKey={workoutLogTick}
              />
            </div>
            {goalProgressRealism ? (
              <p
                className="mx-auto mt-6 max-w-md text-center text-[13px] leading-relaxed text-muted"
                role="status"
              >
                {goalProgressRealism}
              </p>
            ) : null}
          </div>
        </details>

        <footer className="mt-14 border-t border-border/50 pb-10 pt-8 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
            {t("dashboard.footerQuick")}
          </p>
          <p className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px]">
            <Link
              href="/workout"
              className="font-semibold text-accent underline-offset-[3px] hover:underline"
            >
              {t("ui.workout")}
            </Link>
            <Link
              href="/review"
              className="font-semibold text-accent underline-offset-[3px] hover:underline"
            >
              {t("ui.review")}
            </Link>
            <Link
              href="/plans"
              className="font-semibold text-accent underline-offset-[3px] hover:underline"
            >
              {t("plans.title")}
            </Link>
            <Link
              href="/nutrition-plans"
              className="font-semibold text-accent underline-offset-[3px] hover:underline"
            >
              {t("nutritionPlans.title")}
            </Link>
            <Link
              href="/adjustments"
              className="font-semibold text-accent underline-offset-[3px] hover:underline"
            >
              {t("nav.adjustments")}
            </Link>
            <Link
              href="/preferences"
              className="font-semibold text-accent underline-offset-[3px] hover:underline"
            >
              {t("ui.preferences")}
            </Link>
            <Link
              href="/settings"
              className="font-semibold text-accent underline-offset-[3px] hover:underline"
            >
              {t("nav.settings")}
            </Link>
            <Link
              href="/paywall"
              className="font-semibold text-accent underline-offset-[3px] hover:underline"
            >
              {t("paywall.linkPremium")}
            </Link>
          </p>
          <p className="mt-5 text-[13px]">
            <Link
              href="/start"
              className="font-medium text-muted underline-offset-[4px] transition hover:text-foreground hover:underline"
            >
              {t("dashboard.changeAnswers")}
            </Link>
          </p>
        </footer>
      </Container>
    </main>
  );
}
