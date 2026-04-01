"use client";

import { useTranslation } from "@/hooks/useTranslation";

/**
 * Marketing hero — yksi tumma fokuskortti (ei app-näkymän kopio).
 */
export function HeroFocusCard() {
  const { t } = useTranslation();

  return (
    <div
      className="relative w-full max-w-[min(100%,19.5rem)] select-none"
      aria-hidden
    >
      <div
        className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[radial-gradient(ellipse_90%_70%_at_50%_20%,rgba(59,130,246,0.22),transparent_65%)] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.35rem] bg-[radial-gradient(120%_80%_at_50%_0%,rgba(255,255,255,0.06),transparent_55%)]"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-[1.35rem] border border-white/[0.09] bg-[#07080d]/85 shadow-[0_32px_80px_-28px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-2xl">
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(59,130,246,0.07)_0%,transparent_42%,rgba(0,0,0,0.4)_100%)]"
          aria-hidden
        />
        <div className="relative px-7 pb-8 pt-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            {t("landing.heroCardTitle")}
          </p>
          <div className="mt-6 space-y-3.5">
            <p className="text-[15px] font-medium leading-snug tracking-[-0.02em] text-zinc-100">
              {t("landing.heroCardWorkout")}
            </p>
            <p className="text-[15px] font-medium leading-snug tracking-[-0.02em] text-zinc-100">
              {t("landing.heroCardFood")}
            </p>
            <p className="text-[15px] font-medium leading-snug tracking-[-0.02em] text-zinc-200/95">
              {t("landing.heroCardDirection")}
            </p>
          </div>
          <div className="mt-8 w-full rounded-[var(--radius-lg)] bg-gradient-to-b from-[rgb(59,130,246)] to-[rgb(41,92,255)] py-3.5 text-center text-[14px] font-semibold text-white shadow-[0_12px_40px_-12px_rgba(41,92,255,0.55)] ring-1 ring-white/10">
            {t("landing.heroCardCtaDecor")}
          </div>
        </div>
      </div>
    </div>
  );
}
