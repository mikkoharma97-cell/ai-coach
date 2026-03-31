"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import type { MessageKey } from "@/lib/i18n";

const ROWS: { title: MessageKey; body: MessageKey }[] = [
  { title: "landing.audienceBeginnerTitle", body: "landing.audienceBeginnerBody" },
  { title: "landing.audienceSkilledTitle", body: "landing.audienceSkilledBody" },
  { title: "landing.audienceProTitle", body: "landing.audienceProBody" },
];

export function LandingAudienceSection() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-white/[0.06] bg-[#05060a] py-20 sm:py-28">
      <Container size="default" className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          {t("landing.audienceEyebrow")}
        </p>
        <h2 className="mt-4 text-balance text-[1.5rem] font-semibold leading-[1.12] tracking-[-0.035em] text-zinc-50 sm:text-[1.65rem]">
          {t("landing.audienceTitle")}
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-3 sm:gap-5">
          {ROWS.map((row) => (
            <article
              key={row.title}
              className="rounded-[var(--radius-xl)] border border-white/[0.07] bg-gradient-to-b from-[#101722]/90 to-[#0b0f16] px-5 py-6 shadow-[0_20px_48px_-24px_rgba(0,0,0,0.55)]"
            >
              <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-zinc-50">
                {t(row.title)}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">
                {t(row.body)}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
