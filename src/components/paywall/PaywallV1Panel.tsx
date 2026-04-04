"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";

export function PaywallV1Panel({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Container
      size="phone"
      className="w-full max-w-[min(100%,24rem)] px-4 py-1 text-center"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-2">
        {t("paywallV1.eyebrow")}
      </p>
      <h2
        id="paywall-v1-title"
        className="mt-2 text-balance text-[1.375rem] font-semibold leading-tight tracking-[-0.03em] text-foreground"
      >
        {t("paywallV1.title")}
      </h2>
      <p className="mt-2 text-balance text-[13px] font-medium leading-snug text-muted-2">
        {t("paywallV1.subtitle")}
      </p>
      <ul className="mt-5 space-y-2 text-left text-[14px] font-medium leading-snug text-foreground">
        <li className="flex gap-3">
          <span className="text-accent" aria-hidden>
            ·
          </span>
          <span>{t("paywallV1.bullet1")}</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent" aria-hidden>
            ·
          </span>
          <span>{t("paywallV1.bullet2")}</span>
        </li>
        <li className="flex gap-3">
          <span className="text-accent" aria-hidden>
            ·
          </span>
          <span>{t("paywallV1.bullet3")}</span>
        </li>
      </ul>
      <div className="mt-6 flex w-full flex-col gap-2.5">
        <button
          type="button"
          onClick={onContinue}
          className="flex h-[56px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[17px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t("paywallV1.cta")}
        </button>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex min-h-[48px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] border border-white/[0.12] bg-white/[0.04] text-[15px] font-semibold text-foreground transition hover:bg-white/[0.07] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("paywallV1.back")}
          </button>
        ) : null}
      </div>
    </Container>
  );
}
