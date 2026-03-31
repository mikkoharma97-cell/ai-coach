import type { Metadata } from "next";
import { AnalyticsRouteBeacon } from "@/components/AnalyticsRouteBeacon";
import { DemoPreviewPage } from "@/components/demo/DemoPreviewPage";
import { LocaleProvider } from "@/hooks/useTranslation";

export const metadata: Metadata = {
  title: "Coach — Esikatselu",
  description:
    "Näe Tänään-rakenne, treeni ja ruoka ennen maksua. Interaktiivinen demo saatavilla.",
  openGraph: {
    title: "Coach — Esikatselu",
    description: "Staattinen esikatselu ja demo-linkki.",
  },
};

export default function DemoMarketingPage() {
  return (
    <LocaleProvider>
      <AnalyticsRouteBeacon event="open_demo" />
      <DemoPreviewPage />
    </LocaleProvider>
  );
}
