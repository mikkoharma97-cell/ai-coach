import type { Metadata } from "next";
import { AnalyticsRouteBeacon } from "@/components/AnalyticsRouteBeacon";
import { HeroSection } from "@/components/HeroSection";
import { SiteHeader } from "@/components/SiteHeader";
import { BuildMarkerLine } from "@/components/build/BuildMarkerLine";
import { APP_SHORT_NAME } from "@/config/appInfo";
import { LocaleProvider } from "@/hooks/useTranslation";

export const metadata: Metadata = {
  title: `${APP_SHORT_NAME} — Valmennus`,
  description:
    "Yksi suunnitelma. Päivä kerrallaan. Treeni ja ruoka samassa linjassa.",
    openGraph: {
    title: `${APP_SHORT_NAME} — Valmennus`,
    description:
      "Yksi suunnitelma. Päivä kerrallaan. Ei arpomista.",
  },
};

export default function MarketingHomePage() {
  return (
    <LocaleProvider>
      <AnalyticsRouteBeacon event="open_home" />
      <SiteHeader />
      <HeroSection />
      <div className="flex justify-center border-b border-white/[0.06] bg-[var(--background)] px-4 py-2">
        <BuildMarkerLine compact className="text-center" />
      </div>
      <footer className="border-t border-white/[0.06] bg-[#05060a] py-6 text-center text-[11px] text-zinc-600">
        {APP_SHORT_NAME}
      </footer>
    </LocaleProvider>
  );
}
