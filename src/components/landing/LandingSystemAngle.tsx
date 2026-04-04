"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";

/** Sama linja + arki — ei hajoa kun elämä sotkee */
export function LandingSystemAngle() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-white/[0.06] bg-[#080a10] py-20 sm:py-28">
      <Container size="narrow" className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          {t("landing.angleEyebrow")}
        </p>
        <h2 className="mt-4 text-balance text-[1.5rem] font-semibold leading-[1.12] tracking-[-0.035em] text-zinc-50 sm:text-[1.65rem]">
          {t("landing.angleTitle")}
        </h2>
        <ul className="mt-10 space-y-6 border-l-2 border-[rgba(90,132,255,0.35)] pl-6">
          <li>
            <p className="text-[15px] font-semibold leading-snug text-zinc-100">
              {t("landing.angleLine1")}
            </p>
          </li>
          <li>
            <p className="text-[15px] font-semibold leading-snug text-zinc-100">
              {t("landing.angleLine2")}
            </p>
          </li>
          <li>
            <p className="text-[15px] leading-relaxed text-zinc-400">
              {t("landing.angleLine3")}
            </p>
          </li>
        </ul>
      </Container>
    </section>
  );
}
