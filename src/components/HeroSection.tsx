"use client";

import { CTAButton } from "@/components/CTAButton";
import { HeroTodayLiving } from "@/components/landing/HeroTodayLiving";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { appendBuildQuery } from "@/lib/buildInfo";

const ctaRingOffset =
  "focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-x-clip overflow-y-visible border-b border-white/[0.06] bg-[var(--background)] pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="hero-dark-layer-base" aria-hidden />
      <div className="hero-dark-layer-directional" aria-hidden />
      <div className="hero-dark-layer-spotlight" aria-hidden />
      <Container size="default" className="relative z-[1]">
        <div className="grid items-center gap-12 pb-20 pt-12 sm:gap-16 sm:pb-28 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-12 lg:pb-32 lg:pt-24">
          <div className="mx-auto w-full max-w-[min(100%,26rem)] text-center lg:mx-0 lg:max-w-none lg:text-left">
            <p className="text-[14px] font-semibold leading-snug text-[color:var(--foreground)] sm:text-[15px]">
              {t("landing.heroWhyLine")}
            </p>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-eyebrow)]">
              {t("nav.brand")}
            </p>
            <h1 className="mt-4 text-balance text-[clamp(1.5rem,4vw+0.7rem,2.85rem)] font-semibold leading-[1.14] tracking-[-0.04em] text-[color:var(--foreground)] sm:mt-5 sm:leading-[1.08]">
              {t("landing.heroLine1")}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[17px] font-medium leading-relaxed text-[color:var(--text-body)] sm:text-[18px] lg:mx-0">
              {t("landing.heroLine2")}
            </p>
            <div className="relative z-[2] mt-10 flex flex-col items-center gap-4 pointer-events-auto sm:mt-11 sm:flex-row sm:items-center sm:gap-5 lg:justify-start">
              <CTAButton
                href={appendBuildQuery("/start")}
                className={`!min-h-[54px] !min-w-[200px] !rounded-[15px] !px-10 !py-4 !text-[16px] !font-semibold !shadow-[var(--shadow-primary-cta)] hover:!brightness-110 ${ctaRingOffset}`}
              >
                {t("landing.heroCta")}
              </CTAButton>
              <CTAButton
                href={appendBuildQuery("/app")}
                variant="link"
                className={`!min-h-0 !py-2 !text-[14px] !font-medium !text-muted !no-underline hover:!text-[color:var(--foreground)] ${ctaRingOffset}`}
              >
                {t("landing.heroOpenApp")}
              </CTAButton>
            </div>
          </div>
          <div className="relative z-[1] flex justify-center lg:justify-end">
            <HeroTodayLiving context="darkHero" />
          </div>
        </div>
      </Container>
    </section>
  );
}
