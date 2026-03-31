"use client";

import {
  LOCALE_STORAGE_KEY,
  translate,
  type Locale,
  type MessageKey,
} from "@/lib/i18n";
import { PROFILE_KEY_V3 } from "@/lib/storage";
import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * PWA: näytä asennuskehotus kun selain tarjoaa beforeinstallprompt.
 * iOS Safari: ei API:tä — ei näytetä (ei häiritsevä fallback-banneria).
 */
function t(locale: Locale, key: MessageKey) {
  return translate(locale, key);
}

export function PwaInstallPrompt() {
  const [locale, setLocale] = useState<Locale>("fi");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (raw === "en" || raw === "fi") {
        setLocale(raw);
        return;
      }
      const pr = localStorage.getItem(PROFILE_KEY_V3);
      if (pr) {
        const p = JSON.parse(pr) as { uiLocale?: string };
        if (p.uiLocale === "en" || p.uiLocale === "fi") setLocale(p.uiLocale);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("pwa_install_dismissed") === "1") {
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const onInstall = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => undefined);
    setDeferred(null);
  }, [deferred]);

  const onDismiss = useCallback(() => {
    setDismissed(true);
    try {
      sessionStorage.setItem("pwa_install_dismissed", "1");
    } catch {
      /* ignore */
    }
  }, []);

  if (dismissed || !deferred) return null;

  /** Yläpuolelle bottom navista (AppShell ~4.5rem + safe area) — ei blokkaa tabeja */
  return (
    <div
      className="fixed left-0 right-0 z-[100] flex justify-center p-3 pb-[max(12px,env(safe-area-inset-bottom))] pointer-events-none bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))]"
      role="status"
    >
      <div className="pointer-events-auto flex max-w-md flex-col gap-2 rounded-[var(--radius-xl)] border border-white/[0.12] bg-[rgba(5,6,10,0.94)] px-4 py-3 shadow-[var(--shadow-float)] backdrop-blur-md">
        <p className="text-[13px] font-medium leading-snug text-foreground">
          {t(locale, "pwa.installPrompt")}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onInstall}
            className="min-h-[44px] flex-1 rounded-[var(--radius-lg)] bg-accent px-4 text-[14px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-ring"
          >
            {t(locale, "pwa.installCta")}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="min-h-[44px] rounded-[var(--radius-lg)] border border-white/10 px-4 text-[13px] font-medium text-muted-2 transition hover:text-foreground"
          >
            {t(locale, "pwa.installDismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
