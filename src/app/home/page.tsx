import type { Metadata } from "next";
import { AnalyticsRouteBeacon } from "@/components/AnalyticsRouteBeacon";
import { SystemSalesLanding } from "@/components/marketing/SystemSalesLanding";
import { SiteHeader } from "@/components/SiteHeader";
import { APP_SHORT_NAME } from "@/config/appInfo";
import { LocaleProvider } from "@/hooks/useTranslation";

export const metadata: Metadata = {
  title: `${APP_SHORT_NAME} — Järjestelmä, ei arvailua`,
  description:
    "Treeni, ruoka ja seuranta samassa järjestelmässä. Tiedät mitä tehdä tänään — ilman ihmisvalmentajan kuukausimaksua.",
  openGraph: {
    title: `${APP_SHORT_NAME} — Järjestelmä, ei arvailua`,
    description:
      "Päivittäinen suunnitelma valmiina. Selkeä linja — ei pelkkä lista.",
  },
};

export default function MarketingHomePage() {
  return (
    <LocaleProvider>
      <AnalyticsRouteBeacon event="open_home" />
      <SiteHeader />
      <SystemSalesLanding />
      <footer className="border-t border-white/[0.06] bg-[#05060a] py-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-[11px] text-zinc-600">
        {APP_SHORT_NAME}
      </footer>
    </LocaleProvider>
  );
}
