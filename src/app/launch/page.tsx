import type { Metadata } from "next";
import { AnalyticsRouteBeacon } from "@/components/AnalyticsRouteBeacon";
import { LaunchHeroPage } from "@/components/launch/LaunchHeroPage";
import { LocaleProvider } from "@/hooks/useTranslation";

export const metadata: Metadata = {
  title: "Coach — Aloita",
  description:
    "Tämä ei seuraa sinua. Tämä ohjaa sinua. Treeni, ruoka, rytmi — yksi ohjaus.",
  openGraph: {
    title: "Coach — Aloita",
    description: "Treeni · ruoka · rytmi. Yksi ohjaus joka päivä.",
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
