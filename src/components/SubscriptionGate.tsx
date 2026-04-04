"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { coachRouteAllowsNoProfile } from "@/lib/coachNoProfileRoutePolicy";
import { shouldRedirectToPaywall } from "@/lib/paywallPolicy";
import { ensureTrialStarted } from "@/lib/subscription";
import { loadProfile } from "@/lib/storage";
import { flowLog } from "@/lib/flowLog";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

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
        if (!coachRouteAllowsNoProfile(path)) {
          router.replace("/start");
          flowLog("gate.redirectNoProfile", path);
          clearTimeout(failsafe);
          setReady(true);
          return () => {};
        }
      } else {
        ensureTrialStarted();
        if (!coachRouteAllowsNoProfile(path) && shouldRedirectToPaywall()) {
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
