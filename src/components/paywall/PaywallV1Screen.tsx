"use client";

import { PaywallV1Panel } from "@/components/paywall/PaywallV1Panel";
import { getPaywallTruth } from "@/lib/paywallPolicy";
import {
  ensureTrialStarted,
  getUserSubscriptionState,
  setSubscribed,
  type UserSubscriptionState,
} from "@/lib/subscription";
import { loadProfile, setPaywallV1Ack } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import { navigateAfterPaywallConvert } from "@/lib/coachNavigation";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function PaywallV1Screen() {
  const router = useRouter();
  const paywallOpenTracked = useRef(false);
  const [devSubState, setDevSubState] = useState<UserSubscriptionState>("NO_PROFILE");
  const showDevStatus = process.env.NEXT_PUBLIC_COACH_DEV_TOOLS === "1";

  useEffect(() => {
    const profile = loadProfile();
    if (!profile) {
      router.replace("/start");
      return;
    }
    ensureTrialStarted();
    setDevSubState(getUserSubscriptionState());
    const { hasAccess, paywallReason } = getPaywallTruth();
    if (hasAccess) {
      router.replace("/app");
      return;
    }
    if (!paywallOpenTracked.current) {
      paywallOpenTracked.current = true;
      trackEvent("paywall_open", { reason: paywallReason });
    }
  }, [router]);

  const onContinue = () => {
    trackEvent("paywall_convert");
    setSubscribed(true);
    setPaywallV1Ack();
    navigateAfterPaywallConvert();
  };

  const onBack = () => {
    /** Ei `/app` — gate vie trial-lopun jälkeen takaisin paywalliin. Asetukset sallittu. */
    router.push("/settings");
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-card/40 via-background to-background px-4 py-6 sm:py-10">
      {showDevStatus ? (
        <p className="mb-3 rounded-md border border-cyan-500/30 bg-cyan-950/35 px-3 py-2 text-center font-mono text-[10px] text-cyan-100/90">
          STATE: {devSubState} · billing: mock/local only
        </p>
      ) : null}
      <PaywallV1Panel onContinue={onContinue} onBack={onBack} />
    </main>
  );
}
