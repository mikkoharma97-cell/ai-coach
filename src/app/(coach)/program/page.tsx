"use client";

import { Container } from "@/components/ui/Container";
import { text } from "@/data/coachOffer";
import { PROGRAM_LINE_CARDS, PROGRAM_PAGE_COPY } from "@/data/programLines";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";

export default function ProgramPickerPage() {
  const { locale } = useTranslation();
  const loc = locale === "en" ? "en" : "fi";

  return (
    <main className="min-h-0 flex-1 bg-[#050608]">
      <Container
        size="phone"
        className="px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:px-5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-balance text-[1.75rem] font-bold leading-none tracking-[-0.04em] text-white sm:text-[2rem]">
            {text(loc, PROGRAM_PAGE_COPY.title)}
          </h1>
          <span className="rounded-full border border-white/20 bg-white/[0.07] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/90">
            {text(loc, PROGRAM_PAGE_COPY.previewBadge)}
          </span>
        </div>
        <p className="mt-3 max-w-xl text-[17px] font-medium leading-snug text-white/72">
          {text(loc, PROGRAM_PAGE_COPY.lead)}
        </p>
        <p
          className="mt-3 max-w-[28rem] text-[14px] font-medium leading-snug text-amber-200/85"
          role="status"
        >
          {text(loc, PROGRAM_PAGE_COPY.activationHonest)}
        </p>

        <div
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5"
          aria-label={text(loc, PROGRAM_PAGE_COPY.title)}
        >
          {PROGRAM_LINE_CARDS.map((line) => (
            <article
              key={line.id}
              className={`relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-5 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.85)] ring-1 ring-inset ${line.gradient} ${line.ring}`}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.14]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.35), transparent 42%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.12), transparent 50%)",
                }}
                aria-hidden
              />
              <div className="relative">
                <h2 className="text-[1.5rem] font-bold uppercase leading-none tracking-[-0.05em] text-white sm:text-[1.65rem]">
                  {text(loc, line.headline)}
                </h2>
                <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-white/55">
                  {line.weeks} {text(loc, PROGRAM_PAGE_COPY.weeksLabel)}
                </p>
                <p className="mt-4 text-[15px] font-semibold leading-snug text-white/88">
                  {text(loc, line.goal)}
                </p>
                <p className="mt-3 text-[14px] font-medium leading-relaxed text-white/62">
                  {text(loc, line.benefit)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/packages"
            scroll={false}
            className="flex min-h-[52px] w-full items-center justify-center rounded-xl bg-white px-4 text-[17px] font-bold tracking-[-0.02em] text-black transition hover:bg-white/92 active:scale-[0.99]"
          >
            {text(loc, PROGRAM_PAGE_COPY.ctaPackages)}
          </Link>
          <p className="mt-3 text-center text-[12px] font-medium text-white/45">
            {text(loc, PROGRAM_PAGE_COPY.ctaPackagesHint)}
          </p>
        </div>
      </Container>
    </main>
  );
}
