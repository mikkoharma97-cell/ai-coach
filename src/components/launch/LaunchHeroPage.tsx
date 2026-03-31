"use client";

import { CTAButton } from "@/components/CTAButton";
import { useTranslation } from "@/hooks/useTranslation";
import { appendBuildQuery } from "@/lib/buildInfo";
import Link from "next/link";

/**
 * Launch — myyntipsykologia, lyhyet rivit (HÄRMÄ15).
 */
export function LaunchHeroPage() {
  const { t } = useTranslation();

  return (
    <main className="relative flex min-h-dvh flex-col bg-[#06070b] text-[color:var(--foreground)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,rgba(61,107,255,0.38),transparent_58%)]"
        aria-hidden
      />
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          href="/home"
          className="text-[13px] font-semibold tracking-tight text-muted transition hover:text-foreground"
        >
          {t("nav.brand")}
        </Link>
        <Link
          href="/demo"
          className="text-[12px] font-medium text-accent underline-offset-2 hover:underline"
        >
          {t("launch.linkDemo")}
        </Link>
      </div>

      <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-20">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          {t("launch.urgencyLine")}
        </p>
        <h1 className="mt-5 max-w-[18rem] text-balance text-center text-[clamp(1.65rem,5vw,2.35rem)] font-semibold leading-[1.15] tracking-[-0.04em] sm:max-w-md">
          {t("launch.painLine")}
        </h1>
        <p className="mt-4 text-center text-[1.125rem] font-semibold text-foreground sm:text-[1.2rem]">
          {t("launch.solutionLine")}
        </p>
        <p className="mt-6 max-w-[17rem] text-center text-[13px] font-medium leading-snug text-muted-2">
          {t("launch.trustLine")}
        </p>
        <ul className="mt-8 flex flex-col gap-2.5 text-center text-[15px] font-semibold tracking-[-0.02em] text-foreground/95">
          <li>{t("launch.bulletTrain")}</li>
          <li>{t("launch.bulletFood")}</li>
          <li>{t("launch.bulletRhythm")}</li>
        </ul>
        <div className="mt-10 flex w-full max-w-sm flex-col items-stretch gap-3">
          <CTAButton
            href={appendBuildQuery("/start")}
            className="!min-h-[54px] w-full !rounded-[15px] !py-4 !text-[16px] !font-semibold !shadow-[var(--shadow-primary-cta)]"
          >
            {t("launch.ctaStart")}
          </CTAButton>
          <Link
            href="/home"
            className="text-center text-[13px] font-medium text-muted-2 underline-offset-2 hover:text-muted hover:underline"
          >
            {t("launch.linkFullMarketing")}
          </Link>
        </div>
      </div>
    </main>
  );
}
