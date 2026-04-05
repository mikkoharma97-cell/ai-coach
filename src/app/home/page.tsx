import type { Metadata } from "next";
import { AnalyticsRouteBeacon } from "@/components/AnalyticsRouteBeacon";
import { HeroSection } from "@/components/HeroSection";
import { SiteHeader } from "@/components/SiteHeader";
import { APP_SHORT_NAME } from "@/config/appInfo";
import { LocaleProvider } from "@/hooks/useTranslation";

export const metadata: Metadata = {
  title: `${APP_SHORT_NAME} — Päivittäinen valmennus`,
  description:
    "Valmennus appissa: treeni, ruoka ja seuranta samassa rytmissä. Selkeä päivä ilman arvailua.",
    openGraph: {
    title: `${APP_SHORT_NAME} — Päivittäinen valmennus`,
    description:
      "Henkilökohtainen linja — ei pelkkä treenilista.",
  },
};

export default function MarketingHomePage() {
  return (
    <LocaleProvider>
      <AnalyticsRouteBeacon event="open_home" />
      <SiteHeader />
      <HeroSection />
      <footer className="border-t border-white/[0.06] bg-[#05060a] py-6 text-center text-[11px] text-zinc-600">
        {APP_SHORT_NAME}
      </footer>
    </LocaleProvider>
  );
}
