"use client";

import { BuildMarkerLine } from "@/components/build/BuildMarkerLine";
import { CoachAppShortcuts } from "@/components/app/CoachAppShortcuts";
import { ProfileProgramSummary } from "@/components/profile/ProfileProgramSummary";
import { CoachBuildsEmpty } from "@/components/ui/CoachBuildsEmpty";
import { HelpVideoCard } from "@/components/ui/HelpVideoCard";
import { CoachScreenHeader } from "@/components/ui/CoachScreenHeader";
import { ExceptionEnginePanel } from "@/components/exceptions/ExceptionEnginePanel";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { useAsyncButtonState } from "@/hooks/useAsyncButtonState";
import { useClientProfile } from "@/hooks/useClientProfile";
import { getCoachFeatureToggles } from "@/lib/coachFeatureToggles";
import {
  buildCoachEngineBundle,
  normalizeProfileForEngine,
} from "@/lib/coach";
import { displaySystemLine, generateDailyPlan } from "@/lib/dailyEngine";
import { getProgramPackage, packageLabel } from "@/lib/programPackages";
import { getYesterdayAdjustmentSignals } from "@/lib/adjustments";
import {
  addPlannedEvent,
  loadPlannedEvents,
  removePlannedEvent,
} from "@/lib/eventsStorage";
import { dateLocaleForUi, type Locale, type TranslateFn } from "@/lib/i18n";
import { hasEverMarkedDayDone } from "@/lib/storage";
import type { PlannedEvent } from "@/types/coach";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useReducer, useState } from "react";

function refDayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function isoToDateKey(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function weekdayShort(dateKey: string, locale: Locale): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString(dateLocaleForUi(locale), { weekday: "short" });
}

function horizonLine(
  e: PlannedEvent,
  locale: Locale,
  t: TranslateFn,
): string {
  const wdRaw = weekdayShort(e.dateKey, locale);
  const wd =
    wdRaw.length > 0
      ? wdRaw.charAt(0).toUpperCase() + wdRaw.slice(1)
      : wdRaw;
  const effect =
    e.kind === "flexible_intake"
      ? t("adjust.horizonEffectFlex")
      : e.kind === "travel"
        ? t("adjust.horizonEffectTravel")
        : t("adjust.horizonEffectSocial");
  if (e.kind === "flexible_intake") {
    return `${wd} · ${effect}`;
  }
  return `${wd} · ${e.label} — ${effect}`;
}

export function AdjustmentsScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const [now] = useState(() => new Date());
  const [, bumpEvents] = useReducer((x: number) => x + 1, 0);
  const [newLabel, setNewLabel] = useState("");
  const [newDateIso, setNewDateIso] = useState("");
  const [newKind, setNewKind] = useState<PlannedEvent["kind"]>("social");
  const addEventAction = useAsyncButtonState({
    name: "AdjustmentsScreen.addEvent",
  });

  useEffect(() => {
    if (profile === undefined) return;
    if (!profile) {
      console.debug("[coach] AdjustmentsScreen: no profile → /start");
      router.replace("/start");
    }
  }, [profile, router]);

  const normalizedProfile = useMemo(
    () => (profile ? normalizeProfileForEngine(profile) : null),
    [profile],
  );

  const plan = useMemo(() => {
    if (!normalizedProfile) return null;
    try {
      return generateDailyPlan(normalizedProfile, now, locale);
    } catch {
      return null;
    }
  }, [normalizedProfile, now, locale]);

  const adjustEngineLine = useMemo(() => {
    if (!normalizedProfile || !plan) return null;
    const b = buildCoachEngineBundle({
      profile: normalizedProfile,
      locale,
      now,
      plan,
      activeException: false,
    });
    return t(b.adaptation.headlineKey);
  }, [normalizedProfile, plan, locale, now, t]);

  const packageContext = useMemo(() => {
    if (!profile?.selectedPackageId) return null;
    const pkg = getProgramPackage(profile.selectedPackageId);
    if (!pkg) return null;
    const L = packageLabel(pkg, locale === "en" ? "en" : "fi");
    return `${L.name} · ${L.rhythm}`;
  }, [profile?.selectedPackageId, locale]);

  const refKey = refDayKey(now);
  const allUpcoming = loadPlannedEvents().filter((e) => e.dateKey >= refKey);
  const upcomingModel = {
    planned: allUpcoming.filter((e) => e.kind !== "flexible_intake"),
    flex: allUpcoming.filter((e) => e.kind === "flexible_intake"),
    all: allUpcoming,
  };

  const horizonPreview = useMemo(() => {
    return [...upcomingModel.all]
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .slice(0, 2);
  }, [upcomingModel.all]);

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
          <CoachBuildsEmpty />
        </Container>
      </main>
    );
  }

  const signals = getYesterdayAdjustmentSignals(plan, now);
  const engaged = hasEverMarkedDayDone();

  const fromYesterday = !engaged
    ? t("adjust.fromYesterdayEmpty")
    : !signals.yesterdayDone
      ? t("adjust.fromYesterdayNotDone")
      : plan.systemLine
        ? t("adjust.fromYesterdaySystem")
        : t("adjust.fromYesterdaySteady");

  const missedLine = signals.missedTrainingDay
    ? t("adjust.missedTrain")
    : signals.missedWorkoutLogged
      ? t("adjust.missedSkip")
      : null;

  const driftLine = signals.calorieDrift ? t("adjust.driftYes") : null;

  const flexWhyKey =
    profile.flexibility === "structured"
      ? "adjust.whyFlexStructured"
      : profile.flexibility === "flexible"
        ? "adjust.whyFlexRoom"
        : "adjust.whyFlexBalanced";

  const goalWhyKey =
    profile.goal === "lose_weight"
      ? "adjust.whyGoalLose"
      : profile.goal === "build_muscle"
        ? "adjust.whyGoalMuscle"
        : "adjust.whyGoalFitness";

  const levelWhyKey =
    profile.level === "beginner"
      ? "adjust.whyLevelBeginner"
      : profile.level === "intermediate"
        ? "adjust.whyLevelMid"
        : "adjust.whyLevelAdvanced";

  const whyOneLiner = t("adjust.whyOneLiner", {
    goal: t(goalWhyKey),
    flex: t(flexWhyKey),
    level: t(levelWhyKey),
  });

  const onAddEvent = (e: FormEvent) => {
    e.preventDefault();
    const label = newLabel.trim();
    if (!label || !newDateIso) return;
    void addEventAction.run(async () => {
      try {
        addPlannedEvent({
          dateKey: isoToDateKey(newDateIso),
          label,
          kind: newKind,
        });
        setNewLabel("");
        bumpEvents();
      } catch (err) {
        console.error("[AdjustmentsScreen] add event", err);
        throw err;
      }
    });
  };

  const showSocialHint =
    profile.socialEatingFrequency === "often" &&
    upcomingModel.planned.length === 0 &&
    upcomingModel.flex.length === 0;

  const liveLine = displaySystemLine(plan.systemLine, t);
  const ft = getCoachFeatureToggles(profile);

  return (
    <main className="coach-page">
      <Container size="phone" className="px-5">
        <CoachScreenHeader
          eyebrow={t("adjust.eyebrow")}
          eyebrowClassName="sr-only"
          title={t("adjust.title")}
          description={t("adjust.subtitle")}
          action={
            <Link
              href="/review"
              className="text-[13px] font-medium text-accent underline-offset-[3px] hover:underline"
            >
              {t("adjust.reviewLink")}
            </Link>
          }
          className="max-w-none"
        />
        <ProfileProgramSummary profile={profile} />

        <section
          className="coach-panel-subtle mt-4 border border-white/[0.08] px-4 py-4"
          aria-labelledby="adjust-coach-display-heading"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("adjust.coachDisplayEyebrow")}
          </p>
          <h2
            id="adjust-coach-display-heading"
            className="mt-2 text-[15px] font-semibold leading-snug text-foreground"
          >
            {t("adjust.coachDisplayTitle")}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {t("adjust.coachDisplayBody")}
          </p>
          <Link
            href="/preferences"
            className="mt-4 inline-flex min-h-[44px] items-center text-[14px] font-semibold text-accent underline-offset-[3px] hover:underline"
          >
            {t("adjust.coachDisplayCta")}
          </Link>
        </section>

        <HelpVideoCard
          pageId="adjustments"
          enabled={ft.showHelpVideos}
          className="mt-4"
        />
        {ft.showExceptionGuidance ? (
          <ExceptionEnginePanel referenceDate={now} />
        ) : null}
        {packageContext ? (
          <p className="mt-3 max-w-[22rem] text-[12px] font-medium leading-snug text-muted">
            {packageContext}
          </p>
        ) : null}

        {/* 1 — Aktiivinen nyt (pääelementti) */}
        <div
          className="coach-panel-live relative mt-6 overflow-hidden px-4 py-4"
          role="region"
          aria-labelledby="primary-adjust"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(115%_90%_at_100%_-15%,rgba(76,111,255,0.22),transparent_52%)]"
            aria-hidden
          />
          <p
            id="primary-adjust"
            className="relative text-[10px] font-bold uppercase tracking-[0.2em] text-accent"
          >
            {t("adjust.activeNow")}
          </p>
          <p className="relative mt-2.5 text-[17px] font-semibold leading-[1.25] tracking-[-0.035em] text-foreground">
            {liveLine}
          </p>
          <p className="relative mt-2 text-[12px] font-medium leading-snug text-muted">
            {t("adjust.liveSubline")}
          </p>
        </div>

        {/* 2 — Horisontti */}
        <section className="mt-5" aria-labelledby="upcoming">
          <h2
            id="upcoming"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2"
          >
            {t("adjust.horizon")}
          </h2>
          {horizonPreview.length > 0 ? (
            <ul className="mt-2.5 space-y-2">
              {horizonPreview.map((e) => (
                <li
                  key={e.id}
                  className="rounded-[var(--radius-lg)] border border-border/70 bg-card/90 px-3 py-2.5 text-[13px] font-medium leading-snug text-foreground shadow-sm"
                >
                  {horizonLine(e, locale, t)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2.5 text-[13px] font-medium leading-snug text-muted">
              {t("adjust.horizonEmptyWeek")}
            </p>
          )}
          {showSocialHint ? (
            <p className="mt-2 text-[11px] leading-snug text-muted-2">
              {t("adjust.horizonSocialHintShort")}
            </p>
          ) : null}
        </section>

        <details className="coach-panel-subtle mt-5 border-t border-border/45 pt-2 group">
          <summary className="cursor-pointer list-none px-1 py-3 text-[13px] font-medium text-muted marker:content-none [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-3">
              <span>{t("adjust.detailContext")}</span>
              <span className="text-[11px] font-normal tabular-nums text-muted-2 group-open:hidden">
                {t("common.show")}
              </span>
              <span className="hidden text-[11px] font-normal tabular-nums text-muted-2 group-open:inline">
                {t("common.hide")}
              </span>
            </span>
          </summary>
          <div className="border-t border-border/35 px-1 pb-1 pt-4">
            <section aria-labelledby="applied">
              <h2
                id="applied"
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2"
              >
                {t("adjust.applied")}
              </h2>
              <dl className="mt-2.5 divide-y divide-border/35">
                <div className="flex items-baseline justify-between gap-3 py-2 first:pt-0">
                  <dt className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-2">
                    {t("adjust.fromYesterday")}
                  </dt>
                  <dd className="text-right text-[12px] font-medium leading-snug text-foreground">
                    {fromYesterday}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 py-2">
                  <dt className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-2">
                    {t("adjust.missedWorkout")}
                  </dt>
                  <dd className="text-right text-[12px] font-medium leading-snug text-foreground">
                    {missedLine ?? t("common.none")}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 py-2">
                  <dt className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-2">
                    {t("adjust.calorieDrift")}
                  </dt>
                  <dd className="text-right text-[12px] font-medium leading-snug text-foreground">
                    {driftLine ?? t("common.none")}
                  </dd>
                </div>
                {signals.activityShortfall ? (
                  <div className="flex items-baseline justify-between gap-3 py-2">
                    <dt className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-2">
                      {t("adjust.signalSteps")}
                    </dt>
                    <dd className="text-right text-[12px] font-medium leading-snug text-muted">
                      {t("adjust.stepsHintShort")}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className="mt-5" aria-labelledby="why">
              <h2
                id="why"
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2"
              >
                {t("adjust.whyProfile")}
              </h2>
              <p className="mt-2 text-[14px] font-medium leading-snug tracking-[-0.02em] text-foreground">
                {whyOneLiner}
              </p>
              {adjustEngineLine ? (
                <p className="mt-3 text-[12px] font-semibold leading-snug text-accent/90">
                  {adjustEngineLine}
                </p>
              ) : null}
            </section>
          </div>
        </details>

        {/* 5 — Tapahtuma (työkalu, erotettu) */}
        <section
          className="mt-8 border-t-2 border-border/50 pt-5"
          aria-labelledby="add-events"
        >
          <h2
            id="add-events"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2"
          >
            {t("adjust.eventsTitle")}
          </h2>
          <p className="mt-1 text-[11px] leading-snug text-muted-2">
            {t("adjust.eventsHint")}
          </p>
          <form
            className="mt-3 flex flex-col gap-2.5"
            onSubmit={onAddEvent}
            aria-busy={addEventAction.loading}
          >
            <div>
              <label
                className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-2"
                htmlFor="ev-label"
              >
                {t("adjust.eventLabel")}
              </label>
              <input
                id="ev-label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                disabled={addEventAction.loading}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-border/80 bg-background px-2.5 py-2 text-[13px] text-foreground outline-none focus:border-accent/45 focus:ring-1 focus:ring-accent/25 disabled:opacity-60"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="min-w-[7.5rem] flex-1">
                <label
                  className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-2"
                  htmlFor="ev-date"
                >
                  {t("adjust.eventDate")}
                </label>
                <input
                  id="ev-date"
                  type="date"
                  value={newDateIso}
                  onChange={(e) => setNewDateIso(e.target.value)}
                  disabled={addEventAction.loading}
                  className="mt-1 w-full rounded-[var(--radius-md)] border border-border/80 bg-background px-2.5 py-2 text-[13px] text-foreground disabled:opacity-60"
                />
              </div>
              <div className="min-w-[7.5rem] flex-1">
                <label
                  className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-2"
                  htmlFor="ev-kind"
                >
                  {t("adjust.eventKind")}
                </label>
                <select
                  id="ev-kind"
                  value={newKind}
                  onChange={(e) =>
                    setNewKind(e.target.value as PlannedEvent["kind"])
                  }
                  disabled={addEventAction.loading}
                  className="mt-1 w-full rounded-[var(--radius-md)] border border-border/80 bg-background px-2.5 py-2 text-[13px] text-foreground disabled:opacity-60"
                >
                  <option value="social">{t("adjust.kindSocial")}</option>
                  <option value="travel">{t("adjust.kindTravel")}</option>
                  <option value="flexible_intake">
                    {t("adjust.kindFlex")}
                  </option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={addEventAction.loading}
              className="mt-0.5 min-h-[42px] rounded-[var(--radius-lg)] border border-accent/35 bg-accent/10 px-3 text-[13px] font-semibold text-accent transition hover:bg-accent-soft/70 disabled:opacity-60"
            >
              {addEventAction.loading ? t("common.loading") : t("adjust.eventAdd")}
            </button>
          </form>
          {upcomingModel.all.length > 0 ? (
            <ul className="mt-3 space-y-1 border-t border-border/35 pt-3">
              {upcomingModel.all.map((ev) => (
                <li
                  key={ev.id}
                  className="flex items-center justify-between gap-2 py-1.5 text-[12px]"
                >
                  <span className="min-w-0 leading-snug text-muted">
                    <span className="text-muted-2">{ev.dateKey}</span> ·{" "}
                    {ev.label}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 text-[11px] font-medium text-muted-2 underline-offset-2 hover:text-foreground hover:underline"
                    onClick={() => {
                      removePlannedEvent(ev.id);
                      bumpEvents();
                    }}
                  >
                    {t("adjust.eventRemove")}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <div className="mt-8 border-t border-border/45 pt-8">
          <Link
            href="/app"
            className="flex min-h-[48px] items-center justify-center text-[15px] font-semibold text-accent underline-offset-[3px] hover:underline"
          >
            {t("adjust.backToday")}
          </Link>
        </div>

        <div className="mt-10 border-t border-border/40 pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("settings.buildMarkerEyebrow")}
          </p>
          <div className="mt-2">
            <BuildMarkerLine compact />
          </div>
        </div>

        <CoachAppShortcuts
          compact
          omit={["/adjustments"]}
          extra={[{ href: "/paywall", labelKey: "paywall.linkPremium" }]}
          className="mt-10"
        />
      </Container>
    </main>
  );
}
