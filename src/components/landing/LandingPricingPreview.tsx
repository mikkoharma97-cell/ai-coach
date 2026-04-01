"use client";

import { CTAButton } from "@/components/CTAButton";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { useMemo } from "react";

export function LandingPricingPreview() {
  const { t } = useTranslation();

  const { yearlyNum, yearlySavePct } = useMemo(() => {
    const monthlyNum = Number(t("paywall.price")) || 29;
    const y = Number(t("paywall.yearlyPrice")) || 249;
    const pct = Math.max(
      0,
      Math.round((1 - y / (monthlyNum * 12)) * 100),
    );
    return { yearlyNum: y, yearlySavePct: pct };
  }, [t]);

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

        <div className="mx-auto mt-10 max-w-md rounded-[var(--radius-2xl)] border border-white/[0.08] bg-[#0e121c]/90 p-6 shadow-[0_24px_64px_-28px_rgba(59,107,255,0.22)] backdrop-blur-sm">
          <div className="border-b border-white/[0.08] pb-5 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7ea3ff]">
              {t("paywall.monthlyTitle")}
            </p>
            <p className="mt-2 text-[1.85rem] font-semibold tabular-nums tracking-tight text-zinc-50">
              €{t("paywall.price")}
              <span className="text-[1.05rem] font-semibold text-zinc-500">
                {t("paywall.perMonth")}
              </span>
            </p>
            <p className="mt-3 text-[13px] leading-snug text-zinc-500">
              {t("paywall.yearlySecondaryLine", {
                yearly: yearlyNum,
                pct: yearlySavePct,
              })}
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
