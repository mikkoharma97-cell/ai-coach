"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  minimal?: boolean;
};

export function SiteHeader({ minimal }: Props) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[rgba(5,6,10,0.82)] pt-[env(safe-area-inset-top,0px)] backdrop-blur-[18px] supports-[backdrop-filter]:bg-[rgba(5,6,10,0.78)] transition duration-[250ms] ease-in-out">
      <Container>
        <div className="flex min-h-[44px] items-center justify-between gap-4 py-3 sm:py-3.5">
          <Link
            href="/home"
            className="text-[13px] font-semibold leading-none tracking-[-0.02em] text-[color:var(--foreground)]"
          >
            Coach
          </Link>
          {!minimal ? (
            <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-[13px] font-medium text-muted sm:gap-x-6">
              <Link
                href="/compare"
                className="min-h-[44px] py-2 transition hover:text-[color:var(--foreground)]"
              >
                {t("nav.compareWhy")}
              </Link>
              <Link
                href="/start"
                className="min-h-[44px] py-2 transition hover:text-[color:var(--foreground)]"
              >
                Start
              </Link>
              <Link
                href="/app"
                className="min-h-[44px] py-2 transition hover:text-[color:var(--foreground)]"
              >
                {t("nav.today")}
              </Link>
            </nav>
          ) : (
            <Link
              href="/home"
              className="text-[13px] font-medium text-muted transition hover:text-[color:var(--foreground)]"
            >
              Home
            </Link>
          )}
        </div>
      </Container>
    </header>
  );
}
