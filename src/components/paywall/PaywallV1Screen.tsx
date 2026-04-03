"use client";

import { PaywallV1Panel } from "@/components/paywall/PaywallV1Panel";
import { canAccessPremium } from "@/lib/paywallPolicy";
import { ensureTrialStarted, setSubscribed } from "@/lib/subscription";
import { loadProfile, setPaywallV1Ack } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function PaywallV1Screen() {
  const router = useRouter();
  const paywallOpenTracked = useRef(false);

  useEffect(() => {
    if (loadProfile()) ensureTrialStarted();
    if (canAccessPremium()) {
      router.replace("/app");
      return;
    }
    if (!paywallOpenTracked.current) {
      paywallOpenTracked.current = true;
      trackEvent("paywall_open", { reason: "trial_expired" });
    }
  }, [router]);

  const onContinue = () => {
    trackEvent("paywall_convert");
    setSubscribed(true);
    setPaywallV1Ack();
    router.push("/app");
  };

  const onBack = () => {
    router.push("/app");
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-card/40 via-background to-background px-4 py-6 sm:py-10">
      <PaywallV1Panel onContinue={onContinue} onBack={onBack} />
    </main>
  );
}
