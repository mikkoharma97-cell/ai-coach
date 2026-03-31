"use client";

import { buildStoreBaskets } from "@/lib/food/storeSuggestions";
import { getProductCatalog } from "@/lib/food/productCatalog";
import type { WeeklyShoppingEngineResult } from "@/lib/food/shoppingList";
import type { Locale } from "@/lib/i18n";
import type { TranslateFn } from "@/lib/i18n";
import type { StoreBasket } from "@/types/grocery";
import { useMemo, useState } from "react";

type Props = {
  weekly: WeeklyShoppingEngineResult;
  shopDays: 3 | 7;
  onShopDaysChange: (d: 3 | 7) => void;
  locale: Locale;
  t: TranslateFn;
};

export function FoodShoppingListBlock({
  weekly,
  shopDays,
  onShopDaysChange,
  locale,
  t,
}: Props) {
  const [showStores, setShowStores] = useState(false);

  const { baskets, labels } = useMemo(() => {
    return buildStoreBaskets({
      shoppingList: weekly.items,
      productCatalog: getProductCatalog(),
    });
  }, [weekly.items]);

  const title = locale === "en" ? weekly.titleEn : weekly.titleFi;
  const lead = locale === "en" ? weekly.leadEn : weekly.leadFi;

  return (
    <section
      className="mt-9 border-t border-border/40 pt-8"
      aria-labelledby="weekly-shopping"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="weekly-shopping"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-2"
          >
            {title}
          </h2>
          <p className="mt-2 max-w-[22rem] text-[12px] leading-snug text-muted">
            {lead}
          </p>
        </div>
        <div
          className="flex rounded-full border border-border/60 bg-surface-subtle/50 p-0.5"
          role="group"
          aria-label={t("food.shoppingDaySpanAria")}
        >
          <button
            type="button"
            onClick={() => onShopDaysChange(3)}
            className={`min-h-[40px] rounded-full px-3.5 text-[12px] font-semibold transition ${
              shopDays === 3
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t("food.shopping3Days")}
          </button>
          <button
            type="button"
            onClick={() => onShopDaysChange(7)}
            className={`min-h-[40px] rounded-full px-3.5 text-[12px] font-semibold transition ${
              shopDays === 7
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t("food.shopping7Days")}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {weekly.groups.map((g) => (
          <div key={g.key}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-2">
              {locale === "en" ? g.labelEn : g.labelFi}
            </p>
            <ul className="mt-2 space-y-3">
              {g.items.map((it) => (
                <li
                  key={it.ingredientKey}
                  className="rounded-[var(--radius-lg)] border border-border/45 bg-surface-subtle/40 px-3.5 py-3"
                >
                  <p className="text-[14px] font-semibold text-foreground">
                    {locale === "en" ? it.labelEn : it.labelFi}
                    <span className="ml-2 tabular-nums text-[13px] font-medium text-muted">
                      · {formatAmount(it.amount, it.unit, locale)}
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-muted-2">
                    {t("food.shoppingDaysUsed")}{" "}
                    {it.daysUsed.join(", ")}
                  </p>
                  {it.productSuggestions.length > 0 ? (
                    <p className="mt-2 text-[11px] leading-snug text-muted">
                      <span className="font-medium text-foreground/90">
                        {t("food.shoppingSuggestions")}
                      </span>{" "}
                      {it.productSuggestions
                        .map((p) =>
                          locale === "en" ? p.nameEn : p.nameFi,
                        )
                        .join(" · ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-muted-2">
        {t("food.shoppingPriceDisclaimer")}
      </p>

      <button
        type="button"
        onClick={() => setShowStores((s) => !s)}
        className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-accent/40 bg-accent-soft/30 px-4 text-[14px] font-semibold text-accent transition hover:bg-accent-soft/50"
      >
        {showStores
          ? t("food.shoppingHideStores")
          : t("food.shoppingShowStores")}
      </button>

      {showStores ? (
        <StoreBasketGrid baskets={baskets} labels={labels} locale={locale} t={t} />
      ) : null}
    </section>
  );
}

function formatAmount(
  amount: number,
  unit: string,
  locale: Locale,
): string {
  if (unit === "g") return `${amount} g`;
  if (unit === "ml") return `${amount} ml`;
  if (unit === "piece")
    return locale === "en" ? `${amount} pcs` : `${amount} kpl`;
  return `${amount} ${unit}`;
}

function StoreBasketGrid({
  baskets,
  labels,
  locale,
  t,
}: {
  baskets: StoreBasket[];
  labels: { kind: string; labelFi: string; labelEn: string }[];
  locale: Locale;
  t: TranslateFn;
}) {
  return (
    <div className="mt-5 space-y-4">
      <p className="text-[12px] font-semibold text-foreground">
        {t("food.shoppingPickBasket")}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {baskets.map((b, i) => {
          const lbl = labels[i];
          const name =
            b.storeId === "store_a"
              ? t("food.storeOptionA")
              : b.storeId === "store_b"
                ? t("food.storeOptionB")
                : t("food.storeOptionC");
          const tag = lbl
            ? locale === "en"
              ? lbl.labelEn
              : lbl.labelFi
            : "";
          return (
            <div
              key={b.storeId}
              className="rounded-[var(--radius-xl)] border border-border/55 bg-card/50 px-4 py-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {name}
              </p>
              {tag ? (
                <p className="mt-1 text-[11px] text-accent">{tag}</p>
              ) : null}
              <p className="mt-3 text-[1.35rem] font-semibold tabular-nums text-foreground">
                €{b.estimatedTotal.toFixed(2)}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-muted-2">
                {t("food.shoppingEstimatedTotal")}
              </p>
              <ul className="mt-3 max-h-[140px] space-y-1 overflow-y-auto text-[11px] text-muted">
                {b.items.slice(0, 4).map((line) => (
                  <li key={line.ingredientKey + line.productId}>
                    {line.productName}{" "}
                    <span className="text-muted-2">
                      · €{line.estimatedPrice.toFixed(2)}
                    </span>
                  </li>
                ))}
                {b.items.length > 4 ? (
                  <li className="text-muted-2">
                    +{b.items.length - 4}{" "}
                    {t("food.shoppingMoreLines")}
                  </li>
                ) : null}
              </ul>
              <button
                type="button"
                className="mt-4 w-full rounded-[var(--radius-lg)] border border-border/70 bg-background py-2.5 text-[12px] font-semibold text-foreground"
              >
                {t("food.shoppingSelectBasket")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
