"use client";

import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";

/** Kun avaat tämän, tiedät mitä tehdä — myyntiosio */
export function LandingOpenKnowWhatToDo() {
  const { t } = useTranslation();

  return (
    <section
      className="border-b border-white/[0.06] bg-[#070910] py-20 sm:py-28"
      aria-labelledby="landing-open-know"
    >
      <Container size="narrow" className="max-w-5xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              {t("landing.finalOpenEyebrow")}
            </p>
            <h2
              id="landing-open-know"
              className="mt-4 text-balance text-[1.6rem] font-semibold leading-[1.12] tracking-[-0.035em] text-zinc-50 sm:text-[1.85rem]"
            >
              {t("landing.finalOpenTitle")}
            </h2>
            <ul className="mt-8 space-y-4">
              <li className="text-[15px] font-semibold leading-snug text-zinc-100">
                {t("landing.finalOpenLine1")}
              </li>
              <li className="text-[15px] font-semibold leading-snug text-zinc-100">
                {t("landing.finalOpenLine2")}
              </li>
              <li className="text-[15px] leading-relaxed text-zinc-400">
                {t("landing.finalOpenLine3")}
              </li>
            </ul>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-red-500/25 bg-red-500/[0.06] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-300/90">
                  {t("landing.finalOpenNot")}
                </p>
                <p className="mt-2 text-[13px] leading-snug text-zinc-300">
                  {t("landing.finalOpenNotBody")}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300/90">
                  {t("landing.finalOpenInstead")}
                </p>
                <p className="mt-2 text-[13px] leading-snug text-zinc-200">
                  {t("landing.finalOpenInsteadBody")}
                </p>
              </div>
            </div>

            <p className="mt-8">
              <Link
                href="/start"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-accent px-6 py-3 text-[15px] font-semibold text-white transition hover:opacity-95"
              >
                {t("landing.finalOpenCta")}
              </Link>
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[320px]">
            <div
              className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-[radial-gradient(90%_70%_at_50%_20%,rgb(59_130_246/0.35),transparent_65%)] blur-2xl"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.12] bg-[#0c0f18] shadow-[0_24px_80px_-32px_rgb(0_0_0/0.85)]">
              <div className="border-b border-white/[0.08] px-4 py-3">
                <div className="mx-auto h-1.5 w-16 rounded-full bg-white/10" />
              </div>
              <div className="space-y-3 px-4 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {t("landing.finalOpenMockEyebrow")}
                </p>
                <p className="text-[1.35rem] font-semibold leading-tight text-zinc-50">
                  {t("landing.finalOpenMockTitle")}
                </p>
                <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-3">
                  <p className="text-[12px] leading-relaxed text-zinc-400">
                    {t("landing.finalOpenMockBody")}
                  </p>
                </div>
                <div className="rounded-xl border border-accent/30 bg-accent/[0.12] px-3 py-3">
                  <p className="text-[12px] font-medium leading-snug text-zinc-100">
                    {t("landing.finalOpenMockHighlight")}
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-[11px] text-zinc-600">
              {t("landing.finalOpenMockCaption")}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
