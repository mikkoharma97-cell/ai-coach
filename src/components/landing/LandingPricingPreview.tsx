"use client";

import { CTAButton } from "@/components/CTAButton";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";

export function LandingPricingPreview() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-white/[0.06] bg-[#0a0d14] py-20 sm:py-28">
      <Container size="narrow" className="max-w-xl">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          {t("landing.pricingEyebrow")}
        </p>
        <h2 className="mt-4 text-center text-[1.65rem] font-semibold leading-[1.12] tracking-[-0.03em] text-zinc-50 sm:text-[1.875rem]">
          {t("landing.pricingTitle")}
        </h2>
        <p className="mx-auto mt-5 max-w-md text-center text-[15px] leading-relaxed text-zinc-400">
          {t("landing.pricingBody")}
        </p>

        <div className="mx-auto mt-10 max-w-md rounded-[var(--radius-2xl)] border border-white/[0.08] bg-[#0e121c]/90 p-6 shadow-[0_24px_64px_-28px_rgba(0,0,0,0.55)] backdrop-blur-sm">
          <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7ea3ff]">
                {t("landing.pricingYearly")}
              </p>
              <p className="mt-2 text-[1.75rem] font-semibold tabular-nums tracking-tight text-zinc-50">
                {t("landing.pricingYearlyPrice")}
              </p>
            </div>
            <p className="text-right text-[13px] leading-snug text-zinc-500">
              {t("landing.pricingMonthlyHint")}
            </p>
          </div>
          <div className="pt-6">
            <CTAButton
              href="/start"
              className="w-full justify-center !min-h-[50px] !text-[15px] !shadow-[0_12px_36px_rgba(59,130,246,0.35)]"
            >
              {t("landing.pricingCta")}
            </CTAButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
