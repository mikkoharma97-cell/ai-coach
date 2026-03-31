"use client";

import { useTranslation } from "@/hooks/useTranslation";
import type { MessageKey } from "@/lib/i18n";

const BULLETS = [
  "landing.youSeeB1",
  "landing.youSeeB2",
  "landing.youSeeB3",
  "landing.youSeeB4",
  "landing.youSeeB5",
] as const satisfies readonly MessageKey[];

export function LandingYouSeeIt() {
  const { t } = useTranslation();
  return (
    <section
      className="relative mx-auto max-w-3xl px-5 py-12 sm:py-16"
      aria-labelledby="landing-you-see"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-2">
        {t("landing.youSeeEyebrow")}
      </p>
      <h2
        id="landing-you-see"
        className="mt-3 text-balance text-[1.65rem] font-semibold leading-[1.15] tracking-[-0.04em] text-foreground sm:text-[1.85rem]"
      >
        {t("landing.youSeeTitle")}
      </h2>
      <p className="mt-5 max-w-xl text-[1.125rem] font-semibold leading-snug text-foreground/95">
        {t("landing.youSeeClaim")}
      </p>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
        {t("landing.youSeeBody")}
      </p>
      <ul className="mt-6 space-y-2.5 text-[14px] font-medium leading-snug text-foreground/95">
        {BULLETS.map((k) => (
          <li key={k} className="flex gap-2.5">
            <span className="mt-[0.35em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/80" aria-hidden />
            <span>{t(k)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-10 overflow-hidden rounded-[var(--radius-2xl)] border border-accent/25 bg-[radial-gradient(120%_100%_at_50%_0%,rgb(59_130_246/0.2),transparent_55%)] px-6 py-10">
        <p className="text-center text-[13px] font-medium tracking-[0.08em] text-foreground/90">
          {t("landing.youSeeVisualCaption")}
        </p>
      </div>
    </section>
  );
}
