"use client";

import { CTAButton } from "@/components/CTAButton";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";

export function FinalCta() {
  const { t } = useTranslation();

  return (
    <section className="border-t border-white/[0.08] bg-[#05060a] py-20 sm:py-28">
      <Container size="narrow" className="text-center">
        <h2 className="text-[1.65rem] font-semibold leading-[1.12] tracking-[-0.03em] text-zinc-50 sm:text-[1.875rem]">
          {t("landing.finalTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400">
          {t("landing.finalBody")}
        </p>
        <div className="relative z-[2] mt-10 flex flex-col items-center gap-4 pointer-events-auto sm:flex-row sm:justify-center sm:gap-5">
          <CTAButton
            href="/start"
            className="!min-h-[52px] !min-w-[200px] !rounded-[15px] !px-10 !text-[16px] !shadow-[0_14px_44px_rgba(59,130,246,0.4)]"
          >
            {t("landing.finalCta")}
          </CTAButton>
          <CTAButton
            href="/app"
            variant="link"
            className="!min-h-0 !py-2 !text-[14px] !font-medium !text-zinc-500 hover:!text-zinc-200"
          >
            {t("landing.finalOpen")}
          </CTAButton>
        </div>
        <p className="mt-8 text-[13px] font-medium text-zinc-500">
          {t("landing.finalNote")}
        </p>
      </Container>
    </section>
  );
}
