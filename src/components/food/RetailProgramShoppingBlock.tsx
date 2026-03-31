"use client";

import { getRetailComparisonForWeeklyItems } from "@/lib/groceryStoreResolver";
import type { WeeklyShoppingEngineResult } from "@/lib/food/shoppingList";
import type { Locale } from "@/lib/i18n";
import type { TranslateFn } from "@/lib/i18n";
import type { GroceryStoreId } from "@/types/grocery";
import { useMemo } from "react";

function storeLabel(store: GroceryStoreId, t: TranslateFn): string {
  if (store === "s_kaupat") return t("grocery.retailStore.sKaupat");
  if (store === "prisma") return t("grocery.retailStore.prisma");
  return t("grocery.retailStore.kRuoka");
}

type Props = {
  weekly: WeeklyShoppingEngineResult;
  locale: Locale;
  t: TranslateFn;
};

export function RetailProgramShoppingBlock({ weekly, locale, t }: Props) {
  const cmp = useMemo(
    () => getRetailComparisonForWeeklyItems(weekly.items),
    [weekly.items],
  );

  const displayLines = useMemo(() => {
    const sorted = [...cmp.baskets].sort((a, b) => a.totalEur - b.totalEur);
    const primary = sorted[0];
    return primary?.lines.slice(0, 12) ?? [];
  }, [cmp.baskets]);

  if (weekly.items.length === 0) return null;

  return (
    <section
      className="mt-8 rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03] px-4 py-5 sm:px-5"
      aria-labelledby="retail-week-heading"
    >
      <p
        id="retail-week-heading"
        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent"
      >
        {t("grocery.retailWeekEyebrow")}
      </p>
      <h2 className="mt-2 text-[1.05rem] font-semibold tracking-[-0.02em] text-foreground">
        {t("grocery.retailWeekTitle")}
      </h2>
      <p className="mt-2 text-[12px] leading-relaxed text-muted">
        {t("grocery.retailWeekLead")}
      </p>
      <p className="mt-3 rounded-[var(--radius-md)] border border-amber-500/25 bg-amber-500/[0.06] px-3 py-2 text-[11px] leading-snug text-muted">
        {t("grocery.retailDataDisclaimer")}
      </p>

      <div className="mt-5 space-y-3">
        {displayLines.map((ln) => (
          <div
            key={`${ln.product.id}-${ln.foodKey}-${ln.packs}`}
            className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/35 pb-3 last:border-0"
          >
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-foreground">
                {ln.product.name}
                {ln.product.sizeText ? (
                  <span className="ml-1.5 text-[12px] font-medium text-muted-2">
                    · {ln.product.sizeText}
                  </span>
                ) : null}
              </p>
              <p className="text-[11px] text-muted-2">
                {storeLabel(ln.product.store, t)} · ×{ln.packs}{" "}
                {locale === "fi" ? "paketti" : "pack"}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {ln.product.offerText ? (
                <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                  {ln.product.offerText}
                </span>
              ) : null}
              <span className="text-[15px] font-semibold tabular-nums text-foreground">
                {ln.lineTotalEur.toFixed(2)} €
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
        {t("grocery.retailOffersHeading")}
      </p>
      <ul className="mt-2 space-y-1.5 text-[12px] text-muted">
        {cmp.baskets.flatMap((b) =>
          b.offerLines.slice(0, 2).map((o) => (
            <li key={`${b.store}-${o.product.id}`}>
              <span className="font-medium text-foreground/90">
                {storeLabel(b.store, t)}:
              </span>{" "}
              {o.product.name}
              {o.product.offerText ? ` — ${o.product.offerText}` : ""}
            </li>
          )),
        ).slice(0, 6)}
      </ul>

      <div className="mt-5 flex flex-col gap-2 rounded-[var(--radius-lg)] border border-border/50 bg-surface-subtle/40 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-[13px] font-medium text-foreground">
          {t("grocery.retailCheapestLabel")}{" "}
          <span className="font-semibold text-accent">
            {cmp.cheapestStore
              ? storeLabel(cmp.cheapestStore, t)
              : "—"}
          </span>
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] tabular-nums text-muted">
          {cmp.baskets.map((b) => (
            <span key={b.store}>
              {storeLabel(b.store, t)}:{" "}
              <span className="font-semibold text-foreground">
                {b.totalEur.toFixed(2)} €
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
