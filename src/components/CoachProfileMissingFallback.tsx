"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";

/** Kun profiilia ei ole / lataus päättyi tyhjään — ei ikuista spinneriä. */
export function CoachProfileMissingFallback() {
  const { t } = useTranslation();
  return (
    <main className="coach-page">
      <Container size="phone" className="px-5 py-12">
        <h2 className="text-[1.25rem] font-semibold leading-tight tracking-[-0.03em] text-foreground">
          {t("fallback.profileMissingTitle")}
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-muted" role="status">
          {t("fallback.profileLoadFailed")}
        </p>
        <Link
          href="/start"
          className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-[var(--radius-lg)] bg-accent px-5 text-[15px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t("fallback.openStart")}
        </Link>
      </Container>
    </main>
  );
}
