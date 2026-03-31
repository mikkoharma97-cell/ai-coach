"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { effectiveTrainingLevel } from "@/lib/profileTraining";
import type { OnboardingAnswers } from "@/types/coach";
import type { TrainingArticle } from "@/types/content";
import { useEffect, useState } from "react";

type Props = {
  profile: OnboardingAnswers;
};

export function TrainingIntelligenceBlock({ profile }: Props) {
  const { t, locale } = useTranslation();
  const [highlight, setHighlight] = useState<TrainingArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const u = new URL(
          "/api/training-intelligence/highlight",
          window.location.origin,
        );
        u.searchParams.set("goal", profile.goal);
        u.searchParams.set("level", effectiveTrainingLevel(profile));
        if (profile.selectedPackageId) {
          u.searchParams.set("package", profile.selectedPackageId);
        }
        const res = await fetch(u.toString());
        if (!res.ok) throw new Error("highlight fetch failed");
        const data = (await res.json()) as {
          highlight: TrainingArticle | null;
        };
        if (!cancelled) setHighlight(data.highlight);
      } catch {
        if (!cancelled) setHighlight(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [profile]);

  if (loading) {
    return (
      <section
        className="coach-panel-subtle mt-6 px-4 py-4"
        aria-busy="true"
        aria-label={t("intelligence.eyebrow")}
      >
        <p className="text-[12px] text-muted-2">{t("common.loading")}</p>
      </section>
    );
  }

  if (!highlight) return null;

  const signal = locale === "en" ? highlight.signalEn : highlight.signalFi;
  const why =
    locale === "en" ? highlight.whyItMattersEn : highlight.whyItMattersFi;
  const summary =
    locale === "en" ? highlight.summaryEn : highlight.summaryFi;

  return (
    <section
      className="coach-panel-subtle mt-6 px-4 py-4"
      aria-labelledby="training-intel-heading"
    >
      <p
        id="training-intel-heading"
        className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2"
      >
        {t("intelligence.eyebrow")}
      </p>
      <p className="mt-2 text-[14px] font-semibold leading-snug text-foreground">
        {signal}
      </p>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-2">
        {t("intelligence.sourceLabel")}
      </p>
      <p className="mt-1 text-[13px] leading-snug text-muted">{highlight.title}</p>
      <p className="mt-1 text-[11px] text-muted-2">{highlight.source}</p>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-2">
        {t("intelligence.summaryLabel")}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">{summary}</p>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-2">
        {t("intelligence.whyLabel")}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-foreground">{why}</p>
      <a
        href={highlight.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-[44px] items-center text-[14px] font-semibold text-accent underline-offset-2 hover:underline"
      >
        {t("intelligence.openSource")}
      </a>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-2">
        {t("intelligence.disclaimer")}
      </p>
    </section>
  );
}
