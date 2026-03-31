"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import type { MessageKey } from "@/lib/i18n";

const STEPS: { title: MessageKey; body: MessageKey }[] = [
  { title: "landing.flow1Title", body: "landing.flow1Body" },
  { title: "landing.flow2Title", body: "landing.flow2Body" },
  { title: "landing.flow3Title", body: "landing.flow3Body" },
  { title: "landing.flow4Title", body: "landing.flow4Body" },
  { title: "landing.flow5Title", body: "landing.flow5Body" },
  { title: "landing.flow6Title", body: "landing.flow6Body" },
];

export function LandingFeatureFlow() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-white/[0.06] bg-[#05060a] py-20 sm:py-28">
      <Container size="default" className="max-w-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          {t("landing.flowEyebrow")}
        </p>
        <h2 className="mt-4 text-balance text-[1.5rem] font-semibold leading-[1.12] tracking-[-0.035em] text-zinc-50 sm:text-[1.65rem]">
          {t("landing.flowTitle")}
        </h2>
        <ol className="mt-12 space-y-0">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="relative flex gap-5 pb-12 last:pb-0 sm:gap-6"
            >
              {i < STEPS.length - 1 ? (
                <div
                  className="absolute left-[15px] top-10 h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-[rgba(90,132,255,0.45)] to-transparent sm:left-[17px]"
                  aria-hidden
                />
              ) : null}
              <span
                className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(90,132,255,0.45)] bg-[#0f141e] text-[12px] font-bold tabular-nums text-[#7ea3ff] sm:h-9 sm:w-9 sm:text-[13px]"
                aria-hidden
              >
                {i + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[16px] font-semibold leading-snug tracking-[-0.02em] text-zinc-50">
                  {t(step.title)}
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">
                  {t(step.body)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
