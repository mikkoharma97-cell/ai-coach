import type { Metadata } from "next";
import { AnalyticsRouteBeacon } from "@/components/AnalyticsRouteBeacon";
import { CompareContent } from "@/components/landing/CompareContent";
import { SiteHeader } from "@/components/SiteHeader";
import { LocaleProvider } from "@/hooks/useTranslation";

export const metadata: Metadata = {
  title: "Coach — App vs ihmisvalmennus vs AI Coach",
  description:
    "Mitä saat treeniappiin, kalliiseen valmennukseen ja tähän — päivittäinen linja ilman 150 € / kk tapaamisia.",
  openGraph: {
    title: "Coach — Vertailu",
    description: "Hyötylähtöinen vertailu: kuka pitää päivittäisen suunnan kasassa.",
  },
};

export default function ComparePage() {
  return (
    <LocaleProvider>
      <AnalyticsRouteBeacon event="open_compare" />
      <SiteHeader />
      <CompareContent />
      <footer className="border-t border-white/[0.06] bg-[#05060a] py-6 text-center text-[11px] text-zinc-600">
        Coach
      </footer>
    </LocaleProvider>
  );
}
