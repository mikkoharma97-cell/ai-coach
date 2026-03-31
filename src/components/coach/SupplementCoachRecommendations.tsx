"use client";

import { getSupplementCatalogEntry } from "@/lib/supplements/productCatalog";
import type { SupplementProductRecommendation } from "@/types/adaptiveCoaching";
import type { MessageKey } from "@/lib/i18n";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  picks: SupplementProductRecommendation[];
  /** Kun annettu, näytetään osiona (esim. ruokasivulla) */
  variant?: "standalone" | "embedded";
  /** Piilota osion otsikko (kun yläpuolella on jo valmentajan näkymä) */
  omitSectionHeader?: boolean;
  className?: string;
};

const FRAME_KEY: Record<
  SupplementProductRecommendation["frame"],
  MessageKey
> = {
  recommended_for_you: "supplement.frame.recommendedForYou",
  coach_suggestion: "supplement.frame.coachSuggestion",
  based_on_progress: "supplement.frame.basedOnProgress",
};

export function SupplementCoachRecommendations({
  picks,
  variant = "standalone",
  omitSectionHeader = false,
  className = "",
}: Props) {
  const { t, locale } = useTranslation();
  const loc = locale === "en" ? "en" : "fi";

  if (picks.length === 0) return null;

  const wrap =
    variant === "standalone"
      ? "rounded-[var(--radius-xl)] border border-white/[0.1] bg-white/[0.03] px-4 py-4"
      : "";

  return (
    <section
      className={`${wrap} ${className}`.trim()}
      aria-labelledby={
        omitSectionHeader ? undefined : "supplement-coach-heading"
      }
    >
      {omitSectionHeader ? (
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent/85">
          {t("supplement.embeddedEyebrow")}
        </p>
      ) : (
        <>
          <h2
            id="supplement-coach-heading"
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-2"
          >
            {t("supplement.sectionTitle")}
          </h2>
          <p className="mt-1 text-[12px] leading-snug text-muted-2">
            {t("supplement.sectionSubtitle")}
          </p>
        </>
      )}
      <ul
        className={`flex flex-col gap-3 ${omitSectionHeader ? "" : "mt-4"}`}
      >
        {picks.map((pick) => {
          const product = getSupplementCatalogEntry(pick.productId);
          const name =
            product && loc === "en" ? product.nameEn : product?.nameFi;
          const brand = product?.brand ?? "PTV Labs";
          const title = name ?? pick.productId;
          const reason = loc === "en" ? pick.reasonEn : pick.reasonFi;
          const frameLabel = t(FRAME_KEY[pick.frame]);
          return (
            <li
              key={pick.id}
              className="rounded-[var(--radius-lg)] border border-accent/20 bg-accent/[0.05] px-3.5 py-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent/90">
                {frameLabel}
              </p>
              <p className="mt-1.5 text-[14px] font-semibold leading-snug text-foreground">
                {title}
                <span className="ml-1.5 text-[11px] font-medium text-muted-2">
                  · {brand}
                </span>
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {reason}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
