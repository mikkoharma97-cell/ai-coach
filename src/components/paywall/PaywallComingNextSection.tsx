"use client";

import { useTranslation } from "@/hooks/useTranslation";

/**
 * Myyntiosio: tulevat ominaisuudet — eksplisiittisesti ei vielä tuotteessa.
 */
export function PaywallComingNextSection() {
  const { t } = useTranslation();
  const items = [
    t("paywall.comingNext.scan"),
    t("paywall.comingNext.deviceCoach"),
    t("paywall.comingNext.offers"),
    t("paywall.comingNext.voice"),
    t("paywall.comingNext.memory"),
  ];
  return (
    <section
      className="mx-auto mt-10 max-w-md rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03] px-5 py-6"
      aria-labelledby="paywall-coming-next"
    >
      <p
        id="paywall-coming-next"
        className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-2"
      >
        {t("paywall.comingNextEyebrow")}
      </p>
      <h2 className="mt-3 text-center text-[1.05rem] font-semibold tracking-tight text-foreground">
        {t("paywall.comingNextTitle")}
      </h2>
      <ul className="mt-5 space-y-3 text-[14px] leading-relaxed text-muted">
        {items.map((line) => (
          <li key={line} className="flex gap-3">
            <span
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70"
              aria-hidden
            />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
