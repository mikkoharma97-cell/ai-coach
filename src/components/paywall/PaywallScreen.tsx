"use client";

import { HelpVideoCard } from "@/components/ui/HelpVideoCard";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import type { MessageKey } from "@/lib/i18n";
import {
  ensureTrialStarted,
  hasSubscriptionAccess,
  hasTrialStarted,
  isTrialExpired,
  setSubscribed,
} from "@/lib/subscription";
import { useClientProfile } from "@/hooks/useClientProfile";
import { PaywallComingNextSection } from "@/components/paywall/PaywallComingNextSection";
import { logClickTrial, logOpenPaywall } from "@/lib/eventLogger";
import { getCoachFeatureToggles } from "@/lib/coachFeatureToggles";
import { loadProfile } from "@/lib/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

const SELL_KEYS = [
  "paywall.sell1",
  "paywall.sell2",
  "paywall.sell3",
  "paywall.sell4",
  "paywall.sell5",
  "paywall.sell6",
  "paywall.sell7",
  "paywall.sell8",
  "paywall.sell9",
] as const satisfies readonly MessageKey[];

const LEFT_KEYS = [
  "paywall.compareLeft1",
  "paywall.compareLeft2",
  "paywall.compareLeft3",
] as const satisfies readonly MessageKey[];

const RIGHT_KEYS = [
  "paywall.compareRight1",
  "paywall.compareRight2",
  "paywall.compareRight3",
] as const satisfies readonly MessageKey[];

const PROGRESS_KEYS = [
  "paywall.progress1",
  "paywall.progress2",
  "paywall.progress3",
] as const satisfies readonly MessageKey[];

const FOMO_KEYS = [
  "paywall.fomo1",
  "paywall.fomo2",
  "paywall.fomo3",
] as const satisfies readonly MessageKey[];

function Bullet({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "fomo";
}) {
  return (
    <li className="flex gap-3 text-[14px] leading-snug text-foreground/95">
      <span
        className={`mt-[0.35em] h-1.5 w-1.5 shrink-0 rounded-full ${
          tone === "fomo" ? "bg-amber-500/70" : "bg-accent/80"
        }`}
        aria-hidden
      />
      <span className="min-w-0">{children}</span>
    </li>
  );
}

export function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const profile = useClientProfile();
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  const showHelpVideos = useMemo(
    () => getCoachFeatureToggles(profile ?? null).showHelpVideos,
    [profile],
  );

  const paywallViewTracked = useRef(false);
  useEffect(() => {
    if (!paywallViewTracked.current) {
      paywallViewTracked.current = true;
      logOpenPaywall();
    }
    if (loadProfile()) ensureTrialStarted();
    if (hasSubscriptionAccess()) {
      router.replace("/app");
    }
  }, [router]);

  const onSubscribe = () => {
    setSubscribed(true);
    router.push("/app");
  };

  const onStartTrial = () => {
    logClickTrial();
    ensureTrialStarted();
    if (loadProfile()) {
      router.push("/app");
    } else {
      router.push("/start");
    }
  };

  const expired = isTrialExpired();
  const noTrialYet = !hasTrialStarted();

  const payCtaLabel =
    billing === "yearly" ? t("paywall.ctaPayYearly") : t("paywall.ctaPayMonthly");

  return (
    <main className="min-h-dvh bg-gradient-to-b from-card/40 via-background to-background pb-12 pt-10 sm:pt-14">
      <Container size="phone" className="max-w-[min(100%,26rem)] px-5 sm:px-6">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-2">
          {t("paywall.kicker")}
        </p>

        <h1 className="mx-auto mt-8 max-w-[22ch] text-balance text-center text-[1.75rem] font-semibold leading-[1.12] tracking-[-0.04em] text-foreground sm:text-[2rem]">
          {t("paywall.title")}
        </h1>

        <p className="mx-auto mt-5 max-w-md text-center text-[15px] font-medium leading-relaxed text-muted">
          {t("paywall.subtitle")}
        </p>

        <p className="mx-auto mt-4 max-w-md text-center text-[13px] leading-snug text-muted-2">
          {t("paywall.notForYouIfNoGuidance")}
        </p>

        <p className="mx-auto mt-4 max-w-md text-center text-[14px] font-semibold leading-snug text-foreground/95">
          {t("paywall.conversionLock")}
        </p>

        <p className="mx-auto mt-4 max-w-md text-center text-[14px] font-semibold leading-snug text-foreground">
          {t("paywall.coachPresenceAnchor")}
        </p>

        <p className="mx-auto mt-4 max-w-md text-center text-[13px] font-medium leading-snug text-foreground/90">
          {t("product.profileConcreteLine")}
        </p>

        <nav
          className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] font-medium"
          aria-label={t("paywall.title")}
        >
          <Link
            href="/app"
            className="text-accent underline-offset-[3px] hover:underline"
          >
            {t("ui.today")}
          </Link>
          <Link
            href="/start"
            className="text-muted transition hover:text-foreground hover:underline"
          >
            {t("paywall.linkOnboarding")}
          </Link>
          <Link
            href="/home"
            className="text-muted transition hover:text-foreground hover:underline"
          >
            {t("paywall.backHome")}
          </Link>
        </nav>

        <p className="mx-auto mt-3 max-w-md text-center text-[12px] font-semibold leading-snug text-foreground/85">
          {t("paywall.rhythmFirstWeek")}
        </p>
        <p className="mx-auto mt-1.5 max-w-md text-center text-[12px] leading-snug text-muted-2">
          {t("paywall.trialShowsRealLife")}
        </p>

        <p className="mx-auto mt-4 max-w-md text-center text-[13px] font-semibold leading-snug text-foreground/90">
          {t("paywall.positioningLine")}
        </p>

        <ul className="mx-auto mt-8 max-w-md list-none space-y-3.5 px-0.5">
          {SELL_KEYS.map((k) => (
            <Bullet key={k}>{t(k)}</Bullet>
          ))}
        </ul>

        <p className="mx-auto mt-8 max-w-md text-center text-[14px] leading-relaxed text-muted">
          <span className="block text-muted-2">{t("paywall.compareTypical")}</span>
          <span className="mt-2 block font-semibold text-foreground/95">
            {t("paywall.compareThisSystem")}
          </span>
        </p>

        <HelpVideoCard
          pageId="paywall"
          enabled={showHelpVideos}
          className="mx-auto mt-8 max-w-md"
        />

        <PaywallComingNextSection />

        <p className="mx-auto mt-8 max-w-md text-center text-[14px] font-medium leading-relaxed text-foreground/90">
          {t("paywall.compareSummary")}
        </p>

        <div className="mx-auto mt-6 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3">
          <section
            className="rounded-[var(--radius-xl)] border border-border/70 bg-card/40 px-4 py-4 text-left"
            aria-labelledby="paywall-compare-left"
          >
            <h2
              id="paywall-compare-left"
              className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-2"
            >
              {t("paywall.compareLeftTitle")}
            </h2>
            <ul className="mt-3 space-y-2.5 text-[13px] leading-snug text-muted">
              {LEFT_KEYS.map((k) => (
                <li key={k} className="flex gap-2">
                  <span className="text-muted-2" aria-hidden>
                    ·
                  </span>
                  <span>{t(k)}</span>
                </li>
              ))}
            </ul>
          </section>
          <section
            className="rounded-[var(--radius-xl)] border border-accent/35 bg-accent/[0.07] px-4 py-4 text-left shadow-[0_12px_40px_-20px_rgb(47_95_255/0.45)]"
            aria-labelledby="paywall-compare-right"
          >
            <h2
              id="paywall-compare-right"
              className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent"
            >
              {t("paywall.compareRightTitle")}
            </h2>
            <ul className="mt-3 space-y-2.5 text-[13px] font-medium leading-snug text-foreground/95">
              {RIGHT_KEYS.map((k) => (
                <li key={k} className="flex gap-2">
                  <span className="text-accent" aria-hidden>
                    ✓
                  </span>
                  <span>{t(k)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section
          className="mx-auto mt-10 max-w-md"
          aria-labelledby="paywall-progress-head"
        >
          <h2
            id="paywall-progress-head"
            className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-2"
          >
            {t("paywall.progressHeadline")}
          </h2>
          <ul className="mt-4 list-none space-y-3 px-0.5">
            {PROGRESS_KEYS.map((k) => (
              <Bullet key={k}>{t(k)}</Bullet>
            ))}
          </ul>
        </section>

        <section
          className="mx-auto mt-10 max-w-md rounded-[var(--radius-xl)] border border-amber-500/25 bg-amber-500/[0.06] px-4 py-4"
          aria-labelledby="paywall-fomo"
        >
          <h2
            id="paywall-fomo"
            className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-600/90 dark:text-amber-400/90"
          >
            {t("paywall.fomoHeadline")}
          </h2>
          <ul className="mt-4 list-none space-y-3 px-0.5">
            {FOMO_KEYS.map((k) => (
              <Bullet key={k} tone="fomo">
                {t(k)}
              </Bullet>
            ))}
          </ul>
        </section>

        <div className="mx-auto mt-8 max-w-md rounded-[var(--radius-xl)] border border-border/70 bg-card/50 px-5 py-5 text-left">
          <h2 className="text-[15px] font-semibold leading-snug text-foreground">
            {t("paywall.coachingPainTitle")}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            {t("paywall.coachingPainBody")}
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-md flex-col gap-3">
          <button
            type="button"
            onClick={() => setBilling("yearly")}
            className={`relative order-1 rounded-[var(--radius-xl)] border px-5 py-6 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring ${
              billing === "yearly"
                ? "border-accent bg-accent-soft shadow-[0_16px_48px_-20px_rgb(47_95_255/0.55)] ring-2 ring-accent/30"
                : "border-border/80 bg-card/60 hover:border-accent/30"
            }`}
          >
            <span className="absolute -top-2.5 right-4 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              {t("paywall.yearlyBadge")}
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
              {t("paywall.yearlyTitle")}
            </p>
            <p className="mt-2 text-[1.65rem] font-semibold tabular-nums text-foreground">
              €{t("paywall.yearlyPrice")}
              <span className="text-[1rem] font-semibold text-muted-2">
                {t("paywall.perYear")}
              </span>
            </p>
            <p className="mt-2 text-[13px] leading-snug text-muted">
              {t("paywall.yearlyBullets")}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`order-2 rounded-[var(--radius-lg)] border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring ${
              billing === "monthly"
                ? "border-accent/80 bg-accent-soft/80"
                : "border-border/60 bg-card/40 opacity-[0.88] hover:border-accent/25"
            }`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                {t("paywall.monthlyTitle")}
              </p>
              <p className="text-[1.1rem] font-semibold tabular-nums text-foreground">
                €{t("paywall.price")}
                <span className="text-[0.85rem] font-medium text-muted-2">
                  {t("paywall.perMonth")}
                </span>
              </p>
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-muted">
              {t("paywall.monthlyBullets")}
            </p>
          </button>
        </div>

        <p className="mx-auto mt-4 max-w-md text-center text-[13px] leading-relaxed text-muted-2">
          {billing === "yearly"
            ? t("paywall.yearlyNote")
            : t("paywall.monthlyPitch")}
        </p>
        {billing === "yearly" ? (
          <p className="mx-auto mt-2 max-w-md text-center text-[12px] text-muted-2">
            {t("paywall.yearlyDeal")}
          </p>
        ) : null}

        <p className="mx-auto mt-6 max-w-md rounded-[var(--radius-lg)] border border-border/60 bg-card/60 px-4 py-3 text-center text-[12px] leading-relaxed text-muted">
          {t("paywall.feedbackBonus")}
        </p>

        <div className="mx-auto mt-8 max-w-md rounded-[var(--radius-2xl)] border border-border/80 bg-card/90 px-5 py-8 shadow-[var(--shadow-card)] sm:px-6">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
              {t("ui.trial")}
            </p>
            <p className="mt-2 text-[2.25rem] font-semibold tabular-nums leading-none tracking-tight text-foreground">
              {billing === "yearly" ? (
                <>
                  €{t("paywall.yearlyPrice")}
                  <span className="text-[1.1rem] font-semibold text-muted-2">
                    {t("paywall.perYear")}
                  </span>
                </>
              ) : (
                <>
                  €{t("paywall.price")}
                  <span className="text-[1.1rem] font-semibold text-muted-2">
                    {t("paywall.perMonth")}
                  </span>
                </>
              )}
            </p>
            <p className="mt-3 text-[14px] font-medium text-muted">
              {billing === "yearly"
                ? t("paywall.yearlyNote")
                : t("paywall.subPrice")}
            </p>
          </div>

          <p className="mt-8 text-center text-[13px] leading-relaxed text-muted-2">
            {t("paywall.trialCopy")}
          </p>

          <p className="mt-6 text-center text-[14px] font-semibold leading-snug text-foreground/95">
            {t("paywall.rhythmGuarantee")}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {expired ? (
              <>
                <p className="text-center text-[13px] leading-relaxed text-muted">
                  {t("paywall.trialEnded")}
                </p>
                <button
                  type="button"
                  onClick={onSubscribe}
                  className="flex min-h-[54px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-accent px-3 text-[16px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {payCtaLabel}
                </button>
              </>
            ) : noTrialYet ? (
              <button
                type="button"
                onClick={onStartTrial}
                className="flex min-h-[54px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[16px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t("paywall.ctaTrialStrong")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/app")}
                className="flex min-h-[54px] w-full items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[16px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {t("paywall.continueApp")}
              </button>
            )}

            <p className="text-center text-[11px] leading-relaxed text-muted-2">
              {t("paywall.restoreNote")}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/home"
            className="text-[15px] font-medium text-muted transition hover:text-foreground"
          >
            {t("paywall.backHome")}
          </Link>
        </div>
      </Container>
    </main>
  );
}
