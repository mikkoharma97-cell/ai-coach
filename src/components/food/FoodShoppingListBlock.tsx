"use client";

import { buildStoreBaskets } from "@/lib/food/storeSuggestions";
import { getProductCatalog } from "@/lib/food/productCatalog";
import { weeklySpendFromStoreBaskets } from "@/lib/food/weeklySpendDisplay";
import type { WeeklyShoppingEngineResult } from "@/lib/food/shoppingList";
import type { Locale } from "@/lib/i18n";
import type { TranslateFn } from "@/lib/i18n";
import { useMemo } from "react";

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
  const { baskets } = useMemo(() => {
    return buildStoreBaskets({
      shoppingList: weekly.items,
      productCatalog: getProductCatalog(),
    });
  }, [weekly.items]);

  const spend = useMemo(
    () => weeklySpendFromStoreBaskets(baskets),
    [baskets],
  );

  return (
    <section
      className="mt-9 border-t border-border/40 pt-8"
      aria-labelledby="weekly-shopping"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2
            id="weekly-shopping"
            className="text-[1.05rem] font-semibold leading-tight tracking-[-0.02em] text-foreground"
          >
            {t("food.shoppingTitle")}
          </h2>
          <p className="mt-2 text-[13px] font-semibold leading-snug text-foreground">
            {t("food.shoppingWeekRange", {
              low: String(spend.lowEur),
              high: String(spend.highEur),
            })}
          </p>
          <p className="mt-1.5 text-[12px] leading-snug text-muted">
            {t("food.shoppingCovers", { days: String(shopDays) })}
          </p>
          <p className="mt-2 text-[12px] font-medium text-accent/95">
            {t("food.shoppingSaveLine", { save: String(spend.saveEur) })}
          </p>
        </div>
        <div
          className="flex shrink-0 rounded-full border border-border/60 bg-surface-subtle/50 p-0.5"
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
