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

/** Yksi kiinteä juuriluokka (`globals.css`); ei client/SSR -haaroja. */
const LANDING_HERO_ROOT_CLASS = "landing-hero-shell";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <>
      <section className={LANDING_HERO_ROOT_CLASS}>
        <Container size="default" className="relative z-[1]">
          <div className="flex min-h-0 flex-col items-center gap-10 pb-12 pt-10 sm:gap-12 sm:pb-14 sm:pt-12">
            <div className="w-full max-w-[min(100%,26rem)] text-center">
              <h1 className="text-balance text-[clamp(1.65rem,4.4vw+0.7rem,2.85rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-[color:var(--foreground)]">
                {t("landing.heroTitle")}
              </h1>
              <div className="relative z-[2] mx-auto mt-10 flex w-full max-w-xs flex-col items-center gap-4 pointer-events-auto sm:mt-12">
                <CTAButton
                  href={appendBuildQuery("/start")}
                  className={`!min-h-[56px] w-full !max-w-[280px] !rounded-[15px] !px-8 !py-4 !text-[17px] !font-semibold !shadow-[var(--shadow-primary-cta)] hover:!brightness-110 ${ctaRingOffset}`}
                >
                  {t("landing.heroCta")}
                </CTAButton>
                <a
                  href="#vertailu"
                  className="text-center text-[12px] font-normal leading-snug text-zinc-500/90 underline-offset-4 transition hover:text-zinc-300 hover:underline"
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
          <HeroFocusCard />
        </Container>
      </section>
    </>
  );
}
