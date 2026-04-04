"use client";

import { CoachScreenHeader } from "@/components/ui/CoachScreenHeader";
import { HelpVideoCard } from "@/components/ui/HelpVideoCard";
import { Container } from "@/components/ui/Container";
import { CoachSystemStatus } from "@/components/ui/CoachSystemStatus";
import { useTranslation } from "@/hooks/useTranslation";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { useClientProfile } from "@/hooks/useClientProfile";
import { getCoachFeatureToggles } from "@/lib/coachFeatureToggles";
import { generateDailyPlan } from "@/lib/dailyEngine";
import { normalizeProgramPackageId } from "@/lib/programPackages";
import { getTodayGuidanceFromProfile } from "@/lib/packageGuidance";
import { dateLocaleForUi, type Locale, type MessageKey } from "@/lib/i18n";
import { weekChangedBecause } from "@/lib/weekInsight";
import { loadPlannedEvents } from "@/lib/eventsStorage";
import { dayKeyForMondayOffset, getMondayBasedIndex } from "@/lib/plan";
import { WeekAdaptMap } from "@/components/plan/WeekAdaptMap";
import { buildWeekAdaptMap } from "@/lib/weekAdaptMap";
import { planMapSteerKey } from "@/lib/planMapSteer";
import { resolveProgramFromProfile } from "@/lib/profileProgramResolver";
import { effectiveTrainingLevel } from "@/lib/profileTraining";
import { generateWorkoutDay } from "@/lib/training/generator";
import { applyExerciseOverridesToProExercises } from "@/lib/training/exerciseOverrides";
import type { OnboardingAnswers, PlannedEvent, WeekDayEntry } from "@/types/coach";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function mondayOfWeek(ref: Date): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const off = getMondayBasedIndex(ref);
  d.setDate(d.getDate() - off);
  return d;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function formatWeekRangeLabel(ref: Date, locale: Locale): string {
  const mon = mondayOfWeek(ref);
  const sun = addDays(mon, 6);
  const y = mon.getFullYear();
  const loc = dateLocaleForUi(locale);
  const a = mon.toLocaleDateString(loc, { month: "short", day: "numeric" });
  const b = sun.toLocaleDateString(loc, { month: "short", day: "numeric" });
  return `${a}–${b}, ${y}`;
}

type DayRole = "train" | "lighter" | "flex";

function roleLetter(role: DayRole): string {
  if (role === "train") return "T";
  if (role === "flex") return "F";
  return "L";
}

function dayRole(
  entry: WeekDayEntry,
  event: PlannedEvent | undefined,
): DayRole {
  if (event?.kind === "flexible_intake") return "flex";
  if (entry.isRest) return "lighter";
  return "train";
}

export function PlanScreen() {
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const [now] = useState(() => new Date());

  const plan = useMemo(() => {
    if (!profile) return null;
    return generateDailyPlan(profile, now, locale);
  }, [profile, now, locale]);

  const events = useMemo(() => loadPlannedEvents(), []);

  const packageLine = useMemo(() => {
    if (!profile) return null;
    return getTodayGuidanceFromProfile(profile, locale).todayKicker;
  }, [profile, locale]);

  const programResolved = useMemo(
    () => (profile ? resolveProgramFromProfile(profile) : null),
    [profile],
  );

  const proTodayWorkout = useMemo(() => {
    if (!profile || profile.mode !== "pro") return null;
    const idx = getMondayBasedIndex(now);
    const gen = generateWorkoutDay({
      package: normalizeProgramPackageId(profile.selectedPackageId),
      goal: profile.goal,
      level: profile.level,
      dayIndex: idx,
      locale,
      trainingLevel: effectiveTrainingLevel(profile),
      limitations: profile.limitations,
      coachMode: "pro",
      programBlueprintId: profile.programBlueprintId,
      sourceProfile: profile,
    });
    return {
      ...gen,
      exercises: applyExerciseOverridesToProExercises(
        gen.exercises,
        profile.exerciseIdOverrides,
        locale,
      ),
    };
  }, [profile, now, locale]);

  const eventsThisWeek = useMemo(() => {
    const keys = new Set<string>();
    for (let i = 0; i < 7; i++) {
      keys.add(dayKeyForMondayOffset(now, i));
    }
    return events.filter((e) => keys.has(e.dateKey));
  }, [events, now]);

  if (profile === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[15px] text-muted-2">
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

  const ft = getCoachFeatureToggles(profile);

  const days = plan.weeklyPlan.days;
  const todayIdx = getMondayBasedIndex(now);
  const weekLabel = formatWeekRangeLabel(now, locale);

  const byIndex = days.map((entry, i) => {
    const key = dayKeyForMondayOffset(now, i);
    const ev = events.find((e) => e.dateKey === key);
    return { entry, i, key, ev, role: dayRole(entry, ev) };
  });

  const trainingDays = byIndex.filter((x) => !x.entry.isRest);
  const lighterDays = byIndex.filter(
    (x) => x.entry.isRest && x.ev?.kind !== "flexible_intake",
  );
  /** Featured flexible recovery — intake flex on training days only get a tag in Training. */
  const flexDays = byIndex.filter(
    (x) => x.ev?.kind === "flexible_intake" && x.entry.isRest,
  );
  const flexIntakeOnTrainingDay = byIndex.some(
    (x) => x.ev?.kind === "flexible_intake" && !x.entry.isRest,
  );

  const insight = weekChangedBecause(profile, plan, t, eventsThisWeek);

  const adaptDays = buildWeekAdaptMap({
    referenceDate: now,
    weekDays: days,
    rebalanceActive: Boolean(plan.rebalancePlan),
  });

  const mapSteerKey = planMapSteerKey(
    plan,
    byIndex.map(({ entry, i }) => ({ entry, i })),
  );
  const mapSecondKey: MessageKey =
    mapSteerKey === "plan.mapSteerLateWeek"
      ? "plan.mapSecondLateWeek"
      : mapSteerKey === "plan.mapSteerRecovery"
        ? "plan.mapSecondRecovery"
        : "plan.mapSecondBalance";

  const weekHasLiveSignals = Boolean(
    plan.systemLine?.trim() ||
      plan.foodAdjustmentNote?.trim() ||
      eventsThisWeek.length > 0,
  );
  const flexLineKey: Record<
    OnboardingAnswers["flexibility"],
    "plan.flexLineStructured" | "plan.flexLineBalanced" | "plan.flexLineFlexible"
  > = {
    structured: "plan.flexLineStructured",
    balanced: "plan.flexLineBalanced",
    flexible: "plan.flexLineFlexible",
  };

  const socialLineKey: Record<
    OnboardingAnswers["socialEatingFrequency"],
    | "plan.socialLineRare"
    | "plan.socialLineSometimes"
    | "plan.socialLineOften"
  > = {
    rare: "plan.socialLineRare",
    sometimes: "plan.socialLineSometimes",
    often: "plan.socialLineOften",
  };

  return (
    <main className="coach-page">
      <Container size="phone" className="px-5">
        <CoachScreenHeader
          eyebrow={t("plan.eyebrow")}
          eyebrowClassName="sr-only"
          title={t("plan.title")}
          description={t("plan.subtitle")}
          className="max-w-none"
        />
        <HelpVideoCard
          pageId="plan"
          enabled={ft.showHelpVideos}
          className="mt-4"
        />
        <p className="mt-2 text-[11px] font-medium tabular-nums text-muted-2">
          {weekLabel}
        </p>
        {packageLine ? (
          <p className="mt-2 max-w-[22rem] text-[12px] font-medium leading-snug text-accent/95">
            {packageLine}
          </p>
        ) : null}

        {programResolved ? (
          <p className="mt-3 max-w-[26rem] text-[12px] leading-relaxed text-muted">
            <span className="font-semibold text-foreground/95">
              {t(programResolved.presetNameKey)}
            </span>
            {" — "}
            {t(programResolved.programRationaleKey)}
          </p>
        ) : null}

        {proTodayWorkout &&
        !proTodayWorkout.isRestDay &&
        proTodayWorkout.exercises.length > 0 ? (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.04] px-4 py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
              {t("today.proStructureNote")}
            </p>
            <ul className="mt-2 space-y-1.5">
              {proTodayWorkout.exercises.slice(0, 6).map((e) => (
                <li
                  key={e.id}
                  className="text-[13px] font-medium leading-snug text-foreground/95"
                >
                  {e.name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div
          className="coach-panel-live relative mt-5 overflow-hidden border border-accent/25 px-4 py-5 shadow-[0_12px_40px_-18px_rgb(42_92_191/0.28)] sm:px-5 sm:py-6"
          role="region"
          aria-labelledby="week-insight"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_85%_at_0%_0%,rgb(224_232_252/0.55),transparent_58%)]"
            aria-hidden
          />
          <p id="week-insight" className="sr-only">
            {t("plan.weekInsight")}
          </p>
          <p className="relative text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            {t("plan.weekInsightShort")}
          </p>
          <p className="relative mt-3 text-[17px] font-semibold leading-[1.25] tracking-[-0.035em] text-foreground">
            {insight}
          </p>
        </div>

        <WeekAdaptMap
          weekDayLabels={days.map((d) => d.label)}
          days={adaptDays}
          locale={locale}
          t={t}
        />

        <section className="relative mt-6" aria-labelledby="week-overview">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="week-overview" className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground">
                {t("plan.systemMap")}
              </h2>
              <p className="mt-1 max-w-[16rem] text-[10px] font-medium leading-snug text-muted-2">
                {t("plan.systemMapSub")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-2">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-[3px] bg-gradient-to-b from-accent to-accent/75 shadow-sm"
                  aria-hidden
                />
                {t("plan.legendLoad")}
              </span>
              <span className="text-border-strong">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-[3px] border border-foreground/12 bg-foreground/12"
                  aria-hidden
                />
                {t("plan.legendLight")}
              </span>
              <span className="text-border-strong">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-[3px] border-2 border-accent/55 bg-accent-soft/95 shadow-[inset_0_1px_0_rgb(255_255_255/0.5)]"
                  aria-hidden
                />
                {t("plan.legendFlex")}
              </span>
            </div>
          </div>

          {weekHasLiveSignals ? (
            <div className="mt-1 flex justify-center sm:justify-start">
              <CoachSystemStatus
                text={t("systemStatus.plan")}
                liveSignal={Boolean(plan.systemLine?.trim())}
              />
            </div>
          ) : null}

          <div
            className={`plan-week-map relative overflow-hidden rounded-[var(--radius-xl)] border border-border/55 p-3 pt-5 ${
              weekHasLiveSignals ? "mt-4" : "mt-5"
            }`}
            role="list"
            aria-label={t("plan.systemMap")}
          >
            <div
              className="pointer-events-none absolute bottom-10 left-4 right-4 top-6 flex flex-col justify-between opacity-[0.5]"
              aria-hidden
            >
              <div className="plan-week-gridline h-px" />
              <div className="plan-week-gridline h-px" />
              <div className="plan-week-gridline h-px" />
            </div>
            <div
              className="plan-week-gridline pointer-events-none absolute bottom-10 left-4 right-4 h-px opacity-80"
              aria-hidden
            />
            <div className="relative z-[1] flex gap-1.5 sm:gap-2">
              {byIndex.map(({ entry, i, role }) => {
                const isToday = i === todayIdx;
                const bar =
                  role === "train"
                    ? "bg-gradient-to-b from-accent to-accent/78 shadow-[inset_0_-2px_6px_rgb(0_0_0/0.08)]"
                    : role === "flex"
                      ? "border-2 border-accent/45 bg-gradient-to-b from-accent-soft/95 to-accent-soft/75 shadow-[inset_0_1px_0_rgb(255_255_255/0.65)]"
                      : "border border-foreground/10 bg-foreground/11";
                return (
                  <div
                    key={entry.label}
                    role="listitem"
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-muted-2">
                      {entry.label.slice(0, 3)}
                    </span>
                    <div
                      className={`relative h-[5.75rem] w-full max-w-[3rem] rounded-[14px] ${bar} ${
                        isToday
                          ? "shadow-[0_8px_22px_-6px_rgba(47,95,255,0.42)] ring-2 ring-accent ring-offset-[3px] ring-offset-[var(--ring-offset-bg)]"
                          : ""
                      }`}
                    >
                      {isToday ? (
                        <span className="absolute -top-2 left-1/2 z-[2] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#4c6fff] to-[#2f5fff] px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.12em] text-[#f8fbff] shadow-[0_4px_14px_rgba(47,95,255,0.45)]">
                          {t("plan.now")}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[9px] font-bold tabular-nums text-muted-2">
                      {roleLetter(role)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <p
            className="mt-3 text-[12px] font-semibold leading-snug tracking-[-0.02em] text-foreground"
            role="status"
          >
            {t(mapSteerKey)}
          </p>
          <p className="mt-1.5 text-[11px] font-medium leading-snug text-muted">
            {t(mapSecondKey)}
          </p>
        </section>

        <details className="coach-panel-subtle mt-5 group">
          <summary className="cursor-pointer list-none rounded-[var(--radius-xl)] border border-border/50 bg-surface-subtle/55 px-4 py-3.5 marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
                {t("plan.adaptationTitle")}
              </span>
              <span className="text-[11px] font-normal text-muted-2 group-open:hidden">
                {t("common.show")}
              </span>
              <span className="hidden text-[11px] font-normal text-muted-2 group-open:inline">
                {t("common.hide")}
              </span>
            </span>
          </summary>
          <div className="mt-2 rounded-[var(--radius-xl)] border border-border/50 bg-surface-subtle/55 px-4 py-3.5">
            <h2
              id="adaptation-body"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground"
            >
              {t("plan.adaptationHeading")}
            </h2>
            <p className="mt-2.5 text-[13px] font-medium leading-snug text-foreground">
              {t(flexLineKey[profile.flexibility])}
            </p>
            <p className="mt-1.5 text-[12px] leading-snug text-muted">
              {t(socialLineKey[profile.socialEatingFrequency])}
            </p>
            <p className="mt-2.5 border-t border-border/45 pt-2.5 text-[10px] font-medium leading-snug text-muted-2">
              {t("plan.adaptationFooter")}
            </p>
          </div>
        </details>

        <section className="mt-7" aria-labelledby="training-block">
          <h2
            id="training-block"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent"
          >
            {t("plan.trainingLoad")}
          </h2>
          <ul className="mt-3 space-y-2.5">
            {trainingDays.map(({ entry, i, ev }) => {
              const isToday = i === todayIdx;
              const otherEvent =
                ev && ev.kind !== "flexible_intake" ? ev : null;
              const flexTrain = ev?.kind === "flexible_intake";
              return (
                <li
                  key={entry.label}
                  className={`rounded-[var(--radius-lg)] border px-3.5 py-3 ${
                    isToday
                      ? "border-accent/45 bg-accent-soft/35"
                      : "border-border/75 bg-card/95"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-bold leading-tight tracking-[-0.02em] text-foreground">
                      {entry.label}
                    </span>
                    {isToday ? (
                      <span className="shrink-0 rounded-full bg-accent/12 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-accent">
                        {t("plan.todayAdapts")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-snug text-muted">
                    {entry.workoutLine}
                  </p>
                  {flexTrain ? (
                    <p className="mt-2 text-[11px] font-semibold leading-snug text-accent">
                      {t("plan.flexibleIntake")}
                    </p>
                  ) : null}
                  {otherEvent ? (
                    <p className="mt-1.5 text-[11px] text-muted-2">
                      {t("plan.notePrefix")} · {otherEvent.label}
                    </p>
                  ) : null}
                  {isToday ? (
                    <p className="mt-2 text-[10px] font-medium text-muted-2">
                      {t("plan.runChecklist")}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-6" aria-labelledby="lighter-block">
          <h2
            id="lighter-block"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2"
          >
            {t("plan.lighterDays")}
          </h2>
          <p className="mt-1.5 text-[11px] leading-snug text-muted-2">
            {t("plan.lighterHint")}
          </p>
          {lighterDays.length === 0 ? (
            <p className="mt-2.5 text-[12px] leading-relaxed text-muted-2">
              {t("plan.lighterEmpty")}
            </p>
          ) : (
          <ul className="mt-3 space-y-2">
            {lighterDays.map(({ entry, i, ev }) => {
              const isToday = i === todayIdx;
              const otherEvent =
                ev && ev.kind !== "flexible_intake" ? ev : null;
              return (
                <li
                  key={entry.label}
                  className={`rounded-[var(--radius-lg)] border px-3.5 py-2.5 ${
                    isToday
                      ? "border-border/55 bg-surface-subtle/80"
                      : "border-border/45 bg-card/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-semibold leading-tight text-foreground">
                      {entry.label}
                    </span>
                    {isToday ? (
                      <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-2">
                        {t("plan.todayAdapts")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[12px] leading-snug text-muted">
                    {entry.workoutLine}
                  </p>
                  {otherEvent ? (
                    <p className="mt-1.5 text-[11px] text-muted-2">
                      {t("plan.notePrefix")} · {otherEvent.label}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
          )}
        </section>

        <section className="mt-6" aria-labelledby="flex-block">
          <h2
            id="flex-block"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2"
          >
            {t("plan.flexDay")}
          </h2>
          {flexDays.length === 0 ? (
            <div className="mt-2.5 rounded-[var(--radius-lg)] border border-border/50 bg-surface-subtle/40 px-3.5 py-3">
              <p className="text-[12px] leading-snug text-muted">
                {flexIntakeOnTrainingDay
                  ? t("plan.flexEmptyTrain")
                  : t("plan.flexEmptyNone")}
              </p>
              <Link
                href="/adjustments"
                className="mt-2 inline-flex text-[12px] font-semibold text-accent hover:underline"
              >
                {t("plan.flexEmptyAction")}
              </Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {flexDays.map(({ entry, i, ev }) => {
                const isToday = i === todayIdx;
                return (
                  <li
                    key={`${entry.label}-${ev?.id}`}
                    className={`rounded-[var(--radius-xl)] border border-accent/35 bg-accent-soft/45 px-4 py-4 ${
                      isToday ? "ring-2 ring-accent/25" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[14px] font-semibold text-foreground">
                        {entry.label}
                      </span>
                      <span className="coach-section-label-sm text-accent tracking-[0.14em]">
                        {t("plan.flexLabel")}
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted">
                      {ev?.label ?? t("plan.flexDefaultBody")}
                    </p>
                    {isToday ? (
                      <p className="mt-2 text-[11px] font-medium text-accent">
                        {t("plan.today")}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="mt-10 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-muted-2">
          {t("plan.footer")}
        </p>
      </Container>
    </main>
  );
}
