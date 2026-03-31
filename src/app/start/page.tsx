import { AnalyticsRouteBeacon } from "@/components/AnalyticsRouteBeacon";
import { LocaleProvider } from "@/hooks/useTranslation";
import { Suspense } from "react";
import { StartFlow } from "./StartFlow";

function StartFallback() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background">
      <div
        className="size-9 animate-pulse rounded-2xl bg-accent/25"
        aria-hidden
      />
      <p className="text-[12px] font-medium text-muted-2">Loading</p>
    </div>
  );
}

export default function StartPage() {
  return (
    <LocaleProvider>
      <AnalyticsRouteBeacon event="open_start" />
      <Suspense fallback={<StartFallback />}>
        <StartFlow />
      </Suspense>
    </LocaleProvider>
  );
}
