"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";

const keys = [
  { title: "landing.benefit1Title" as const, body: "landing.benefit1Body" as const },
  { title: "landing.benefit2Title" as const, body: "landing.benefit2Body" as const },
  { title: "landing.benefit3Title" as const, body: "landing.benefit3Body" as const },
] as const;

export function LandingBenefitCards() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-white/[0.06] bg-[#05060a] py-20 sm:py-28">
      <Container size="default">
        <div className="grid gap-6 sm:grid-cols-3 sm:gap-5 lg:gap-8">
          {keys.map((k) => (
            <article
              key={k.title}
              className="group relative overflow-hidden rounded-[var(--radius-2xl)] border border-white/[0.08] bg-gradient-to-b from-[#101722] to-[#0b0f16] p-8 shadow-[0_24px_64px_-28px_rgb(0_0_0/0.55)] transition-shadow duration-300 hover:border-[rgba(90,132,255,0.35)] hover:shadow-[0_28px_72px_-24px_rgba(41,92,255,0.18)]"
            >
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[rgba(41,92,255,0.14)] blur-2xl"
                aria-hidden
              />
              <h3 className="relative text-[1.2rem] font-semibold leading-snug tracking-[-0.03em] text-zinc-50">
                {t(k.title)}
              </h3>
              <p className="relative mt-4 text-[15px] leading-relaxed text-zinc-400">
                {t(k.body)}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
