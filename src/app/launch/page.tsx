import type { Metadata } from "next";
import { AnalyticsRouteBeacon } from "@/components/AnalyticsRouteBeacon";
import { LaunchHeroPage } from "@/components/launch/LaunchHeroPage";
import { LocaleProvider } from "@/hooks/useTranslation";

export const metadata: Metadata = {
  title: "Coach — Aloita tänään",
  description:
    "Et tiedä mitä tehdä — tämä kertoo. Päivä ei odota. Treeni, ruoka, rytmi.",
  openGraph: {
    title: "Coach — Aloita tänään",
    description: "Et tiedä mitä tehdä. Tämä kertoo. Aloita tänään.",
  },
};

export default function LaunchPage() {
  return (
    <LocaleProvider>
      <AnalyticsRouteBeacon event="open_launch" />
      <LaunchHeroPage />
    </LocaleProvider>
  );
}
