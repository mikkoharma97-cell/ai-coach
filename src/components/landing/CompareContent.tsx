"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import { appendBuildQuery } from "@/lib/buildInfo";

export function CompareContent() {
  const { t } = useTranslation();

  /** Tiivis vertailu mobiiliin — tärkeimmät erot ensin. */
  const humanDoes = [
    "compare.humanDoes1",
    "compare.humanDoes2",
    "compare.humanDoes3",
    "compare.humanDoes4",
  ] as const;

  const appDoes = [
    "compare.appDoes1",
    "compare.appDoes2",
    "compare.appDoes3",
    "compare.appDoes4",
    "compare.appDoes5",
    "compare.appDoes6",
  ] as const;

  const basedOn = [
    "compare.basedOn1",
    "compare.basedOn2",
    "compare.basedOn3",
  ] as const;

  return (
    <div className="border-b border-white/[0.06] bg-[var(--background)] pb-16 pt-8">
      <Container size="default" className="max-w-2xl">
        <h1 className="text-balance text-[1.45rem] font-semibold leading-tight tracking-[-0.03em] text-[color:var(--foreground)] sm:text-[1.6rem]">
          {t("compare.pageTitle")}
        </h1>
        <p className="mt-3 max-w-prose text-[14px] leading-snug text-zinc-400">
          {t("compare.pageLead")}
        </p>

        <section className="mt-10" aria-labelledby="compare-human">
          <h2
            id="compare-human"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
          >
            {t("compare.sectionHuman")}
          </h2>
          <ul className="mt-3 space-y-2.5 text-[14px] leading-snug text-zinc-200">
            {humanDoes.map((k) => (
              <li key={k} className="flex gap-2.5">
                <span className="shrink-0 text-accent/75" aria-hidden>
                  ·
                </span>
                <span>{t(k)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10" aria-labelledby="compare-app">
          <h2
            id="compare-app"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
          >
            {t("compare.sectionApp")}
          </h2>
          <ul className="mt-3 space-y-2 text-[14px] leading-snug text-zinc-300">
            {appDoes.map((k) => (
              <li key={k} className="flex gap-2.5">
                <span className="shrink-0 text-[11px] text-accent/70" aria-hidden>
                  ✓
                </span>
                <span>{t(k)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10" aria-labelledby="compare-based">
          <h2
            id="compare-based"
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
          >
            {t("compare.sectionBased")}
          </h2>
          <ul className="mt-3 space-y-2 text-[14px] leading-snug text-zinc-400">
            {basedOn.map((k) => (
              <li key={k} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-500" aria-hidden />
                <span>{t(k)}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href={appendBuildQuery("/start")}
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[14px] bg-accent px-6 text-[16px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:brightness-110 sm:w-auto"
          >
            {t("compare.ctaStart")}
          </Link>
          <Link
            href="/home"
            className="text-center text-[13px] font-medium text-zinc-500 underline-offset-4 transition hover:text-zinc-300 hover:underline sm:text-left"
          >
            {t("compare.ctaBack")}
          </Link>
        </div>
      </Container>
    </div>
  );
}
