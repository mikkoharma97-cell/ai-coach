"use client";

import { CTAButton } from "@/components/CTAButton";
import { useTranslation } from "@/hooks/useTranslation";
import { appendBuildQuery } from "@/lib/buildInfo";
import Link from "next/link";

/**
 * Launch — yksi lupaus, ei pitkää scrollia (HÄRMÄ14).
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
        <h1 className="max-w-[20rem] text-balance text-center text-[clamp(1.85rem,5.5vw,2.65rem)] font-semibold leading-[1.12] tracking-[-0.04em] sm:max-w-lg">
          {t("launch.headline")}
        </h1>
        <p className="mt-6 max-w-md text-center text-[15px] font-medium leading-relaxed text-[color:var(--text-body)]">
          {t("launch.promiseLine")}
        </p>
        <ul className="mt-10 flex flex-col gap-3 text-center text-[16px] font-semibold tracking-[-0.02em] text-foreground/95">
          <li>{t("launch.bulletTrain")}</li>
          <li>{t("launch.bulletFood")}</li>
          <li>{t("launch.bulletRhythm")}</li>
        </ul>
        <div className="mt-12 flex w-full max-w-sm flex-col items-stretch gap-3">
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
