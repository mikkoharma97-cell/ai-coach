"use client";

import { AnalyticsSession } from "@/components/AnalyticsSession";
import { DemoModeLoader } from "@/components/DemoModeLoader";
import { AppShell } from "@/components/app/AppShell";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { LocaleProvider } from "@/hooks/useTranslation";
import type { ReactNode } from "react";

export default function CoachLayout({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <SubscriptionGate>
        <AnalyticsSession />
        <DemoModeLoader />
        <div className="flex min-h-dvh w-full flex-col items-center md:min-h-[100dvh] md:justify-center md:py-8">
          <div className="app-device-frame w-full max-md:max-w-none">
            <div className="app-device-screen">
              <AppShell>{children}</AppShell>
            </div>
          </div>
        </div>
      </SubscriptionGate>
    </LocaleProvider>
  );
}
