"use client";

import {
  COACHING_ECOSYSTEM,
  COACHING_OFFER_DETAIL,
  COACHING_PACKAGES_PAGE,
  COACHING_TIERS,
  text,
} from "@/data/coachOffer";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ProgramPackageId } from "@/types/coach";

type Props = {
  selectedPackageId?: ProgramPackageId;
  onSelectPackage: (id: ProgramPackageId) => void;
};

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5 text-[14px] font-medium leading-snug text-white/82">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/80" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

export function CoachingPackagesView({
  selectedPackageId,
  onSelectPackage,
}: Props) {
  const { locale } = useTranslation();
  const loc = locale === "en" ? "en" : "fi";

  return (
    <div className="min-h-0 flex-1 bg-[#050608] text-white">
      <header className="border-b border-white/[0.06] px-4 pb-8 pt-8 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/85">
          {text(loc, COACHING_PACKAGES_PAGE.eyebrow)}
        </p>
        <h1 className="mt-2 text-balance text-[1.85rem] font-bold leading-[1.1] tracking-[-0.04em] sm:text-[2.1rem]">
          {text(loc, COACHING_PACKAGES_PAGE.title)}
        </h1>
        <p className="mt-4 max-w-xl text-[16px] font-medium leading-relaxed text-white/72">
          {text(loc, COACHING_PACKAGES_PAGE.subtitle)}
        </p>
        <p className="mt-3 max-w-xl text-[13px] font-medium leading-snug text-white/45">
          {text(loc, COACHING_PACKAGES_PAGE.flowHint)}
        </p>
        <Link
          href="/program"
          scroll={false}
          className="mt-5 inline-flex text-[14px] font-semibold text-cyan-300/95 underline-offset-[3px] transition hover:text-cyan-200"
        >
          {text(loc, COACHING_PACKAGES_PAGE.linkPrograms)}
        </Link>
      </header>

      <section
        className="px-4 py-10 sm:px-5"
        aria-labelledby="coaching-tiers-heading"
      >
        <h2
          id="coaching-tiers-heading"
          className="sr-only"
        >
          {text(loc, COACHING_PACKAGES_PAGE.title)}
        </h2>
        <div className="mx-auto flex max-w-lg flex-col gap-4">
          {COACHING_TIERS.map((tier) => {
            const selected = selectedPackageId === tier.enginePackageId;
            return (
              <article
                key={tier.enginePackageId}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.9)] ring-1 ring-inset ${tier.gradient} ${tier.ring}`}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.4), transparent 45%)",
                  }}
                  aria-hidden
                />
                <div className="relative flex flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-[1.5rem] font-bold tracking-[-0.05em]">
                      {text(loc, tier.headline)}
                    </h3>
                    {selected ? (
                      <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/90">
                        {text(loc, COACHING_PACKAGES_PAGE.selectedBadge)}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[15px] font-medium leading-snug text-white/78">
                    {text(loc, tier.forWho)}
                  </p>
                  <ul className="space-y-2 border-t border-white/[0.08] pt-3">
                    {tier.youGet.map((line, i) => (
                      <Bullet key={i}>{text(loc, line)}</Bullet>
                    ))}
                  </ul>
                  <p className="text-[13px] font-semibold tabular-nums text-white/55">
                    {text(loc, tier.priceLabel)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelectPackage(tier.enginePackageId)}
                    className="mt-1 flex min-h-[52px] w-full items-center justify-center rounded-xl bg-white px-4 text-[16px] font-bold tracking-[-0.02em] text-black transition hover:bg-white/92 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050608]"
                  >
                    {text(loc, tier.cta)}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <p className="mx-auto mt-5 max-w-lg text-center text-[13px] font-semibold leading-snug text-cyan-200/75">
          {text(loc, COACHING_PACKAGES_PAGE.whatNext)}
        </p>
        <p className="mx-auto mt-4 max-w-lg text-center text-[12px] font-medium leading-snug text-white/45">
          {text(loc, COACHING_PACKAGES_PAGE.footerNote)}
        </p>
      </section>

      <section
        className="border-t border-white/[0.06] bg-black/20 px-4 py-10 sm:px-5"
        aria-labelledby="offer-detail-heading"
      >
        <div className="mx-auto max-w-lg">
          <h2
            id="offer-detail-heading"
            className="text-[1.25rem] font-bold tracking-[-0.03em] text-white"
          >
            {text(loc, COACHING_OFFER_DETAIL.title)}
          </h2>
          <p className="mt-3 text-[15px] font-medium leading-relaxed text-white/70">
            {text(loc, COACHING_OFFER_DETAIL.lead)}
          </p>
          <ul className="mt-6 space-y-3">
            {COACHING_OFFER_DETAIL.bullets.map((b, i) => (
              <Bullet key={i}>{text(loc, b)}</Bullet>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="px-4 py-10 sm:px-5"
        aria-labelledby="ecosystem-heading"
      >
        <div className="mx-auto max-w-lg">
          <h2
            id="ecosystem-heading"
            className="text-[1.25rem] font-bold tracking-[-0.03em] text-white"
          >
            {text(loc, COACHING_ECOSYSTEM.title)}
          </h2>
          <p className="mt-3 text-[15px] font-medium leading-relaxed text-white/65">
            {text(loc, COACHING_ECOSYSTEM.intro)}
          </p>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {COACHING_ECOSYSTEM.pillars.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-4"
              >
                <h3 className="text-[15px] font-bold text-white">
                  {text(loc, p.title)}
                </h3>
                <p className="mt-2 text-[13px] font-medium leading-snug text-white/58">
                  {text(loc, p.line)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
