"use client";

import { useTranslation } from "@/hooks/useTranslation";
import type { MessageKey } from "@/lib/i18n";

const BULLETS = [
  "landing.lifeHappensB1",
  "landing.lifeHappensB2",
  "landing.lifeHappensB3",
  "landing.lifeHappensB4",
  "landing.lifeHappensB5",
  "landing.lifeHappensB6",
  "landing.shiftSell1",
  "landing.shiftSell2",
  "landing.shiftSell3",
] as const satisfies readonly MessageKey[];

export function LandingWhenLifeHappens() {
  const { t } = useTranslation();
  return (
    <section
      className="relative mx-auto max-w-3xl px-5 py-16 sm:py-20"
      aria-labelledby="landing-life-happens"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        aria-hidden
      />
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-2">
        {t("landing.lifeHappensEyebrow")}
      </p>
      <h2
        id="landing-life-happens"
        className="mt-3 text-balance text-[1.65rem] font-semibold leading-[1.15] tracking-[-0.04em] text-foreground sm:text-[1.85rem]"
      >
        {t("landing.lifeHappensTitle")}
      </h2>
      <p className="mt-5 max-w-xl text-[1.125rem] font-semibold leading-snug text-foreground/95">
        {t("landing.lifeHappensClaim")}
      </p>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
        {t("landing.lifeHappensBody")}
      </p>
      <ul className="mt-6 space-y-2.5 text-[14px] font-medium leading-snug text-foreground/95">
        {BULLETS.map((k) => (
          <li key={k} className="flex gap-2.5">
            <span className="mt-[0.35em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/80" aria-hidden />
            <span>{t(k)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-10 rounded-[var(--radius-2xl)] border border-white/[0.08] bg-gradient-to-br from-accent/[0.12] via-card/40 to-transparent px-6 py-8 shadow-[0_24px_80px_-40px_rgba(59,130,246,0.35)]">
        <p className="text-center text-[12px] font-medium leading-relaxed text-muted-2">
          {t("landing.lifeHappensVisualCaption")}
        </p>
      </div>
    </section>
  );
}
