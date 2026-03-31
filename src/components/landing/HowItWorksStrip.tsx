"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";

const steps = [
  { n: "1", titleKey: "landing.hiwStep1Title" as const, descKey: "landing.hiwStep1Desc" as const },
  { n: "2", titleKey: "landing.hiwStep2Title" as const, descKey: "landing.hiwStep2Desc" as const },
  { n: "3", titleKey: "landing.hiwStep3Title" as const, descKey: "landing.hiwStep3Desc" as const },
] as const;

export function HowItWorksStrip() {
  const { t } = useTranslation();

  return (
    <section className="border-b border-border/60 bg-background py-16 sm:py-20">
      <Container size="default">
        <h2 className="text-center text-[12px] font-bold uppercase tracking-[0.18em] text-muted-2">
          {t("landing.hiwTitle")}
        </h2>
        <ol className="mx-auto mt-8 grid max-w-4xl gap-6 sm:mt-10 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border/80">
          {steps.map((step) => (
            <li
              key={step.n}
              className="flex flex-col border-b border-border/60 pb-6 last:border-b-0 last:pb-0 sm:border-b-0 sm:px-6 sm:pb-0 sm:first:pl-0 sm:last:pr-0 lg:px-8"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-[15px] font-bold text-white shadow-[0_8px_24px_-8px_rgb(47_95_255/0.5)]">
                {step.n}
              </span>
              <p className="mt-4 text-[16px] font-semibold leading-snug tracking-tight text-foreground">
                {t(step.titleKey)}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                {t(step.descKey)}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
