"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";

export function CoachingPainSection() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-white/[0.06] bg-[#0a0d14] py-16 sm:py-24">
      <Container size="narrow" className="max-w-xl">
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-white/[0.08] bg-[linear-gradient(165deg,rgba(41,92,255,0.08)_0%,rgba(8,10,16,0.98)_45%)] px-6 py-8 shadow-[0_20px_56px_-20px_rgba(0,0,0,0.5)] sm:px-8 sm:py-10">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[rgba(41,92,255,0.12)] blur-3xl"
            aria-hidden
          />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5a84ff]">
            {t("landing.coachingEyebrow")}
          </p>
          <h2 className="relative mt-3 text-[1.4rem] font-semibold leading-[1.12] tracking-[-0.035em] text-zinc-50 sm:text-[1.55rem]">
            {t("landing.coachingTitle")}
          </h2>
          <p className="relative mt-5 text-[15px] leading-relaxed text-zinc-400">
            {t("landing.coachingBody")}
          </p>
          <p className="relative mt-4 border-t border-white/[0.08] pt-5 text-[14px] font-semibold leading-snug text-zinc-300">
            {t("landing.coachingShort")}
          </p>
        </div>
      </Container>
    </section>
  );
}
