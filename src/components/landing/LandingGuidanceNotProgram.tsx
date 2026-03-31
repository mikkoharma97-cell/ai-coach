"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";

export function LandingGuidanceNotProgram() {
  const { t } = useTranslation();

  return (
    <section
      className="border-b border-white/[0.06] bg-[#060810] py-16 sm:py-20"
      aria-labelledby="landing-guidance-not-program"
    >
      <Container size="narrow" className="max-w-xl">
        <h2
          id="landing-guidance-not-program"
          className="text-balance text-[1.45rem] font-semibold leading-[1.15] tracking-[-0.035em] text-zinc-50 sm:text-[1.55rem]"
        >
          {t("landing.guidanceNotProgramTitle")}
        </h2>
        <ul className="mt-8 space-y-4 text-[15px] font-semibold leading-snug text-zinc-200">
          <li>{t("landing.guidanceNotProgramLine1")}</li>
          <li>{t("landing.guidanceNotProgramLine2")}</li>
          <li className="text-zinc-400">{t("landing.guidanceNotProgramLine3")}</li>
        </ul>
      </Container>
    </section>
  );
}
