"use client";

/**
 * App-kuori — bottom nav (HÄRMÄ50): Tänään · Ruoka · Kehitys · Lisää (+ Treeni /app:sta ja /workout-linkinä).
 * Food Only -tilassa sama nelikko (treeni ei näy erillisenä välilehtenä).
 */
import { PreviewBuildStrip } from "@/components/PreviewBuildStrip";
import { useTranslation } from "@/hooks/useTranslation";
import { loadProfile, saveProfile } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import type { MessageKey } from "@/lib/i18n";
import type { AnalyticsEventName } from "@/lib/analytics";

const PATH_ANALYTICS: Partial<Record<string, AnalyticsEventName>> = {
  "/app": "open_app",
  "/food": "open_food",
  "/workout": "open_workout",
  "/progress": "open_progress",
  "/more": "open_more",
  "/review": "open_review",
  "/adjustments": "open_adjustments",
  "/paywall": "open_paywall",
  "/subscribe": "open_paywall",
};

const MORE_SUB_PATHS = new Set([
  "/more",
  "/review",
  "/adjustments",
  "/settings",
  "/preferences",
  "/plans",
  "/nutrition-plans",
  "/food-library",
  "/packages",
  "/profile",
  "/plan",
  "/pro",
  "/scan",
  "/paywall",
  "/subscribe",
  "/premium",
]);

function headerTitleKey(path: string): MessageKey {
  if (MORE_SUB_PATHS.has(path)) return "nav.more";
  if (path === "/pro") return "nav.pro";
  if (path === "/progress") return "nav.progress";
  if (path === "/settings") return "nav.settings";
  if (path === "/preferences" || path === "/profile") return "ui.preferences";
  if (path === "/plans") return "plans.title";
  if (path === "/packages") return "packages.title";
  if (path === "/nutrition-plans") return "nutritionPlans.title";
  if (path === "/food-library") return "foodLibrary.pageTitle";
  if (path === "/food/day") return "foodFlowV1.pageTitle";
  if (path === "/scan") return "nav.scan";
  if (path === "/workout") return "ui.workout";
  if (path === "/plan") return "ui.plan";
  if (path === "/subscribe" || path === "/paywall") return "paywall.title";
  if (path === "/app") return "ui.today";
  if (path === "/food") return "nav.food";
  return "nav.today";
}

function isNavActive(path: string, href: string): boolean {
  if (path === href) return true;
  /** Ruoka-välilehti: päivän ruoka + skannaus + kirjasto — ei ruokavalion vaihto (Lisää). */
  if (
    href === "/food" &&
    (path === "/scan" || path === "/food-library" || path === "/food/day")
  ) {
    return true;
  }
  if (href === "/more" && MORE_SUB_PATHS.has(path)) return true;
  return false;
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { t, locale, setLocale } = useTranslation();
  const titleKey = headerTitleKey(path);
  /** Neljä päävälilehteä — treeni ei kilpaile pohjassa (linkki Tänään + /workout). */
  const routeKeys = [
    { href: "/app", key: "ui.today" as const },
    { href: "/food", key: "nav.food" as const },
    { href: "/progress", key: "nav.progress" as const },
    { href: "/more", key: "nav.more" as const },
  ] as const;

  useEffect(() => {
    const ev = PATH_ANALYTICS[path];
    if (ev) trackEvent(ev);
  }, [path]);

  const navGrid = "grid-cols-4 min-[480px]:max-w-md";

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 max-w-full flex-1 flex-col">
      <header className="sticky top-0 z-[var(--z-nav)] w-full shrink-0 border-b border-white/[0.06] bg-[rgba(5,6,10,0.82)] pt-[env(safe-area-inset-top,0px)] backdrop-blur-[18px] supports-[backdrop-filter]:bg-[rgba(5,6,10,0.78)]">
        <div className="mx-auto grid h-11 w-full max-w-[100vw] grid-cols-[1fr_auto_1fr] items-center gap-2 px-4">
          <Link
            href="/app"
            className="justify-self-start min-h-[44px] min-w-[44px] py-2 text-[13px] font-semibold leading-none tracking-[-0.02em] text-[color:var(--foreground)]"
          >
            {t("nav.brand")}
          </Link>
          <span className="max-w-[min(100%,9rem)] text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-muted truncate min-[400px]:max-w-[10rem] min-[480px]:text-[10px] min-[480px]:tracking-[0.18em] sm:max-w-none">
            {t(titleKey)}
          </span>
          <div className="justify-self-end flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (typeof window === "undefined") return;
                const u = `${window.location.origin}${path}${window.location.search || ""}${window.location.hash || ""}`;
                window.open(u, "_blank", "noopener,noreferrer");
              }}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-muted-2 transition hover:border-accent/35 hover:text-foreground active:scale-[0.98]"
              title={t("nav.openNewTabTitle")}
              aria-label={t("nav.openNewTabAria")}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path
                  d="M14 3h7v7M10 14L21 3M21 14v6a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <label className="sr-only" htmlFor="coach-locale">
              Language
            </label>
            <select
              id="coach-locale"
              value={locale}
              onChange={(e) => {
                const l = e.target.value as Locale;
                setLocale(l);
                const p = loadProfile();
                if (p) saveProfile({ ...p, uiLocale: l });
              }}
              className="rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-1 text-[10px] font-medium text-foreground transition duration-[250ms] ease-in-out"
            >
              <option value="fi">FI</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
      </header>
      <div className="coach-header-presence" aria-hidden />

      <div className="app-main-scroll flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        {children}
      </div>

      <PreviewBuildStrip />

      <nav
        className="relative z-[var(--z-nav)] shrink-0 border-t border-white/[0.06] bg-[rgba(5,6,10,0.88)] pb-[calc(12px+env(safe-area-inset-bottom,0px))] pt-1.5 shadow-[0_-8px_32px_rgb(0_0_0/0.4)] backdrop-blur-[18px] supports-[backdrop-filter]:bg-[rgba(5,6,10,0.82)] transition duration-[250ms] ease-in-out"
        aria-label="Primary"
      >
        <div
          className={`mx-auto grid w-full max-w-full min-w-0 items-stretch justify-between gap-0 px-1 ${navGrid} min-[480px]:px-2`}
        >
          {routeKeys.map((r) => {
            const on = isNavActive(path, r.href);
            return (
              <Link
                key={r.href}
                href={r.href}
                aria-current={on ? "page" : undefined}
                className={`touch-manipulation flex min-h-[54px] min-w-0 flex-col items-center justify-center rounded-[14px] px-0.5 py-2 text-[9px] font-semibold leading-tight tracking-[-0.02em] transition duration-200 ease-out will-change-transform min-[400px]:text-[10px] min-[480px]:min-h-[52px] sm:px-1 sm:text-[11px] motion-reduce:transition-none min-[480px]:hover:scale-[1.04] active:scale-[0.96] ${
                  on
                    ? "bg-accent-soft/90 text-primary"
                    : "text-muted-2 hover:bg-white/[0.06] hover:text-foreground active:bg-white/[0.08]"
                }`}
              >
                <span className="max-w-full text-center">{t(r.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
