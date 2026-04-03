"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { appendBuildQuery } from "@/lib/buildInfo";

export function LandingComparisonStrip() {
  const { t } = useTranslation();
  const human = [
    "landing.compareHuman1",
    "landing.compareHuman2",
    "landing.compareHuman3",
    "landing.compareHuman4",
    "landing.compareHuman5",
  ] as const;
  const app = [
    "landing.compareApp1",
    "landing.compareApp2",
    "landing.compareApp3",
    "landing.compareApp4",
    "landing.compareApp5",
  ] as const;

  return (
    <div className="w-full max-w-[min(100%,40rem)]">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {t("landing.compareEyebrow")}
      </p>
      <p className="mx-auto mt-4 max-w-md text-center text-[13px] font-semibold leading-snug text-zinc-300">
        {t("landing.comparePlanLine")}
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            {t("landing.compareHumanTitle")}
          </p>
          <ul className="mt-3 space-y-2 text-[13px] font-medium leading-snug text-zinc-300">
            {human.map((k) => (
              <li key={k} className="flex gap-2">
                <span className="text-zinc-600" aria-hidden>
                  ·
                </span>
                {t(k)}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-accent/25 bg-accent/[0.06] px-4 py-4 sm:px-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent/90">
            {t("landing.compareAppTitle")}
          </p>
          <ul className="mt-3 space-y-2 text-[13px] font-semibold leading-snug text-zinc-100">
            {app.map((k) => (
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
      <p className="mx-auto mt-5 max-w-lg text-center text-[13px] font-medium leading-relaxed text-zinc-400">
        {t("landing.compareDisclaimer")}
      </p>
      <p className="mx-auto mt-3 max-w-lg text-center text-[12px] leading-relaxed text-zinc-500">
        {t("landing.compareCredibility")}
      </p>
      <div className="mt-6 flex justify-center">
        <Link
          href={appendBuildQuery("/compare")}
          className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] border border-white/12 bg-white/[0.06] px-6 text-[14px] font-semibold text-zinc-100 transition hover:border-accent/35 hover:bg-white/[0.09]"
        >
          {t("landing.compareCta")}
        </Link>
      </div>
    </div>
  );
}
