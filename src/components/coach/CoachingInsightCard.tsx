"use client";

import type { CoachingInsight, CoachingInsightKind } from "@/types/adaptiveCoaching";

type Props = {
  insight: CoachingInsight;
  locale: "fi" | "en";
};

const KIND_LABEL: Record<CoachingInsightKind, { fi: string; en: string }> = {
  progression: { fi: "Edistyminen", en: "Progression" },
  fatigue: { fi: "Kuorma", en: "Load" },
  nutrition: { fi: "Ravinto", en: "Nutrition" },
  supplement: { fi: "Lisäravinteet", en: "Supplements" },
  adjustment: { fi: "Säätö", en: "Adjustment" },
  swap: { fi: "Liike", en: "Exercise" },
  product: { fi: "Käytännön tuki", en: "Gear" },
};

export function CoachingInsightCard({ insight, locale }: Props) {
  const title = locale === "fi" ? insight.titleFi : insight.titleEn;
  const body = locale === "fi" ? insight.bodyFi : insight.bodyEn;
  const kindLabel =
    locale === "fi"
      ? KIND_LABEL[insight.kind].fi
      : KIND_LABEL[insight.kind].en;
  const border =
    insight.severity === "positive"
      ? "border-emerald-500/35 bg-emerald-500/[0.07]"
      : insight.severity === "warning"
        ? "border-amber-500/40 bg-amber-500/[0.08]"
        : "border-white/[0.12] bg-white/[0.04]";

  return (
    <article
      className={`rounded-[var(--radius-lg)] border px-4 py-3 ${border}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2">
        {kindLabel}
      </p>
      <h3 className="mt-1 text-[15px] font-semibold leading-snug text-foreground">
        {title}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{body}</p>
    </article>
  );
}
