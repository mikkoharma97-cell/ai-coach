"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import type { MessageKey } from "@/lib/i18n";

const BULLETS: MessageKey[] = [
  "landing.foundation1",
  "landing.foundation2",
  "landing.foundation3",
  "landing.foundation4",
];

export function LandingFoundationSection() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-white/[0.06] bg-[#080a10] py-20 sm:py-28">
      <Container size="narrow" className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          {t("landing.foundationEyebrow")}
        </p>
        <h2 className="mt-4 text-balance text-[1.5rem] font-semibold leading-[1.12] tracking-[-0.035em] text-zinc-50 sm:text-[1.65rem]">
          {t("landing.foundationTitle")}
        </h2>
        <ul className="mt-10 space-y-4">
          {BULLETS.map((key) => (
            <li
              key={key}
              className="flex gap-3 text-[15px] leading-relaxed text-zinc-300"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5a84ff]" aria-hidden />
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
