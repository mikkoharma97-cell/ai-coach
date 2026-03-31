"use client";

import { CTAButton } from "@/components/CTAButton";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";

/** Yksi iso CTA — ei sekundääristä linkkiä. */
export function LandingFreeTrialSection() {
  const { t } = useTranslation();

  return (
    <section className="border-y border-white/[0.08] bg-[#07080f] py-20 sm:py-24">
      <Container size="narrow" className="text-center">
        <h2 className="text-[1.65rem] font-semibold leading-[1.12] tracking-[-0.03em] text-zinc-50 sm:text-[1.95rem]">
          {t("landing.freeTrialTitle")}
        </h2>
        <div className="mt-12 flex justify-center">
          <CTAButton
            href="/start"
            className="!min-h-[56px] !w-full !max-w-sm !rounded-[16px] !px-10 !text-[17px] !font-semibold !shadow-[0_16px_48px_rgba(59,130,246,0.45)]"
          >
            {t("landing.freeTrialCta")}
          </CTAButton>
        </div>
      </Container>
    </section>
  );
}
