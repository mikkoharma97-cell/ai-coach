"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { appendBuildQuery } from "@/lib/buildInfo";

export function CompareContent() {
  const { t } = useTranslation();

  const humanDoes = [
    "compare.humanDoes1",
    "compare.humanDoes2",
    "compare.humanDoes3",
    "compare.humanDoes4",
    "compare.humanDoes5",
  ] as const;

  const appDoes = [
    "compare.appDoes1",
    "compare.appDoes2",
    "compare.appDoes3",
    "compare.appDoes4",
    "compare.appDoes5",
    "compare.appDoes6",
    "compare.appDoes7",
    "compare.appDoes8",
    "compare.appDoes9",
    "compare.appDoes10",
    "compare.appDoes11",
    "compare.appDoes12",
  ] as const;

  const basedOn = [
    "compare.basedOn1",
    "compare.basedOn2",
    "compare.basedOn3",
    "compare.basedOn4",
    "compare.basedOn5",
    "compare.basedOn6",
  ] as const;

  return (
    <div className="border-b border-white/[0.06] bg-[var(--background)] pb-16 pt-8">
      <Container size="default" className="max-w-2xl">
        <h1 className="text-balance text-[1.5rem] font-semibold tracking-[-0.03em] text-[color:var(--foreground)] sm:text-[1.65rem]">
          {t("compare.pageTitle")}
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">
          {t("compare.pageLead")}
        </p>

        <section className="mt-12" aria-labelledby="compare-human">
          <h2
            id="compare-human"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
          >
            {t("compare.sectionHuman")}
          </h2>
          <ul className="mt-4 space-y-3 text-[15px] leading-snug text-zinc-200">
            {humanDoes.map((k) => (
              <li key={k} className="flex gap-3">
                <span className="text-accent/80" aria-hidden>
                  →
                </span>
                {t(k)}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14" aria-labelledby="compare-app">
          <h2
            id="compare-app"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
          >
            {t("compare.sectionApp")}
          </h2>
          <ul className="mt-4 space-y-2.5 text-[14px] leading-snug text-zinc-300">
            {appDoes.map((k) => (
              <li key={k} className="flex gap-2.5">
                <span className="shrink-0 text-[11px] text-accent/70" aria-hidden>
                  ✓
                </span>
                {t(k)}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14" aria-labelledby="compare-based">
          <h2
            id="compare-based"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
          >
            {t("compare.sectionBased")}
          </h2>
          <ul className="mt-4 space-y-2.5 text-[14px] leading-relaxed text-zinc-400">
            {basedOn.map((k) => (
              <li key={k}>{t(k)}</li>
            ))}
          </ul>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href={appendBuildQuery("/start")}
            className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] bg-accent px-6 text-[15px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:brightness-110"
          >
            {t("compare.ctaStart")}
          </Link>
          <Link
            href="/home"
            className="inline-flex min-h-[48px] items-center justify-center rounded-[14px] border border-white/12 px-6 text-[14px] font-semibold text-zinc-300 transition hover:border-white/20"
          >
            {t("compare.ctaBack")}
          </Link>
        </div>
      </Container>
    </div>
  );
}
