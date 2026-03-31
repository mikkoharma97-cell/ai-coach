"use client";

import { HelpVideoCard } from "@/components/ui/HelpVideoCard";
import { CoachScreenHeader } from "@/components/ui/CoachScreenHeader";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { TrainingIntelligenceBlock } from "@/components/review/TrainingIntelligenceBlock";
import { EXCEPTION_STATE_CHANGED } from "@/lib/exceptionStorage";
import { exceptionWeekSummaryLine } from "@/lib/exceptionWeekReview";
import {
  computeWeeklyReviewContextFlags,
  computeWeeklyReviewWeekMetrics,
  generateWeeklyReview,
} from "@/lib/weeklyReview";
import {
  buildWeeklyAdaptation,
  normalizeProfileForEngine,
  weeklySignalsFromReviewMetrics,
} from "@/lib/coach";
import { resolveProgramFromProfile } from "@/lib/profileProgramResolver";
import { computeNextWeekMomentumKey } from "@/lib/review/nextWeekMomentum";
import {
  buildWeeklyTruth,
  type WeeklyTruth,
} from "@/lib/review/weeklyTruth";
import { reviewClosingLineKey } from "@/lib/coachPresenceCopy";
import { reviewDataFallbackKey } from "@/lib/dataConfidence";
import type { MessageKey, TranslateFn } from "@/lib/i18n";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { useClientProfile } from "@/hooks/useClientProfile";
import { getCoachFeatureToggles } from "@/lib/coachFeatureToggles";
import type { WeeklyReviewDataStrip } from "@/types/coach";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function ReviewDataStrip({
  strip,
  truth,
  momentumKey,
  locale,
  t,
  showCoachLines,
  showStreaks,
}: {
  strip: WeeklyReviewDataStrip;
  truth: WeeklyTruth | null;
  momentumKey: MessageKey | null;
  locale: "fi" | "en";
  t: TranslateFn;
  showCoachLines: boolean;
  showStreaks: boolean;
}) {
  const consKey =
    strip.consistency === "high"
      ? "review.strip.consistency.high"
      : strip.consistency === "low"
        ? "review.strip.consistency.low"
        : "review.strip.consistency.mid";

  const showSleep =
    strip.avgSleepHours != null && strip.avgSleepHours > 0;

  return (
    <div
      className="mt-5 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border/60 bg-card/60 px-3 py-3"
      aria-label={t("review.coachEyebrow")}
    >
      {showStreaks ? (
      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-2">
          {t("review.strip.rhythmStreak")}
        </p>
        <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-foreground">
          {strip.streakDays}
        </p>
      </div>
      ) : null}
      <div className={`${showStreaks ? "border-t border-border/45 pt-3" : ""}`}>
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-2">
          {t("review.strip.consistency")}
        </p>
        <p className="mt-0.5 text-[13px] font-semibold capitalize text-foreground">
          {t(consKey)}
        </p>
      </div>
      <div className="border-t border-border/45 pt-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-2">
          {showSleep ? t("review.strip.sleep") : t("review.strip.protein")}
        </p>
        <p className="mt-0.5 text-[13px] font-semibold tabular-nums text-foreground">
          {showSleep
            ? t("review.strip.unit.nights", {
                h: strip.avgSleepHours!.toFixed(1),
              })
            : t("review.strip.unit.proteinDay", {
                g: Math.round(strip.proteinTargetG ?? 0),
              })}
        </p>
      </div>
      {showCoachLines && truth ? (
        <div className="border-t border-border/45 pt-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-2">
            {t("review.truthEyebrow")}
          </p>
          <p className="mt-1 text-[13px] font-semibold leading-snug text-foreground">
            {locale === "en" ? truth.labelEn : truth.labelFi}
          </p>
          <p className="mt-1 text-[12px] leading-snug text-muted">
            {locale === "en" ? truth.summaryEn : truth.summaryFi}
          </p>
        </div>
      ) : null}
      {showCoachLines && momentumKey ? (
        <div className="border-t border-border/45 pt-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-2">
            {t("review.nextWeekMomentumEyebrow")}
          </p>
          <p className="mt-1 text-[12px] font-medium leading-snug text-muted">
            {t(momentumKey)}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function WeeklyReviewScreen() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const [now] = useState(() => new Date());
  const [exTick, setExTick] = useState(0);

  useEffect(() => {
    if (profile === undefined) return;
    if (!profile) {
      console.debug("[coach] WeeklyReviewScreen: no profile → /start");
      router.replace("/start");
    }
  }, [profile, router]);

  useEffect(() => {
    const b = () => setExTick((x) => x + 1);
    window.addEventListener(EXCEPTION_STATE_CHANGED, b);
    return () => window.removeEventListener(EXCEPTION_STATE_CHANGED, b);
  }, []);

  const exceptionWeekLine = useMemo(
    () => exceptionWeekSummaryLine(now, locale),
    [now, locale, exTick],
  );

  const review = useMemo(() => {
    if (!profile) return null;
    return generateWeeklyReview(profile, now, locale);
  }, [profile, now, locale]);

  const weeklyTruth = useMemo(() => {
    if (!profile || !review) return null;
    const m = computeWeeklyReviewWeekMetrics(profile, now, locale);
    const { exceptions } = computeWeeklyReviewContextFlags(profile, now);
    return buildWeeklyTruth({
      streakDays: review.strip.streakDays,
      consistency: review.strip.consistency,
      trainingScheduled: m.trainingScheduled,
      trainingHit: m.trainingHit,
      trainingMissed: m.trainingMissed,
      calorieDriftDays: m.calorieDriftDays,
      exceptions,
    });
  }, [profile, review, now, locale]);

  const nextWeekMomentumKey = useMemo((): MessageKey | null => {
    if (!profile || !review) return null;
    const m = computeWeeklyReviewWeekMetrics(profile, now, locale);
    return computeNextWeekMomentumKey({
      streakDays: review.strip.streakDays,
      consistency: review.strip.consistency,
      trainingScheduled: m.trainingScheduled,
      trainingHit: m.trainingHit,
    });
  }, [profile, review, now, locale]);

  const reviewFallbackKey = useMemo((): MessageKey | null => {
    if (!review) return null;
    return reviewDataFallbackKey(review.strip.streakDays);
  }, [review]);

  const features = useMemo(
    () => getCoachFeatureToggles(profile ?? null),
    [profile],
  );

  const weekProgramLine = useMemo(() => {
    if (!profile) return null;
    const n = normalizeProfileForEngine(profile);
    const r = resolveProgramFromProfile(n);
    return t(r.programRationaleKey);
  }, [profile, t]);

  const reviewAdaptationLine = useMemo(() => {
    if (!profile || !review) return null;
    const n = normalizeProfileForEngine(profile);
    const m = computeWeeklyReviewWeekMetrics(profile, now, locale);
    const { exceptions } = computeWeeklyReviewContextFlags(profile, now);
    const signals = weeklySignalsFromReviewMetrics({
      trainingMissed: m.trainingMissed,
      calorieDriftDays: m.calorieDriftDays,
      exceptions,
      consistency: review.strip.consistency,
    });
    const adaptation = buildWeeklyAdaptation(n, signals);
    return t(adaptation.detailKey);
  }, [profile, review, now, locale, t]);

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

  if (!review) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[15px] text-muted-2">
        {t("common.loading")}
      </div>
    );
  }

  const { coach, strip } = review;
  const ft = features;

  return (
    <main className="coach-page">
      <Container size="phone" className="px-5">
        <CoachScreenHeader
          eyebrow={t("review.eyebrow")}
          title={review.weekRangeLabel}
          description={t("review.description")}
          className="max-w-none"
        />

        <p className="brand-identity-lead mt-3 max-w-[26rem] text-balance">
          {t("brand.identityLine")}
        </p>

        {weekProgramLine ? (
          <p className="mt-3 max-w-xl text-[13px] font-medium leading-snug text-muted">
            {weekProgramLine}
          </p>
        ) : null}

        {ft.showCoachLines && reviewAdaptationLine ? (
          <p className="mt-2 max-w-xl text-[12px] font-semibold leading-snug text-accent/90">
            {reviewAdaptationLine}
          </p>
        ) : null}

        <HelpVideoCard
          pageId="review"
          enabled={ft.showHelpVideos}
          className="mt-4"
        />

        {reviewFallbackKey ? (
          <p
            className="mt-3 text-[11px] leading-relaxed text-muted-2"
            role="status"
          >
            {t(reviewFallbackKey)}
          </p>
        ) : null}

        {exceptionWeekLine ? (
          <section
            className="mt-5 rounded-[var(--radius-lg)] border border-accent/25 bg-white/[0.04] px-4 py-3.5"
            aria-labelledby="review-exception"
          >
            <h2
              id="review-exception"
              className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent"
            >
              {t("exception.reviewEyebrow")}
            </h2>
            <p className="mt-2 text-[13px] font-medium leading-snug text-foreground">
              {exceptionWeekLine}
            </p>
            <p className="mt-2 text-[10px] leading-snug text-muted-2">
              {t("exception.safetyFooter")}
            </p>
          </section>
        ) : null}

        {ft.showWeeklyCoachReview ? (
        <section
          className="coach-panel-live relative mt-8 overflow-hidden px-5 py-6 sm:px-6 sm:py-7"
          aria-labelledby="coach-headline"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(115%_90%_at_50%_-10%,rgb(224_232_252/0.45),transparent_55%)]"
            aria-hidden
          />
          <div className="coach-topline" aria-hidden />
          <p
            id="coach-headline"
            className="coach-section-label-sm text-accent"
          >
            {t("review.coachEyebrow")}
          </p>
          <p className="relative mt-3 text-[1.25rem] font-semibold leading-[1.32] tracking-[-0.03em] text-foreground sm:text-[1.375rem]">
            {coach.headline}
          </p>
          <div className="relative mt-5 border-t border-border/40 pt-5">
            <ReviewDataStrip
              strip={strip}
              truth={weeklyTruth}
              momentumKey={nextWeekMomentumKey}
              locale={locale}
              t={t}
              showCoachLines={ft.showCoachLines}
              showStreaks={ft.showStreaks}
            />
          </div>
          <details className="relative mt-5 border-t border-border/40 pt-4">
            <summary className="cursor-pointer list-none text-[12px] font-semibold text-accent marker:content-none [&::-webkit-details-marker]:hidden">
              {t("review.moreInsightToggle")}
            </summary>
            <div className="mt-3">
              <TrainingIntelligenceBlock profile={profile} />
            </div>
          </details>
        </section>
        ) : (
          <ReviewDataStrip
            strip={strip}
            truth={weeklyTruth}
            momentumKey={nextWeekMomentumKey}
            locale={locale}
            t={t}
            showCoachLines={ft.showCoachLines}
            showStreaks={ft.showStreaks}
          />
        )}

        {ft.showWeeklyCoachReview ? (
        <section
          className="mt-6 rounded-[var(--radius-xl)] border border-border/70 bg-card/85 px-4 py-4"
          aria-labelledby="review-did"
        >
          <h2
            id="review-did"
            className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2"
          >
            {t("review.whatWorked")}
          </h2>
          <ul className="mt-4 space-y-2.5">
            {coach.didWork.map((line) => (
              <li
                key={line}
                className="flex gap-2.5 text-[13px] font-medium leading-[1.4] text-foreground"
              >
                <span
                  className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  aria-hidden
                />
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-5 border-t border-border/45 pt-5">
            <p
              id="review-held"
              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2"
            >
              {t("review.whatBroke")}
            </p>
            <ul className="mt-2.5 space-y-2.5">
              {coach.heldBack.map((line) => (
                <li
                  key={line}
                  className="flex gap-2.5 text-[13px] leading-[1.4] text-muted"
                >
                  <span
                    className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-muted-2/90"
                    aria-hidden
                  />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>
        ) : null}

        {ft.showWeeklyCoachReview ? (
        <section
          className="coach-panel-live relative mt-6 overflow-hidden px-4 py-5 sm:px-5 sm:py-6"
          aria-labelledby="review-next"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(115%_90%_at_50%_-10%,rgb(224_232_252/0.4),transparent_55%)]"
            aria-hidden
          />
          <div className="coach-topline" aria-hidden />
          <h2 id="review-next" className="coach-section-label-sm text-accent">
            {t("review.nextMove")}
          </h2>
          <ul className="relative mt-3 space-y-2.5">
            {coach.nextMove.map((line) => (
              <li
                key={line}
                className="text-[14px] font-semibold leading-[1.45] text-foreground"
              >
                {line}
              </li>
            ))}
          </ul>
          {coach.coachLine && ft.showCoachLines ? (
            <p className="relative mt-4 border-t border-border/35 pt-4 text-[12px] font-medium leading-relaxed text-muted">
              {coach.coachLine}
            </p>
          ) : null}
        </section>
        ) : null}

        {ft.showCoachLines ? (
          <p className="mx-auto mt-10 max-w-md text-center text-[15px] font-semibold leading-snug text-foreground">
            {t(reviewClosingLineKey(review.weekRangeLabel))}
          </p>
        ) : null}

        <p className="mx-auto mt-6 max-w-md text-center text-[13px] font-medium leading-relaxed text-muted">
          {t("review.closingActionLine")}
        </p>

        <p className="mt-8 text-center text-[10px] font-medium uppercase tracking-[0.1em] text-muted-2">
          {t("review.footer")}
        </p>

        <div className="mt-8 border-t border-border/60 pt-8">
          <Link
            href="/app"
            className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-accent px-4 text-[15px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)]"
          >
            {t("review.ctaBackToday")}
          </Link>
          <Link
            href="/adjustments"
            className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-lg)] border border-border/70 bg-card/60 px-4 text-[14px] font-semibold text-accent transition hover:border-accent/35 hover:bg-accent-soft/40"
          >
            {t("review.ctaCarryWeek")}
          </Link>
          <p className="mt-8 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("review.footerMore")}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[13px] text-muted">
            <Link
              href="/progress"
              className="font-medium text-accent underline-offset-[3px] hover:underline"
            >
              {t("nav.progress")}
            </Link>
            <span className="text-muted-2" aria-hidden>
              ·
            </span>
            <Link
              href="/paywall"
              className="font-medium text-muted underline-offset-[3px] transition hover:text-foreground hover:underline"
            >
              {t("paywall.linkPremium")}
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
