"use client";

import { CTAButton } from "@/components/CTAButton";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { appendBuildQuery } from "@/lib/buildInfo";
import Link from "next/link";

const HERO_ROOT = "landing-hero-shell";
const ctaRing =
  "focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]";
const sectionGap = "py-14 sm:py-[4.25rem]";
const eyebrow =
  "text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500";
const h2 = "text-balance text-[clamp(1.35rem,4vw+0.6rem,1.85rem)] font-semibold leading-[1.15] tracking-[-0.035em] text-[color:var(--foreground)]";
const body = "mt-3 max-w-[26rem] text-[15px] leading-relaxed text-muted sm:text-[15px]";
const divider = "border-b border-white/[0.06]";

function SalesBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-[15px] leading-snug text-zinc-200/95">
      <span
        className="mt-2 size-1.5 shrink-0 rounded-full bg-accent/80"
        aria-hidden
      />
      <span>{children}</span>
    </li>
  );
}

/**
 * Mobile-first system-myyntipolku: järjestelmä, ei ihmisvalmentaja.
 */
export function SystemSalesLanding() {
  const { t } = useTranslation();
  const startHref = appendBuildQuery("/start");

  return (
    <div className="bg-[var(--background)]">
      {/* 1 Hero */}
      <section className={`${HERO_ROOT} ${divider}`}>
        <Container size="default" className="px-4 sm:px-6">
          <div className={`mx-auto flex max-w-[min(100%,24rem)] flex-col items-center text-center ${sectionGap}`}>
            <h1 className="text-balance text-[clamp(1.7rem,5vw+0.5rem,2.35rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-[color:var(--foreground)]">
              <span className="block">{t("landing.sales.heroLine1")}</span>
              <span className="mt-2 block text-[color:var(--foreground)]">
                {t("landing.sales.heroLine2")}
              </span>
            </h1>
            <p className="mt-6 text-[15px] leading-relaxed text-muted sm:mt-7 sm:text-[16px]">
              {t("landing.sales.heroLead")}
            </p>
            <div className="mt-10 flex w-full max-w-xs flex-col items-stretch gap-3 sm:mt-12">
              <CTAButton
                href={startHref}
                className={`!min-h-[56px] w-full !rounded-[15px] !px-8 !py-4 !text-[17px] !font-semibold !shadow-[var(--shadow-primary-cta)] ${ctaRing}`}
              >
                {t("landing.sales.ctaPrimary")}
              </CTAButton>
              <a
                href="#sales-today"
                className="text-center text-[13px] font-medium leading-snug text-zinc-500/95 underline-offset-[6px] transition hover:text-zinc-300 hover:underline"
              >
                {t("landing.sales.scrollHint")}
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* 2 Today — painotus */}
      <section id="sales-today" className={`scroll-mt-[72px] ${divider}`}>
        <Container size="default" className={`px-4 sm:px-6 ${sectionGap}`}>
          <div className="mx-auto max-w-[min(100%,22rem)]">
            <p className={eyebrow}>{t("landing.sales.todayEyebrow")}</p>
            <h2 className={`mt-3 ${h2}`}>{t("landing.sales.todayTitle")}</h2>
            <p className={`${body} mt-2 font-medium text-foreground/90`}>
              {t("landing.sales.todaySub")}
            </p>
            <ul className="mt-8 space-y-4 sm:mt-9">
              <SalesBullet>{t("landing.sales.todayB1")}</SalesBullet>
              <SalesBullet>{t("landing.sales.todayB2")}</SalesBullet>
              <SalesBullet>{t("landing.sales.todayB3")}</SalesBullet>
            </ul>
          </div>
          {/* Kevyt “today” -preview ilman app-kopiota */}
          <div className="mx-auto mt-10 max-w-[min(100%,19.5rem)] sm:mt-12">
            <div className="rounded-[1.25rem] border border-white/[0.09] bg-[#07080d]/90 px-5 py-5 shadow-[0_24px_64px_-28px_rgba(0,0,0,0.75)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                {t("landing.sales.previewCardEyebrow")}
              </p>
              <p className="mt-4 text-[14px] font-medium leading-snug text-zinc-100">
                {t("landing.sales.previewCardLine")}
              </p>
              <p className="mt-3 text-[12px] leading-snug text-zinc-500">
                {t("landing.sales.previewCardHint")}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 3 System */}
      <section id="sales-system" className={divider}>
        <Container size="default" className={`px-4 sm:px-6 ${sectionGap}`}>
          <div className="mx-auto max-w-[min(100%,22rem)] text-center">
            <p className={eyebrow}>{t("landing.sales.systemEyebrow")}</p>
            <h2 className={`mt-3 ${h2}`}>{t("landing.sales.systemTitle")}</h2>
            <p className={`${body} mx-auto`}>{t("landing.sales.systemSub")}</p>
          </div>
        </Container>
      </section>

      {/* 4–6 Workout / Food / Progress */}
      <section className={divider}>
        <Container size="default" className={`px-4 sm:px-6 ${sectionGap}`}>
          <div className="mx-auto max-w-[min(100%,24rem)] space-y-12 sm:space-y-14">
            <div>
              <h2 className={h2}>{t("landing.sales.workoutTitle")}</h2>
              <p className={body}>{t("landing.sales.workoutSub")}</p>
            </div>
            <div>
              <h2 className={h2}>{t("landing.sales.foodTitle")}</h2>
              <p className={body}>{t("landing.sales.foodSub")}</p>
            </div>
            <div>
              <h2 className={h2}>{t("landing.sales.progressTitle")}</h2>
              <p className={body}>{t("landing.sales.progressSub")}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* 7 Price */}
      <section id="sales-price" className={divider}>
        <Container size="default" className={`px-4 sm:px-6 ${sectionGap}`}>
          <div className="mx-auto max-w-[min(100%,22rem)] text-center">
            <p className={eyebrow}>{t("landing.sales.priceEyebrow")}</p>
            <h2 className={`mt-3 ${h2}`}>{t("landing.sales.priceTitle")}</h2>
            <p className={`${body} mx-auto`}>{t("landing.sales.priceSub")}</p>
            <p className="mx-auto mt-5 max-w-[24rem] text-[13px] leading-relaxed text-zinc-500">
              {t("landing.sales.priceNote")}
            </p>
          </div>
        </Container>
      </section>

      {/* 8 CTA strip */}
      <section className={divider}>
        <Container size="default" className="px-4 py-12 sm:px-6 sm:py-14">
          <div className="mx-auto flex max-w-xs flex-col items-stretch gap-3 text-center">
            <CTAButton
              href={startHref}
              className={`!min-h-[56px] w-full !rounded-[15px] !text-[17px] !font-semibold ${ctaRing}`}
            >
              {t("landing.sales.ctaPrimary")}
            </CTAButton>
            <p className="text-[13px] leading-snug text-muted">
              {t("landing.sales.finalHint")}
            </p>
          </div>
        </Container>
      </section>

      {/* 9 Flow */}
      <section id="sales-flow" className={`scroll-mt-[72px] ${divider}`}>
        <Container size="default" className={`px-4 sm:px-6 ${sectionGap}`}>
          <div className="mx-auto max-w-[min(100%,22rem)]">
            <p className={`${eyebrow} text-center`}>
              {t("landing.sales.flowEyebrow")}
            </p>
            <h2 className={`mt-3 text-center ${h2}`}>
              {t("landing.sales.flowTitle")}
            </h2>
            <ol className="mt-10 space-y-6 sm:mt-11">
              {(
                [
                  "landing.sales.flowStep1",
                  "landing.sales.flowStep2",
                  "landing.sales.flowStep3",
                  "landing.sales.flowStep4",
                ] as const
              ).map((key, i) => (
                <li key={key} className="flex gap-4">
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-[13px] font-semibold tabular-nums text-foreground"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <p className="pt-1 text-[15px] leading-relaxed text-zinc-200/95">
                    {t(key)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* 10 FAQ — kevyt */}
      <section id="sales-faq" className={divider}>
        <Container size="default" className="px-4 pb-16 pt-4 sm:px-6 sm:pb-20">
          <div className="mx-auto max-w-[min(100%,24rem)] space-y-4">
            <h2 className="text-center text-[13px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {t("landing.sales.faqHeading")}
            </h2>
            <details className="group rounded-[var(--radius-lg)] border border-white/[0.07] bg-white/[0.02] px-4 py-3">
              <summary className="cursor-pointer list-none text-[14px] font-medium text-foreground outline-none [&::-webkit-details-marker]:hidden">
                {t("landing.sales.faq1q")}
              </summary>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {t("landing.sales.faq1a")}
              </p>
            </details>
            <details className="group rounded-[var(--radius-lg)] border border-white/[0.07] bg-white/[0.02] px-4 py-3">
              <summary className="cursor-pointer list-none text-[14px] font-medium text-foreground outline-none [&::-webkit-details-marker]:hidden">
                {t("landing.sales.faq2q")}
              </summary>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {t("landing.sales.faq2a")}
              </p>
            </details>
          </div>
          <p className="mx-auto mt-10 max-w-[20rem] text-center text-[12px] leading-relaxed text-zinc-600">
            <Link
              href="/compare"
              className="font-medium text-zinc-500 underline-offset-4 transition hover:text-zinc-400 hover:underline"
            >
              {t("landing.sales.compareLink")}
            </Link>
          </p>
        </Container>
      </section>
    </div>
  );
}
