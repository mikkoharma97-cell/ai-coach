import type { Metadata } from "next";
import { AnalyticsRouteBeacon } from "@/components/AnalyticsRouteBeacon";
import { DemoPreviewPage } from "@/components/demo/DemoPreviewPage";
import { LocaleProvider } from "@/hooks/useTranslation";

export const metadata: Metadata = {
  title: "Coach — Demo alle 2 min",
  description:
    "Myyntipuhe ja demo-polku: Today, treeni, ruoka, kehitys. Interaktiivinen demo yhdellä napilla.",
  openGraph: {
    title: "Coach — Demo alle 2 min",
    description: "Myyntipuhe + esikatselu samalla sivulla.",
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
