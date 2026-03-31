"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";

const KEYS = [
  "product.profileConcreteLine",
  "landing.salesLine1",
  "landing.salesLine2",
  "landing.salesLine3",
] as const;

export function LandingSalesStrip() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-white/[0.06] bg-[#0a0d14] py-16 sm:py-24">
      <Container size="narrow" className="max-w-2xl">
        <div className="space-y-8">
          {KEYS.map((key) => (
            <blockquote
              key={key}
              className="border-l-[3px] border-[rgba(90,132,255,0.55)] pl-6"
            >
              <p className="text-[17px] font-medium leading-snug tracking-[-0.02em] text-zinc-100 sm:text-[18px]">
                {t(key)}
              </p>
            </blockquote>
          ))}
        </div>
      </Container>
    </section>
  );
}
