"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { ensureTrialStarted, hasSubscriptionAccess } from "@/lib/subscription";
import { loadProfile } from "@/lib/storage";
import { flowLog } from "@/lib/flowLog";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

/** Sallittu ilman tallennettua profiilia (asetukset / tyhjä profiilisivu). */
const EXEMPT_NO_PROFILE = new Set([
  "/settings",
  "/preferences",
  "/profile",
  "/scan",
]);

/**
 * After trial, coach routes require subscription (unlock on paywall).
 * Settings stays reachable to change language, open paywall, or clear data.
 */
export function SubscriptionGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const failsafe = window.setTimeout(() => {
      setReady(true);
    }, 1800);

    try {
      const profile = loadProfile();
      if (!profile) {
        if (!EXEMPT_NO_PROFILE.has(path)) {
          router.replace("/start");
        }
      } else {
        ensureTrialStarted();
        if (
          path !== "/settings" &&
          path !== "/preferences" &&
          path !== "/profile" &&
          path !== "/scan" &&
          !hasSubscriptionAccess()
        ) {
          router.replace("/paywall");
        }
      }
      setReady(true);
      flowLog("gate.ready", path);
    } catch (e) {
      console.error(e);
      setReady(true);
      flowLog("gate.ready", path);
    }

    return () => clearTimeout(failsafe);
  }, [router, path]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-[15px] text-muted-2">
        {t("common.loading")}
      </div>
    );
  }

  return <>{children}</>;
}
