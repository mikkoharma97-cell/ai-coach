"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { shouldShowPaywall } from "@/lib/paywallPolicy";

export function PaywallV1Panel({
  onContinue,
  onBack,
  /** Today milestone overlay: käyttäjä on vielä trialissa — älä piilota paneelia `shouldShowPaywall`-haaralla. */
  engagementOverlay = false,
}: {
  onContinue: () => void;
  onBack?: () => void;
  engagementOverlay?: boolean;
}) {
  const { t } = useTranslation();

  if (!engagementOverlay && !shouldShowPaywall()) return null;

  return (
    <Container
      size="phone"
      className="w-full max-w-[min(100%,24rem)] px-4 py-1 text-center"
    >
      <div className="[&_h2]:text-[1.05rem] [&_h2]:font-semibold [&_li]:text-[12px] [&_li]:leading-snug [&_li]:font-medium [&_p]:text-[12px] [&_p]:leading-snug">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-2/90">
          {t("paywallV1.eyebrow")}
        </p>
        <h2
          id="paywall-v1-title"
          className="mt-2 text-balance leading-tight tracking-[-0.03em] text-foreground/95"
        >
          {t("paywallV1.title")}
        </h2>
        <p className="mt-2 text-balance font-medium text-muted-2/90">
          {t("paywallV1.subtitle")}
        </p>
        <ul className="mt-5 space-y-2 text-left text-foreground/85 [&_span:last-child]:opacity-90">
          <li className="flex gap-3">
            <span className="text-accent/90" aria-hidden>
              ·
            </span>
            <span>{t("paywallV1.bullet1")}</span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent/90" aria-hidden>
              ·
            </span>
            <span>{t("paywallV1.bullet2")}</span>
          </li>
          <li className="flex gap-3">
            <span className="text-accent/90" aria-hidden>
              ·
            </span>
            <span>{t("paywallV1.bullet3")}</span>
          </li>
        </ul>
      </div>
      <div className="mt-8 flex w-full flex-col items-center gap-2.5">
        <button
          type="button"
          onClick={onContinue}
          className="flex min-h-[60px] w-full max-w-[min(100%,20rem)] touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[18px] font-semibold tracking-[-0.02em] text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t("paywallV1.cta")}
        </button>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="border-0 bg-transparent px-2 py-1.5 text-[11px] font-normal text-muted-2/55 transition hover:text-muted-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {t("paywallV1.back")}
          </button>
        ) : null}
      </div>
    </Container>
  );
}
