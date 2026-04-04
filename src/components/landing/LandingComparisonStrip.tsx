"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { appendBuildQuery } from "@/lib/buildInfo";

/**
 * Kolme rinnakkaista: treenisovellus · henkilökohtainen valmennus · tämä tuote.
 * Ei hyökkäävä sävy — implikaatio riveillä.
 */
export function LandingComparisonStrip() {
  const { t } = useTranslation();

  const appKeys = [
    "landing.compareColApp1",
    "landing.compareColApp2",
    "landing.compareColApp3",
  ] as const;
  const ptKeys = [
    "landing.compareColPt1",
    "landing.compareColPt2",
    "landing.compareColPt3",
  ] as const;
  const thisKeys = [
    "landing.compareColThis1",
    "landing.compareColThis2",
    "landing.compareColThis3",
  ] as const;

  return (
    <div className="w-full max-w-[min(100%,44rem)]">
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
        {t("landing.compareEyebrowPrimary")}
      </p>
      <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {t("landing.compareEyebrow")}
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {t("landing.compareColAppTitle")}
          </p>
          <ul className="mt-3 space-y-2 text-[12.5px] font-medium leading-snug text-zinc-300">
            {appKeys.map((k) => (
              <li key={k} className="flex gap-2">
                <span className="text-zinc-600" aria-hidden>
                  ·
                </span>
                {t(k)}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {t("landing.compareColPtTitle")}
          </p>
          <ul className="mt-3 space-y-2 text-[12.5px] font-medium leading-snug text-zinc-300">
            {ptKeys.map((k) => (
              <li key={k} className="flex gap-2">
                <span className="text-zinc-600" aria-hidden>
                  ·
                </span>
                {t(k)}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-accent/30 bg-accent/[0.07] px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent/90">
            {t("landing.compareColThisTitle")}
          </p>
          <ul className="mt-3 space-y-2 text-[12.5px] font-semibold leading-snug text-zinc-100">
            {thisKeys.map((k) => (
              <li key={k} className="flex gap-2">
                <span className="text-accent/70" aria-hidden>
                  ·
                </span>
                {t(k)}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-5 max-w-md text-center text-[13px] font-semibold leading-snug text-zinc-300">
        {t("landing.compareClosingLine")}
      </p>
      <p className="mx-auto mt-3 max-w-lg whitespace-pre-line text-center text-[12px] font-medium leading-relaxed text-zinc-500">
        {t("landing.compareTrust")}
      </p>
      <div className="mt-6 flex justify-center">
        <Link
          href={appendBuildQuery("/compare")}
          className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] border border-white/12 bg-white/[0.06] px-6 text-[14px] font-semibold text-zinc-100 transition hover:border-accent/35 hover:bg-white/[0.09]"
        >
          {t("landing.compareCta")}
        </Link>
      </div>
      <p className="mx-auto mt-6 max-w-lg text-center text-[13px] font-semibold leading-snug tracking-[-0.02em] text-zinc-200">
        {t("landing.compareDropMic")}
      </p>
    </div>
  );
}
