import type { Metadata } from "next";
import { AnalyticsRouteBeacon } from "@/components/AnalyticsRouteBeacon";
import { CompareContent } from "@/components/landing/CompareContent";
import { SiteHeader } from "@/components/SiteHeader";
import { BuildMarkerLine } from "@/components/build/BuildMarkerLine";
import { LocaleProvider } from "@/hooks/useTranslation";

export const metadata: Metadata = {
  title: "Coach — Ihmisen valmennus vs tämä",
  description:
    "Mitä henkilökohtainen valmennus tekee, mitä sovellus tekee, ja mihin tämä perustuu.",
  openGraph: {
    title: "Coach — Vertailu",
    description: "Valmennus, päivittäinen ohjaus, ei arvailua.",
  },
};

export default function ComparePage() {
  return (
    <LocaleProvider>
      <AnalyticsRouteBeacon event="open_compare" />
      <SiteHeader />
      <CompareContent />
      <div className="flex justify-center border-t border-white/[0.06] bg-[var(--background)] px-4 py-3">
        <BuildMarkerLine compact className="text-center" />
      </div>
      <footer className="border-t border-white/[0.06] bg-[#05060a] py-6 text-center text-[11px] text-zinc-600">
        Coach
      </footer>
    </LocaleProvider>
  );
}
