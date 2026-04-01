"use client";

import { CTAButton } from "@/components/CTAButton";
import { HeroFocusCard } from "@/components/landing/HeroFocusCard";
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
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(32rem,60vh)] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,107,255,0.12),transparent_70%)]"
        aria-hidden
      />
      <Container size="default" className="relative z-[1]">
        <div className="flex flex-col items-center gap-16 pb-24 pt-16 sm:gap-20 sm:pb-28 sm:pt-20 lg:flex-row lg:items-center lg:justify-between lg:gap-24 lg:pb-36 lg:pt-28">
          <div className="w-full max-w-[min(100%,26rem)] text-center lg:max-w-[min(100%,28rem)] lg:text-left">
            <h1 className="text-balance text-[clamp(1.55rem,4.2vw+0.65rem,2.75rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-[color:var(--foreground)]">
              <span className="block">{t("landing.heroLine1")}</span>
              <span className="mt-4 block text-[0.92em] font-medium leading-snug tracking-[-0.03em] text-zinc-200">
                {t("landing.heroLine2")}
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-md text-[15px] font-medium leading-relaxed text-zinc-400 sm:text-[16px] lg:mx-0">
              {t("landing.heroMicro")}
            </p>
            <p className="mx-auto mt-8 max-w-md text-[13px] leading-relaxed text-zinc-500 sm:text-[14px] lg:mx-0">
              {t("landing.heroCredibility")}
            </p>
            <div className="relative z-[2] mt-12 flex flex-col items-center gap-4 pointer-events-auto sm:mt-14 sm:flex-row sm:items-center sm:gap-6 lg:justify-start">
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
          <div className="flex w-full flex-1 justify-center lg:justify-end">
            <HeroFocusCard />
          </div>
        </div>
      </Container>
    </section>
  );
}
