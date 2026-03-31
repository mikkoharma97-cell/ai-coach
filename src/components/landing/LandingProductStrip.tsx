"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";

/** Yksi pääelementti: miten Tänään → Ruoka → korjaus näkyvät yhdessä. */
export function LandingProductStrip() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-white/[0.06] bg-[#05060a] py-20 sm:py-28">
      <Container size="default" className="max-w-3xl">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          {t("landing.productStripEyebrow")}
        </p>
        <h2 className="mx-auto mt-4 max-w-[28ch] text-balance text-center text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.035em] text-zinc-50 sm:text-[1.65rem]">
          {t("landing.productStripTitle")}
        </h2>

        <div
          className="relative mx-auto mt-12 max-w-[400px]"
          aria-label={t("landing.productStripTitle")}
        >
          <div
            className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-[radial-gradient(90%_80%_at_50%_0%,rgba(41,92,255,0.22),transparent_65%)] blur-xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.1] bg-[#0a0d14] shadow-[0_24px_64px_-12px_rgba(0,0,0,0.65),0_0_0_1px_rgba(90,132,255,0.12)]">
            <div className="border-b border-white/[0.06] bg-gradient-to-br from-[#121a2a] via-[#0e121c] to-[#0a0d14] px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#5a84ff]">
                {t("landing.productStripPanelTodayTag")}
              </p>
              <p className="mt-2 text-[16px] font-semibold leading-snug tracking-[-0.02em] text-zinc-50">
                {t("landing.productStripPanelTodayLine")}
              </p>
            </div>
            <div className="border-b border-white/[0.06] px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                {t("landing.productStripPanelFoodTag")}
              </p>
              <p className="mt-2 text-[14px] font-medium leading-snug text-zinc-300">
                {t("landing.productStripPanelFoodLine")}
              </p>
            </div>
            <div className="bg-[linear-gradient(135deg,rgba(41,92,255,0.18)_0%,rgba(15,21,34,0.95)_55%)] px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5a84ff]">
                {t("landing.productStripPanelFixTag")}
              </p>
              <p className="mt-2 text-[14px] font-semibold leading-snug text-zinc-100">
                {t("landing.productStripPanelFixLine")}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
