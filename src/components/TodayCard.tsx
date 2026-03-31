"use client";

import { RealityScoreStrip } from "@/components/reality/RealityScoreStrip";
import { StreakRhythmBlock } from "@/components/streak/StreakRhythmBlock";
import type { StreakRhythmTone } from "@/components/streak/StreakRhythmBlock";
import { CoachSystemStatus } from "@/components/ui/CoachSystemStatus";
import { useTranslation } from "@/hooks/useTranslation";
import type { DailyFocus } from "@/lib/dailyFocus";
import type { MessageKey } from "@/lib/i18n";
import type { RealityScore } from "@/lib/realityScore";
import type { StreakSummary } from "@/lib/streaks";
import {
  DEFAULT_COACH_FEATURE_TOGGLES,
  type CoachFeatureToggles,
} from "@/types/coachPreferences";
import type { ExceptionGuidanceStrings } from "@/types/exceptions";
import Link from "next/link";
import type { ReactNode } from "react";

export type CoachHeroBlock = {
  mainMessage: string;
  direction: string;
};

type Props = {
  weekday: string;
  calendarDate: string;
  /** Package name chip — short, optional */
  packageBadge: string | null;
  /** Hero coach copy — one main + one direction */
  coachHero?: CoachHeroBlock | null;
  /** Pro — suggested workout structure */
  proStructureNote?: string | null;
  proExerciseNames?: string[];
  /** Single daily focus block */
  focus: DailyFocus;
  food: string;
  activity: string;
  /** Yksi päästatus (Tasapainossa, Rytmi rikki, …) */
  systemStatusKey: MessageKey;
  systemStatusLive: boolean;
  /** Treenipäivä: linkki esim. /workout */
  startWorkoutHref?: string;
  /** Lisäliike — ruokarivin jälkeen */
  extraMoveSlot?: ReactNode;
  /** Päivän liikebonus (kcal), plan.activityEnergyBonusKcal */
  activityEnergyBonusKcal?: number;
  dayDone: boolean;
  /** True while “close day” is in flight */
  isMarkingDone: boolean;
  onToggleDay: () => void;
  /** Sulun kolme kerrosta + huomisen tease (kun päivä merkitty valmiiksi). */
  dayCloseRetention: {
    headlineKey: MessageKey;
    feelingKey: MessageKey;
    tomorrowKey: MessageKey;
    teaseKey: MessageKey;
  } | null;
  onQuickDone: () => void;
  onQuickSkip: () => void;
  quickChangeHref: string;
  exceptionGuidance?: ExceptionGuidanceStrings | null;
  onClearException?: () => void;
  /** Hallittu ylisyöntitasapainotus (kcal / pv) */
  rebalanceDailyKcal?: number | null;
  trialBanner?: string | null;
  /** Kun asetettu, kokeilurivi on linkki esim. /paywall */
  trialBannerHref?: string;
  /** Lyhyt: rungon nimi (esim. “Tämän profiilin runko · …”) */
  programPresetLine?: string | null;
  /** Yksi lause: miksi tämä viikko vastaa profiilia */
  programRationaleLine?: string | null;
  /** Viikkoadaptaation otsikko (moottori) */
  engineWeekLine?: string | null;
  /** Pikamuistiinpano (esim. äänellä) */
  quickNoteLine?: string | null;
  /** Valmentajan ääni — yksi lyhyt linja */
  coachPresenceLine?: string | null;
  /** Kun dataa on vähän — yksi fallback-lause */
  dataFallbackKey?: MessageKey | null;
  /** Real life match — compact strip under system status */
  realityScore?: RealityScore | null;
  streakSummary?: StreakSummary | null;
  streakTone?: StreakRhythmTone;
  /** Oma valmentaja — näkyvyys */
  features?: CoachFeatureToggles;
  /** Yksi pääankkuri: treenipäivällä treeni, muuten fokus */
  primaryAnchor?: "focus" | "workout";
};

export function TodayCard({
  weekday,
  calendarDate,
  packageBadge,
  coachHero,
  proStructureNote,
  proExerciseNames,
  focus,
  food,
  activity,
  systemStatusKey,
  systemStatusLive,
  startWorkoutHref,
  extraMoveSlot,
  activityEnergyBonusKcal,
  dayDone,
  isMarkingDone,
  onToggleDay,
  dayCloseRetention,
  onQuickDone,
  onQuickSkip,
  quickChangeHref,
  exceptionGuidance,
  onClearException,
  rebalanceDailyKcal,
  trialBanner,
  trialBannerHref,
  programPresetLine,
  programRationaleLine,
  engineWeekLine,
  quickNoteLine,
  coachPresenceLine,
  dataFallbackKey,
  realityScore,
  streakSummary,
  streakTone,
  features = DEFAULT_COACH_FEATURE_TOGGLES,
  primaryAnchor = "focus",
}: Props) {
  const { t, locale } = useTranslation();
  const hl = features.showHardlineTone;
  const anchorWorkout = primaryAnchor === "workout";

  return (
    <section
      className="coach-panel-today-hero"
      aria-labelledby="today-heading"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-6 h-44 w-44 rounded-full bg-[rgba(41,92,255,0.38)] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_90%_at_100%_-15%,var(--panel-glow),transparent_52%)]"
        aria-hidden
      />
      <div className="coach-topline" aria-hidden />

      <div className="relative px-5 pb-8 pt-6 sm:px-8 sm:pb-9 sm:pt-8">
        {/* 1. Päivän status */}
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <CoachSystemStatus
            text={t(systemStatusKey)}
            liveSignal={systemStatusLive}
          />
        </div>

        <p className="mt-4 text-center text-[13px] font-semibold leading-snug text-accent sm:text-left">
          {t("today.doThisToday")}
        </p>

        <div className="mt-4 space-y-3 opacity-[0.72]">
        {features.showCoachLines && coachPresenceLine ? (
          <p className="max-w-[26rem] border-l-2 border-accent/35 pl-3 text-left text-[13px] font-medium leading-snug text-muted sm:mx-0">
            {coachPresenceLine}
          </p>
        ) : null}

        {trialBanner ? (
          trialBannerHref ? (
            <Link
              href={trialBannerHref}
              className="mt-2 block w-full text-center text-[11px] font-medium leading-snug text-muted-2 underline-offset-2 transition hover:text-foreground hover:underline sm:text-left"
            >
              {trialBanner}
            </Link>
          ) : (
            <p className="mt-2 w-full text-center text-[11px] font-medium leading-snug text-muted-2 sm:text-left">
              {trialBanner}
            </p>
          )
        ) : null}

        {programPresetLine ? (
          <p
            className="mt-3 max-w-[26rem] text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-accent/90 sm:text-left"
            role="status"
          >
            {programPresetLine}
          </p>
        ) : null}

        {programRationaleLine ? (
          <p
            className={`max-w-[26rem] text-center text-[12px] font-medium leading-snug text-muted sm:text-left ${programPresetLine ? "mt-2" : "mt-3"}`}
            role="status"
          >
            {programRationaleLine}
          </p>
        ) : null}

        {engineWeekLine ? (
          <p
            className="mt-2 max-w-[26rem] text-center text-[11px] font-semibold leading-snug text-accent/90 sm:text-left"
            role="status"
          >
            {engineWeekLine}
          </p>
        ) : null}

        {quickNoteLine ? (
          <p
            className="mt-3 max-w-[26rem] rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-center text-[11px] leading-snug text-muted sm:text-left"
            role="status"
          >
            <span className="font-semibold text-foreground/90">
              {t("today.quickNoteLabel")}
            </span>{" "}
            {quickNoteLine}
          </p>
        ) : null}

        {features.showRealityScore && realityScore ? (
          <RealityScoreStrip score={realityScore} locale={locale} />
        ) : null}

        {features.showStreaks && streakSummary && streakTone ? (
          <StreakRhythmBlock
            summary={streakSummary}
            tone={streakTone}
            className="mt-3"
          />
        ) : null}

        {features.showNutritionCorrections &&
        rebalanceDailyKcal != null &&
        rebalanceDailyKcal > 0 ? (
          <div
            className="w-full rounded-[var(--radius-lg)] border border-accent/20 bg-white/[0.03] px-3.5 py-2.5 text-center sm:text-left"
            role="status"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
              {t("today.rebalanceActive")}
            </p>
            <p className="mt-1 text-[11px] font-medium leading-snug text-foreground">
              {t("today.rebalanceDetail", { kcal: rebalanceDailyKcal })}
            </p>
            <p className="mt-1 text-[10px] leading-snug text-muted-2">
              {t("rebalance.leadLine")}
            </p>
          </div>
        ) : null}
        </div>

        <header className="mt-5 text-center sm:mt-6 sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <h2
              id="today-heading"
              className="text-[1.125rem] font-semibold leading-[1.12] tracking-[-0.035em] text-muted-2 sm:text-[1.2rem]"
            >
              <span>{weekday}</span>
              <span className="mx-1.5 text-border-strong" aria-hidden>
                ·
              </span>
              <span className="text-foreground">{calendarDate}</span>
            </h2>
            {packageBadge ? (
              <span className="inline-flex max-w-full rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-medium tracking-[0.04em] text-muted-2">
                {packageBadge}
              </span>
            ) : null}
          </div>
          {dataFallbackKey ? (
            <p
              className="mt-3 text-[11px] leading-relaxed text-muted-2"
              role="status"
            >
              {t(dataFallbackKey)}
            </p>
          ) : null}
        </header>

        {/* 2. Pääfokus — visuaalinen paino alas kun ankkuri on treeni */}
        <div className={`relative mt-8 ${anchorWorkout ? "opacity-80" : ""}`}>
          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${anchorWorkout ? "text-muted-2/90" : "text-muted-2"}`}
          >
            {t("today.labelFocus")}
          </p>
          <div
            className={`mt-3 p-5 sm:p-6 ${
              anchorWorkout
                ? "rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.03] shadow-none"
                : `rounded-[var(--radius-xl)] border border-[rgba(90,132,255,0.38)] bg-gradient-to-br from-white/[0.06] via-[rgba(41,92,255,0.12)] to-[rgba(20,40,90,0.2)] shadow-[0_18px_48px_-14px_rgba(41,92,255,0.35)] ${
                    hl
                      ? "ring-2 ring-accent/45"
                      : "ring-1 ring-white/[0.08]"
                  }`
            }`}
          >
            <p
              className={`font-semibold leading-[1.15] tracking-[-0.035em] text-foreground ${anchorWorkout ? "text-[1.05rem] sm:text-[1.1rem]" : "text-[1.28rem] sm:text-[1.4rem]"}`}
            >
              {focus.title}
            </p>
            <p className="mt-2 text-[13px] font-medium leading-snug text-muted sm:text-[14px]">
              {focus.subtitle}
            </p>
            {features.showCoachLines ? (
              <p className="mt-3 border-t border-white/[0.08] pt-3 text-[12px] font-medium leading-relaxed text-muted-2">
                {focus.coachNote}
              </p>
            ) : null}
          </div>
        </div>

        {/* 3. Valmentajan päätös */}
        {features.showCoachLines && coachHero ? (
          <div
            className={`relative mt-8 text-center sm:text-left ${anchorWorkout ? "opacity-75" : ""} ${hl ? "rounded-[var(--radius-lg)] border border-accent/35 bg-white/[0.04] px-4 py-4 sm:px-5" : ""}`}
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-accent">
              {t("today.coachIntelEyebrow")}
            </p>
            <p
              className={`mt-4 font-semibold leading-[1.12] tracking-[-0.045em] text-foreground ${anchorWorkout ? "text-[1.25rem] sm:text-[1.35rem]" : "text-[1.625rem] sm:text-[1.875rem]"}`}
            >
              {coachHero.mainMessage}
            </p>
            <p className="mt-2.5 max-w-[26rem] text-[14px] font-medium leading-snug text-muted sm:text-[15px]">
              {coachHero.direction}
            </p>
          </div>
        ) : null}

        {proStructureNote && (proExerciseNames?.length ?? 0) > 0 ? (
          <div className="relative mt-6 rounded-[var(--radius-lg)] border border-white/[0.1] bg-white/[0.04] px-4 py-4 sm:px-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-2">
              {proStructureNote}
            </p>
            <ul className="mt-3 space-y-2">
              {proExerciseNames!.slice(0, 5).map((name) => (
                <li
                  key={name}
                  className="text-[14px] font-medium leading-snug text-foreground/95"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* 4. Treeni — korostus kun primaryAnchor === workout */}
        {startWorkoutHref ? (
          <div
            className={`relative mt-8 ${anchorWorkout ? "rounded-[var(--radius-xl)] border border-accent/40 bg-gradient-to-b from-accent/[0.14] to-white/[0.02] p-4 sm:p-5" : ""}`}
          >
            <p
              className={`text-[10px] font-semibold uppercase tracking-[0.22em] ${anchorWorkout ? "text-accent" : "text-muted-2"}`}
            >
              {t("ui.workout")}
            </p>
            <div className="mt-3">
              <Link
                href={startWorkoutHref}
                prefetch
                className={
                  anchorWorkout
                    ? "group coach-today-cta-primary flex min-h-[52px] w-full items-center justify-center text-center no-underline"
                    : "flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-lg)] border border-white/[0.14] bg-white/[0.06] text-center text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground no-underline transition hover:border-accent/40 hover:bg-white/[0.09]"
                }
              >
                <span className="relative z-[1]">
                  {t("today.startWorkoutCta")}
                </span>
                {anchorWorkout ? (
                  <span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  />
                ) : null}
              </Link>
            </div>
          </div>
        ) : null}

        {/* 5. Ruoka */}
        <div className="relative mt-5 rounded-[var(--radius-lg)] border border-white/[0.06] bg-white/[0.02] px-4 py-3 opacity-[0.92]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-2">
            {t("today.secondaryFood")}
          </p>
          <p className="mt-2 text-[13px] font-medium leading-snug text-foreground/95">
            {food}
          </p>
          <Link
            href="/food"
            prefetch
            className="mt-3 inline-flex min-h-[44px] items-center text-[12px] font-semibold text-accent underline-offset-[3px] hover:underline"
          >
            {t("today.openFoodCta")}
          </Link>
        </div>

        {/* 6. Päivän liike (suunnitelma) */}
        <div className="relative mt-4 rounded-[var(--radius-lg)] border border-white/[0.06] bg-white/[0.02] px-4 py-3 opacity-[0.88]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-2">
            {t("today.secondaryMove")}
          </p>
          <p className="mt-2 text-[13px] font-medium leading-snug text-muted">
            {activity}
          </p>
        </div>

        {features.showExceptionGuidance && exceptionGuidance ? (
          <div
            className="relative mt-5 rounded-[var(--radius-lg)] border border-accent/28 bg-white/[0.04] px-4 py-4"
            role="region"
            aria-labelledby="today-exception-heading"
          >
            <p
              id="today-exception-heading"
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent"
            >
              {t("exception.todayEyebrow")}
            </p>
            <dl className="mt-3 space-y-2.5 text-[12px] leading-snug">
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-2">
                  {t("exception.resultTraining")}
                </dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {exceptionGuidance.training}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-2">
                  {t("exception.resultFood")}
                </dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {exceptionGuidance.food}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-2">
                  {t("exception.resultRecovery")}
                </dt>
                <dd className="mt-0.5 text-muted">{exceptionGuidance.recovery}</dd>
              </div>
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-2">
                  {t("exception.resultCheck")}
                </dt>
                <dd className="mt-0.5 text-muted">{exceptionGuidance.durationCheck}</dd>
              </div>
              <div>
                <dt className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-2">
                  {t("exception.resultNote")}
                </dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {exceptionGuidance.coachNote}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-[10px] leading-snug text-muted-2">
              {t("exception.safetyFooter")}
            </p>
            {onClearException ? (
              <button
                type="button"
                onClick={onClearException}
                className="mt-3 text-[12px] font-medium text-accent underline-offset-2 hover:underline"
              >
                {t("exception.clearActive")}
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Nopeat toiminnot */}
        <div className="relative mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-2">
            {t("today.quickActionsEyebrow")}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onQuickDone}
              className="min-h-[48px] rounded-[var(--radius-md)] border border-accent/35 bg-accent/10 px-2 text-[12px] font-semibold tracking-[0.06em] text-foreground transition hover:border-accent/55 hover:bg-accent/15"
            >
              {t("today.quickDone")}
            </button>
            <button
              type="button"
              onClick={onQuickSkip}
              className="min-h-[48px] rounded-[var(--radius-md)] border border-white/[0.12] bg-white/[0.06] px-2 text-[12px] font-semibold tracking-[0.06em] text-foreground transition hover:border-accent/40 hover:bg-white/[0.09]"
            >
              {t("today.quickSkip")}
            </button>
            <Link
              href={quickChangeHref}
              prefetch
              className="flex min-h-[48px] items-center justify-center rounded-[var(--radius-md)] border border-white/[0.12] bg-white/[0.06] px-2 text-center text-[12px] font-semibold tracking-[0.06em] text-foreground no-underline transition hover:border-accent/40 hover:bg-white/[0.09]"
            >
              {t("today.quickChange")}
            </Link>
          </div>
        </div>

        {/* 7. Lisäliike */}
        {features.showDailyActivityInput && extraMoveSlot ? (
          <div className="relative mt-6">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-2">
              {t("today.extraMoveSection")}
            </p>
            {extraMoveSlot}
          </div>
        ) : null}
        {features.showDailyActivityInput &&
        activityEnergyBonusKcal != null &&
        activityEnergyBonusKcal > 0 ? (
          <p
            className="mt-3 text-center text-[12px] font-medium leading-snug text-accent/90 sm:text-left"
            role="status"
          >
            {t("today.activityBonusAck", { kcal: activityEnergyBonusKcal })}
          </p>
        ) : null}

        {/* 8. Päivän sulku */}
        <div className="mt-8 border-t border-border/50 pt-6">
          {!dayDone ? (
            <>
              <p className="mb-3 text-center text-[11px] font-medium leading-snug text-muted-2 sm:text-left">
                {t("today.ctaHint")}
              </p>
              <button
                type="button"
                disabled={isMarkingDone}
                onClick={onToggleDay}
                className="group coach-today-cta-primary min-h-[52px] w-full disabled:pointer-events-none disabled:opacity-70"
              >
                {isMarkingDone ? (
                  <span className="relative z-[1]">{t("today.markingDay")}</span>
                ) : (
                  <>
                    <span className="relative z-[1]">{t("ui.closeDay")}</span>
                    <span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden
                    />
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-accent/25 bg-gradient-to-br from-accent/[0.12] to-white/[0.04] px-4 py-5 text-center shadow-[0_12px_40px_-16px_rgba(59,130,246,0.45)] sm:text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
                {t("today.dayCloseEyebrow")}
              </p>
              {dayCloseRetention && features.showCoachLines ? (
                <>
                  <p className="mt-3 text-[17px] font-semibold leading-[1.35] tracking-[-0.025em] text-foreground">
                    {t(dayCloseRetention.headlineKey)}
                  </p>
                  <p className="mt-3 text-[13px] font-medium leading-relaxed text-muted-2">
                    {t(dayCloseRetention.feelingKey)}
                  </p>
                  <p className="mt-3 text-[13px] font-medium leading-snug text-muted">
                    {t(dayCloseRetention.tomorrowKey)}
                  </p>
                  <div className="mt-5 border-t border-accent/20 pt-4">
                    <p className="text-[12px] font-semibold leading-snug text-accent/95">
                      {t(dayCloseRetention.teaseKey)}
                    </p>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-[16px] font-semibold leading-snug text-foreground">
                  {t("today.dayClose.lineA")}
                </p>
              )}
              <button
                type="button"
                onClick={onToggleDay}
                className="mt-4 min-h-[44px] text-[12px] font-medium text-muted underline-offset-[3px] transition hover:text-foreground hover:underline"
              >
                {t("today.reopenDayLink")}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
