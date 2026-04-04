"use client";

import { CTAButton } from "@/components/CTAButton";
import { HeroFocusCard } from "@/components/landing/HeroFocusCard";
import { LandingComparisonStrip } from "@/components/landing/LandingComparisonStrip";
import { LandingFakeWeekSection } from "@/components/landing/LandingFakeWeekSection";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { appendBuildQuery } from "@/lib/buildInfo";

const ctaRingOffset =
  "focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <>
      <section className="relative overflow-x-clip overflow-y-visible border-b border-white/[0.06] bg-[var(--background)] pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="hero-dark-layer-base" aria-hidden />
        <div className="hero-dark-layer-directional" aria-hidden />
        <div className="hero-dark-layer-spotlight" aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[min(32rem,60vh)] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,107,255,0.12),transparent_70%)]"
          aria-hidden
        />
        <Container size="default" className="relative z-[1]">
          <div className="flex min-h-0 flex-col items-center gap-10 pb-12 pt-10 sm:gap-12 sm:pb-14 sm:pt-12">
            <div className="w-full max-w-[min(100%,26rem)] text-center">
              <p
                className="mb-5 inline-block rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-[12px] font-semibold tracking-[0.06em] text-zinc-300 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] transition duration-300 hover:border-accent/45 hover:shadow-[0_0_22px_rgba(59,130,246,0.28)]"
                role="presentation"
              >
                {t("landing.heroHookLine")}
              </p>
              <h1 className="text-balance text-[clamp(1.55rem,4.2vw+0.65rem,2.75rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-[color:var(--foreground)]">
                <span className="block">{t("landing.heroLine1")}</span>
                <span className="mt-3 block text-[0.92em] font-semibold leading-snug tracking-[-0.03em] text-zinc-100">
                  {t("landing.heroLine2")}
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-md text-[15px] font-medium leading-snug text-zinc-300 sm:text-[16px]">
                {t("landing.heroSubline")}
              </p>
              <p className="mx-auto mt-3 max-w-md text-[13px] font-medium leading-relaxed text-zinc-500">
                {t("landing.heroMicro")}
              </p>
              <div className="relative z-[2] mx-auto mt-8 flex w-full max-w-xs flex-col items-center gap-3 pointer-events-auto sm:mt-10">
                <CTAButton
                  href={appendBuildQuery("/start")}
                  className={`!min-h-[52px] w-full !max-w-[280px] !rounded-[15px] !px-8 !py-3.5 !text-[16px] !font-semibold !shadow-[var(--shadow-primary-cta)] hover:!brightness-110 ${ctaRingOffset}`}
                >
                  {t("landing.heroCta")}
                </CTAButton>
                <p className="mt-2 max-w-[min(100%,280px)] text-center text-[12px] font-medium leading-snug text-zinc-500">
                  {t("landing.heroCtaHint")}
                </p>
                <a
                  href="#vertailu"
                  className="text-[14px] font-semibold text-zinc-400 underline-offset-4 transition hover:text-zinc-200 hover:underline"
                >
                  {t("landing.heroCtaSecondary")}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="vertailu"
        className="border-b border-white/[0.06] bg-[var(--background)] py-12 sm:py-14"
        aria-labelledby="compare-heading"
      >
        <Container size="default" className="flex flex-col items-center">
          <h2 id="compare-heading" className="sr-only">
            {t("landing.compareSectionHeading")}
          </h2>
          <LandingComparisonStrip />
        </Container>
      </section>

      <LandingFakeWeekSection />

      <section className="border-b border-white/[0.06] bg-[var(--background)] pb-14 pt-4 sm:pb-16">
        <Container size="default" className="flex flex-col items-center">
          <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            {t("landing.previewSectionEyebrow")}
          </p>
          <HeroFocusCard />
        </Container>
      </section>
    </>
  );
}
