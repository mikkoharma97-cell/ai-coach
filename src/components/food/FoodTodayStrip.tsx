"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  todaySummary: string;
  consumedKcal: number;
  targetKcal: number;
  rebalanceLine: string | null;
  shoppingTeaser: string | null;
  showRebalanceUi: boolean;
};

/**
 * Yksi tiivis rivi + linkit — ei tasakokoisten swipe-paneelien kilpailua.
 */
export function FoodTodayStrip({
  todaySummary,
  consumedKcal,
  targetKcal,
  rebalanceLine,
  shoppingTeaser,
  showRebalanceUi,
}: Props) {
  const { t } = useTranslation();

  const shopLead =
    shoppingTeaser?.trim() ||
    t("food.coachPresence.keepRhythm");

  return (
    <section
      className="mt-4 rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03] px-4 py-4"
      aria-label={t("food.stripAria")}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
        {consumedKcal} / {targetKcal} kcal
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{todaySummary}</p>
      {rebalanceLine ? (
        <p className="mt-3 border-t border-border/40 pt-3 text-[12px] leading-snug text-muted">
          {rebalanceLine}
        </p>
      ) : null}
      {showRebalanceUi ? (
        <Link
          href="/progress"
          className="mt-2 inline-flex text-[12px] font-semibold text-accent underline-offset-2 hover:underline"
        >
          {t("food.linkSeeProgress")}
        </Link>
      ) : null}
      <div className="mt-4 border-t border-border/40 pt-3">
        <p className="text-[12px] leading-snug text-muted">{shopLead}</p>
        <a
          href="/food#food-shopping"
          className="mt-2 inline-flex min-h-[44px] items-center text-[13px] font-semibold text-accent underline-offset-2 hover:underline"
        >
          {t("food.shoppingTitle")}
        </a>
      </div>
    </section>
  );
}
