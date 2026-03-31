"use client";

import { FEATURED_PRODUCT_PLACEMENTS } from "@/lib/marketplace/featuredProducts";
import { useTranslation } from "@/hooks/useTranslation";

export function FeaturedProductsStrip() {
  const { locale, t } = useTranslation();
  const loc = locale === "en" ? "en" : "fi";

  return (
    <section
      className="mt-5 rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03] px-4 py-4"
      aria-labelledby="feat-products-h"
    >
      <h2
        id="feat-products-h"
        className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2"
      >
        {t("marketplace.featuredTitle")}
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {FEATURED_PRODUCT_PLACEMENTS.map((p) => (
          <li key={p.id}>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col rounded-[var(--radius-lg)] border border-border/60 bg-card/40 px-3.5 py-3 transition hover:border-accent/35 hover:bg-card/60"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent/90">
                {p.brand}
              </span>
              <span className="mt-1 text-[15px] font-semibold text-foreground">
                {loc === "en" ? p.titleEn : p.titleFi}
              </span>
              <span className="mt-1 text-[12px] leading-snug text-muted-2">
                {loc === "en" ? p.teaserEn : p.teaserFi}
              </span>
              <span className="mt-2 text-[11px] font-semibold text-accent">
                {t("marketplace.openPartner")}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
