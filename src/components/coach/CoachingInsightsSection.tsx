"use client";

import { CoachingInsightCard } from "@/components/coach/CoachingInsightCard";
import { SupplementCoachRecommendations } from "@/components/coach/SupplementCoachRecommendations";
import { buildCoachingEngineResult } from "@/lib/coach/coaching-engine";
import type { OnboardingAnswers } from "@/types/coach";
import type { Locale } from "@/lib/i18n";
import { useMemo } from "react";

type Props = {
  profile: OnboardingAnswers;
  referenceDate: Date;
  locale: Locale;
  refreshKey?: number;
};

export function CoachingInsightsSection({
  profile,
  referenceDate,
  locale,
  refreshKey = 0,
}: Props) {
  const loc = locale === "en" ? "en" : "fi";
  const result = useMemo(
    () => buildCoachingEngineResult(profile, referenceDate, locale),
    [profile, referenceDate, locale, refreshKey],
  );

  const mainInsights = [
    ...result.warnings,
    ...result.recommendations,
    ...result.insights,
    ...result.productSuggestions,
  ];
  const hasSupplements = result.supplementProducts.length > 0;
  if (mainInsights.length === 0 && !hasSupplements) return null;

  return (
    <section
      className="mt-4 rounded-[var(--radius-xl)] border border-accent/25 bg-accent/[0.06] px-4 py-4"
      aria-labelledby="coaching-insights-heading"
    >
      <h2
        id="coaching-insights-heading"
        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent"
      >
        {loc === "fi" ? "Valmentajan näkymä" : "Coach view"}
      </h2>
      <p className="mt-1 text-[12px] leading-snug text-muted-2">
        {loc === "fi"
          ? "Ohjaus seuraa treeniä, ruokaa ja kuormaa — ei pakotettuja ohjelmanvaihtoja."
          : "Guidance follows training, food, and load — no forced program changes."}
      </p>
      {mainInsights.length > 0 ? (
        <div className="mt-4 flex flex-col gap-3">
          {mainInsights.map((insight) => (
            <CoachingInsightCard
              key={insight.id}
              insight={insight}
              locale={loc}
            />
          ))}
        </div>
      ) : null}
      {hasSupplements ? (
        <SupplementCoachRecommendations
          picks={result.supplementProducts}
          variant="embedded"
          omitSectionHeader
          className={
            mainInsights.length > 0 ? "mt-5 border-t border-white/[0.08] pt-5" : "mt-4"
          }
        />
      ) : null}
    </section>
  );
}
