"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";

const KEYS = [
  "landing.salesPillar1",
  "landing.salesPillar2",
  "landing.salesPillar3",
  "landing.salesPillar4",
  "landing.salesPillar5",
  "landing.salesPillar6",
] as const;

/** Myyntikärjet — sama rakenne, koko päivä, ei arvailua. */
export function LandingSalesPillars() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-white/[0.06] bg-[#05060a] py-16 sm:py-20">
      <Container size="default">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
          {t("landing.salesEyebrow")}
        </p>
        <ul className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-2 sm:gap-5">
          {KEYS.map((k) => (
            <li
              key={k}
              className="rounded-[var(--radius-xl)] border border-white/[0.07] bg-gradient-to-br from-[#121a28]/90 to-[#0a0e14] px-5 py-4 text-[15px] font-medium leading-snug text-zinc-200 shadow-[0_16px_48px_-28px_rgb(0_0_0/0.65)]"
            >
              <span className="mr-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[rgba(90,132,255,0.85)] align-middle" />
              {t(k)}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
