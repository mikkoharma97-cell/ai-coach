"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { CoachAppShortcuts } from "@/components/app/CoachAppShortcuts";
import { Container } from "@/components/ui/Container";
import { HelpVideoCard } from "@/components/ui/HelpVideoCard";
import { ProgressHeroInsightCard } from "@/components/progress/ProgressHeroInsightCard";
import { ProgressMetricsRow } from "@/components/progress/ProgressMetricsRow";
import { FirstUserProgressPreview } from "@/components/progress/FirstUserProgressPreview";
import { WeightTrendCard } from "@/components/progress/WeightTrendCard";
import { CoachProfileMissingFallback } from "@/components/CoachProfileMissingFallback";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useTranslation } from "@/hooks/useTranslation";
import type { MessageKey } from "@/lib/i18n";
import { buildRebalancePlan } from "@/lib/nutrition/rebalance";
import { collectOvereatingEventsForLast7Days } from "@/lib/nutrition/rebalanceCollect";
import { buildRealityScore } from "@/lib/realityScore";
import { gatherRealityScoreContext } from "@/lib/realityScoreContext";
import {
  buildStrengthRows,
  computeConsistency,
  computeProgressHeroInsight,
  loadMacroDays,
  loadWeightSeries,
  WEIGHT_LOG_CHANGED,
} from "@/lib/progress";
import { WeightQuickLog } from "@/components/progress/WeightQuickLog";
import { progressDataFallbackKey } from "@/lib/dataConfidence";
import { progressContinueReasonKey } from "@/lib/progressContinueReason";
import { computeStreakSummary } from "@/lib/streaks";
import { isFoodOnlyMode } from "@/lib/appUsageMode";
import { getCoachFeatureToggles } from "@/lib/coachFeatureToggles";
import { generateDailyPlan } from "@/lib/dailyEngine";
import { shouldShowProgressExamples } from "@/lib/firstUserProgressUi";

export function ProgressPage() {
  const { t, locale } = useTranslation();
  const profile = useClientProfile();
  const ref = useMemo(() => new Date(), []);
  const [weightTick, setWeightTick] = useState(0);
  const bumpWeight = useCallback(() => setWeightTick((x) => x + 1), []);

  useEffect(() => {
    const onW = () => bumpWeight();
    window.addEventListener(WEIGHT_LOG_CHANGED, onW);
    return () => window.removeEventListener(WEIGHT_LOG_CHANGED, onW);
  }, [bumpWeight]);
  const streaks = useMemo(
    () => (profile ? computeStreakSummary(profile, ref) : null),
    [profile, ref],
  );
  const consistency = useMemo(
    () => (profile ? computeConsistency(profile, ref, 14) : null),
    [profile, ref],
  );
  const strengthRows = useMemo(
    () => buildStrengthRows(locale === "en" ? "en" : "fi"),
    [locale],
  );
  const rebalanceActive = useMemo(() => {
    if (!profile) return false;
    const ev = collectOvereatingEventsForLast7Days(profile, ref, locale);
    return buildRebalancePlan(ev) != null;
  }, [profile, ref, locale]);
  const macroDays7 = useMemo(
    () => (profile ? loadMacroDays(profile, ref, 7) : []),
    [profile, ref],
  );
  const weightForHero = useMemo(
    () => (profile ? loadWeightSeries(6, profile) : { points: [], synthetic: true }),
    [profile, weightTick],
  );
  const heroInsight = useMemo(() => {
    if (!profile || !streaks || !consistency) return null;
    return computeProgressHeroInsight(
      profile,
      streaks,
      strengthRows,
      weightForHero,
      macroDays7,
      consistency,
    );
  }, [profile, streaks, strengthRows, weightForHero, macroDays7, consistency]);

  const realityScore = useMemo(() => {
    if (!profile) return null;
    const ctx = gatherRealityScoreContext(profile, ref);
    return buildRealityScore({ ...ctx, locale });
  }, [profile, ref, locale]);

  const progressFallbackKey = useMemo((): MessageKey | null => {
    if (!streaks) return null;
    return progressDataFallbackKey(streaks.combined);
  }, [streaks]);

  const continueReasonKey = useMemo((): MessageKey | null => {
    if (!streaks || !consistency) return null;
    return progressContinueReasonKey({
      combinedStreak: streaks.combined,
      consistencyPct: consistency.pct,
      rebalanceActive,
    });
  }, [streaks, consistency, rebalanceActive]);

  const planPreview = useMemo(
    () => (profile ? generateDailyPlan(profile, ref, locale) : null),
    [profile, ref, locale],
  );
  const weightForExamples = useMemo(
    () => (profile ? loadWeightSeries(6, profile) : { points: [], synthetic: true }),
    [profile, weightTick],
  );
  const showProgressExamples = shouldShowProgressExamples(
    streaks?.combined ?? 0,
    ref,
    weightForExamples.points.length >= 2,
  );

  const features = useMemo(
    () => getCoachFeatureToggles(profile ?? null),
    [profile],
  );

  if (profile === undefined) {
    return (
      <Container className="py-6">
        <p className="text-[13px] text-muted">{t("common.loading")}</p>
      </Container>
    );
  }

  if (!profile) {
    return <CoachProfileMissingFallback />;
  }

  if (!streaks || !consistency) {
    return (
      <Container className="py-6">
        <p className="text-[13px] text-muted">{t("common.loading")}</p>
      </Container>
    );
  }

  const ft = features;
  const foodOnly = isFoodOnlyMode(profile);

  return (
    <main className="coach-page">
      <Container size="phone" className="pb-28 pt-6 sm:px-6">
        <div className="pointer-events-none mb-2 h-px w-full bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <h1 className="coach-page-headline">{t("nav.progress")}</h1>
        {foodOnly ? (
          <p className="mt-2 max-w-[26rem] text-[14px] font-medium leading-snug text-muted">
            {t("foodOnly.progressLead")}
          </p>
        ) : (
          <p className="mt-2 max-w-[26rem] text-[14px] font-medium leading-snug text-muted">
            {t("progress.oneTruthLead")}
          </p>
        )}
        <Link
          href="/app"
          className="mt-5 inline-flex min-h-[44px] items-center text-[13px] font-semibold text-accent underline-offset-[3px] hover:underline"
        >
          {t("nav.backToToday")}
        </Link>
        {progressFallbackKey ? (
          <p
            className="mb-2 mt-3 text-[11px] leading-relaxed text-muted-2"
            role="status"
          >
            {t(progressFallbackKey)}
          </p>
        ) : null}

        {showProgressExamples ? (
          <div className="mt-6">
            <FirstUserProgressPreview
              plan={planPreview}
              compact={profile.mode === "pro"}
              showKcalChart={ft.showProgressCharts}
            />
          </div>
        ) : null}

        {ft.showProgressCharts ? (
          <div className="mt-8">
            <WeightTrendCard profile={profile} version={weightTick} />
          </div>
        ) : (
          <p
            className="mt-8 text-[12px] leading-relaxed text-muted-2"
            role="status"
          >
            {t("progress.chartsHiddenHint")}
          </p>
        )}

        <ProgressMetricsRow
          consistency={consistency}
          combinedStreak={streaks.combined}
        />

        <WeightQuickLog onLogged={bumpWeight} />
        <div className="mt-6 text-center sm:text-left">
          <Link
            href="/review"
            className="text-[13px] font-semibold text-accent underline-offset-[3px] hover:underline"
          >
            {t("progress.seeWeeklyReview")}
          </Link>
        </div>

        <details className="coach-panel-subtle group mt-10">
          <summary className="cursor-pointer list-none px-4 py-4 text-[13px] font-medium text-muted marker:content-none [&::-webkit-details-marker]:hidden sm:px-5">
            <span className="flex items-center justify-between gap-3">
              <span>{t("progress.moreMetrics")}</span>
              <span className="text-[11px] font-normal tabular-nums text-muted-2 group-open:hidden">
                {t("common.show")}
              </span>
              <span className="hidden text-[11px] font-normal tabular-nums text-muted-2 group-open:inline">
                {t("common.hide")}
              </span>
            </span>
          </summary>
          <div className="space-y-6 border-t border-border/50 px-2 pb-6 pt-6">
            {ft.showCoachLines ? (
              <ProgressHeroInsightCard
                insight={heroInsight}
                realityScore={ft.showRealityScore ? realityScore : null}
              />
            ) : null}
            {ft.showCoachLines && continueReasonKey ? (
              <section
                className="rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03] px-4 py-4"
                aria-labelledby="progress-continue"
              >
                <p
                  id="progress-continue"
                  className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-2"
                >
                  {t("progress.continueEyebrow")}
                </p>
                <p className="mt-2 text-[14px] font-medium leading-snug text-foreground/95">
                  {t(continueReasonKey)}
                </p>
              </section>
            ) : null}
            <HelpVideoCard
              pageId="progress"
              enabled={ft.showHelpVideos}
              className="opacity-95"
            />
          </div>
        </details>

        <CoachAppShortcuts
          compact
          omit={["/progress"]}
          extra={[{ href: "/paywall", labelKey: "paywall.linkPremium" }]}
        />
      </Container>
    </main>
  );
}
