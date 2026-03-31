"use client";

/**
 * App-kuori — ulkoasu / nav / teema
 * Parannus: aktiivisen tabin ikoni + teksti (pelkkä teksti = geneerinen mobiiliweb).
 * Parannus: kielivalitsin voisi olla asetuksissa vain → vähemmän melua headerissa.
 * Parannus: max-w-lg bottom navissa — jos tabletti landscape, keskitys tai full-width harkintaa.
 */
// Temporary version marker — remove import + usage when no longer needed (see HarmavVersionBadge.tsx)
import { HarmavVersionBadge } from "@/components/app/HarmavVersionBadge";
import { PreviewBuildStrip } from "@/components/PreviewBuildStrip";
import { useTranslation } from "@/hooks/useTranslation";
import type { Locale } from "@/lib/i18n";
import { loadProfile, saveProfile } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
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
  "/review": "open_review",
  "/adjustments": "open_adjustments",
  "/paywall": "open_paywall",
  "/subscribe": "open_paywall",
};

const routeKeys = [
  { href: "/app", key: "ui.today" as const },
  { href: "/food", key: "ui.food" as const },
  { href: "/progress", key: "nav.progress" as const },
  { href: "/review", key: "nav.review" as const },
  { href: "/adjustments", key: "nav.adjustments" as const },
];

function headerTitleKey(path: string): MessageKey {
  if (path === "/review") return "nav.review";
  if (path === "/adjustments") return "nav.adjustments";
  if (path === "/pro") return "nav.pro";
  if (path === "/progress") return "nav.progress";
  if (path === "/settings") return "nav.settings";
  if (path === "/preferences" || path === "/profile") return "ui.preferences";
  if (path === "/scan") return "nav.scan";
  if (path === "/workout") return "ui.workout";
  if (path === "/plan") return "ui.plan";
  if (path === "/subscribe" || path === "/paywall") return "paywall.title";
  const hit = routeKeys.find((r) => r.href === path);
  return hit?.key ?? "nav.today";
}

function isNavActive(path: string, href: string): boolean {
  if (path === href) return true;
  if (href === "/food" && path === "/scan") return true;
  if (href === "/app" && path === "/workout") return true;
  return false;
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { t, locale, setLocale } = useTranslation();
  const titleKey = headerTitleKey(path);

  useEffect(() => {
    const ev = PATH_ANALYTICS[path];
    if (ev) trackEvent(ev);
  }, [path]);

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 max-w-full flex-1 flex-col">
      <header className="sticky top-0 z-[40] w-full shrink-0 border-b border-white/[0.06] bg-[rgba(5,6,10,0.82)] pt-[env(safe-area-inset-top,0px)] backdrop-blur-[18px] supports-[backdrop-filter]:bg-[rgba(5,6,10,0.78)]">
        <div className="mx-auto grid h-11 w-full max-w-[100vw] grid-cols-[1fr_auto_1fr] items-center gap-2 px-4">
          <Link
            href="/app"
            className="justify-self-start min-h-[44px] min-w-[44px] py-2 text-[13px] font-semibold leading-none tracking-[-0.02em] text-[color:var(--foreground)]"
          >
            {t("nav.brand")}
          </Link>
          <span className="max-w-[min(100%,9rem)] min-[400px]:max-w-[10rem] text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-muted truncate min-[480px]:text-[10px] min-[480px]:tracking-[0.18em] sm:max-w-none">
            {t(titleKey)}
          </span>
          <div className="justify-self-end flex max-w-[min(100%,15rem)] min-[400px]:max-w-[18rem] flex-wrap items-center justify-end gap-x-1 gap-y-1 min-[480px]:gap-x-2 sm:max-w-none">
            <Link
              href="/preferences"
              className="min-h-[36px] rounded-md px-1.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-2 transition hover:text-foreground"
            >
              {t("ui.preferences")}
            </Link>
            <Link
              href="/settings"
              className="min-h-[36px] min-w-[36px] rounded-md px-1.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-2 transition hover:text-foreground"
            >
              {t("nav.settings")}
            </Link>
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
            <HarmavVersionBadge />
          </div>
        </div>
      </header>
      <div className="coach-header-presence" aria-hidden />

      <div className="app-main-scroll flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        {children}
      </div>

      <PreviewBuildStrip />

      <nav
        className="relative z-[30] shrink-0 border-t border-white/[0.06] bg-[rgba(5,6,10,0.88)] pb-[calc(12px+env(safe-area-inset-bottom,0px))] pt-1.5 shadow-[0_-8px_32px_rgb(0_0_0/0.4)] backdrop-blur-[18px] supports-[backdrop-filter]:bg-[rgba(5,6,10,0.82)] transition duration-[250ms] ease-in-out"
        aria-label="Primary"
      >
        <div className="mx-auto flex w-full max-w-full min-w-0 items-stretch justify-between gap-0 px-1 min-[480px]:max-w-lg min-[480px]:px-2">
          {routeKeys.map((r) => {
            const on = isNavActive(path, r.href);
            return (
              <Link
                key={r.href}
                href={r.href}
                aria-current={on ? "page" : undefined}
                className={`touch-manipulation flex min-h-[54px] min-w-0 flex-1 flex-col items-center justify-center rounded-[14px] px-0.5 py-2 text-[9px] font-semibold leading-tight tracking-[-0.02em] transition duration-200 ease-out will-change-transform min-[400px]:text-[10px] min-[480px]:min-h-[52px] sm:px-1 sm:text-[11px] motion-reduce:transition-none min-[480px]:hover:scale-[1.04] active:scale-[0.96] ${
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
