import type { Metadata } from "next";
import { AnalyticsRouteBeacon } from "@/components/AnalyticsRouteBeacon";
import { HeroSection } from "@/components/HeroSection";
import { SiteHeader } from "@/components/SiteHeader";
import { BuildMarkerLine } from "@/components/build/BuildMarkerLine";
import { LocaleProvider } from "@/hooks/useTranslation";

export const metadata: Metadata = {
  title: "Coach — Tämä ei ole treenisovellus",
  description:
    "Valmennus, joka mukautuu sinuun. Perustuu oikeaan treeni- ja ravintologikkaan.",
  openGraph: {
    title: "Coach — Tämä ei ole treenisovellus",
    description:
      "Valmennus, joka mukautuu sinuun. Ei geneerisiä ohjelmia.",
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
        Coach
      </footer>
    </LocaleProvider>
  );
}
