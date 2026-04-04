"use client";

import { HeroTodayLiving } from "@/components/landing/HeroTodayLiving";
import { SalesPitchIntro, SalesPitchOutro } from "@/components/demo/SalesPitchDemo";
import { CTAButton } from "@/components/CTAButton";
import { useTranslation } from "@/hooks/useTranslation";
import { appendBuildQuery } from "@/lib/buildInfo";
import Link from "next/link";

/**
 * Demo — staattinen esikatselu ilman täyttä app-kuorta (read-only fiilis).
 */
export function DemoPreviewPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-dvh bg-[#06070b] pb-16 pt-[max(0.75rem,env(safe-area-inset-top))] text-[color:var(--foreground)]">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_0%,rgba(61,107,255,0.28),transparent_50%)]"
        aria-hidden
      />

      <div className="relative z-[1] mx-auto max-w-lg px-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/launch"
            className="text-[12px] font-medium text-muted-2 hover:text-foreground"
          >
            ← {t("launch.back")}
          </Link>
          <Link
            href="/home"
            className="text-[12px] font-medium text-muted-2 hover:text-foreground"
          >
            {t("nav.brand")}
          </Link>
        </div>

        <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
          {t("demo.eyebrow")}
        </p>
        <h1 className="mt-2 text-balance text-[1.65rem] font-semibold leading-tight tracking-[-0.03em]">
          {t("demo.title")}
        </h1>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted">
          {t("demo.subtitle")}
        </p>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-2">
          {t("demo.salesEyebrow")}
        </p>

        <div className="mt-4">
          <SalesPitchIntro />
        </div>

        <section className="mt-10" aria-labelledby="demo-today">
          <h2 id="demo-today" className="sr-only">
            {t("demo.sectionToday")}
          </h2>
          <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
            {t("demo.sectionToday")}
          </p>
          <div className="pointer-events-none mx-auto flex max-w-[340px] justify-center select-none opacity-[0.98]">
            <HeroTodayLiving context="darkHero" />
          </div>
          <p className="mx-auto mt-3 max-w-sm text-center text-[11px] text-muted-2">
            {t("demo.readOnlyHint")}
          </p>
        </section>

        <section
          className="mt-12 rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.04] px-4 py-5"
          aria-labelledby="demo-workout"
        >
          <h2
            id="demo-workout"
            className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent"
          >
            {t("demo.workoutEyebrow")}
          </h2>
          <p className="mt-2 text-[17px] font-semibold leading-snug">
            {t("demo.workoutTitle")}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {t("demo.workoutBody")}
          </p>
        </section>

        <section
          className="mt-5 rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.04] px-4 py-5"
          aria-labelledby="demo-food"
        >
          <h2
            id="demo-food"
            className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent"
          >
            {t("demo.foodEyebrow")}
          </h2>
          <p className="mt-2 text-[17px] font-semibold leading-snug">
            {t("demo.foodTitle")}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {t("demo.foodBody")}
          </p>
        </section>

        <section
          className="mt-5 rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.04] px-4 py-5"
          aria-labelledby="demo-progress"
        >
          <h2
            id="demo-progress"
            className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent"
          >
            {t("demo.progressEyebrow")}
          </h2>
          <p className="mt-2 text-[17px] font-semibold leading-snug">
            {t("demo.progressTitle")}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {t("demo.progressBody")}
          </p>
        </section>

        <div className="mt-10">
          <SalesPitchOutro />
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <CTAButton
            href={appendBuildQuery("/start")}
            className="!min-h-[52px] w-full !rounded-[14px] !text-[15px] !font-semibold"
          >
            {t("launch.ctaStart")}
          </CTAButton>
          <CTAButton
            href={appendBuildQuery("/start")}
            variant="link"
            className="!min-h-[44px] !text-[14px] !font-semibold !text-accent"
          >
            {t("demo.ctaInteractive")}
          </CTAButton>
        </div>
      </div>
    </main>
  );
}
