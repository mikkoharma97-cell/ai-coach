import type { Metadata } from "next";
import { AnalyticsRouteBeacon } from "@/components/AnalyticsRouteBeacon";
import { HeroSection } from "@/components/HeroSection";
import { SiteHeader } from "@/components/SiteHeader";
import { FinalCta } from "@/components/landing/FinalCta";
import { LandingAudienceSection } from "@/components/landing/LandingAudienceSection";
import { LandingProductStrip } from "@/components/landing/LandingProductStrip";
import { LandingFeatureFlow } from "@/components/landing/LandingFeatureFlow";
import { LandingFoundationSection } from "@/components/landing/LandingFoundationSection";
import { LandingPricingPreview } from "@/components/landing/LandingPricingPreview";
import { LandingSalesStrip } from "@/components/landing/LandingSalesStrip";
import { LandingWhenLifeHappens } from "@/components/landing/LandingWhenLifeHappens";
import { LandingYouSeeIt } from "@/components/landing/LandingYouSeeIt";
import { LandingOpenKnowWhatToDo } from "@/components/landing/LandingOpenKnowWhatToDo";
import { LandingComingNext } from "@/components/landing/LandingComingNext";
import { LandingFreeTrialSection } from "@/components/landing/LandingFreeTrialSection";
import { LandingGuidanceNotProgram } from "@/components/landing/LandingGuidanceNotProgram";
import { LandingSystemAngle } from "@/components/landing/LandingSystemAngle";
import { BuildMarkerLine } from "@/components/build/BuildMarkerLine";
import { LocaleProvider } from "@/hooks/useTranslation";

export const metadata: Metadata = {
  title: "Coach — Ohjaus, ei seurantaa",
  description:
    "Treeni, ruoka ja rytmi rakennetaan puolestasi joka päivä. Ei seurantaa — ohjausta.",
  openGraph: {
    title: "Coach — Ohjaus, ei seurantaa",
    description:
      "Treeni, ruoka ja rytmi rakennetaan puolestasi joka päivä. Arki mukana.",
  },
};

export default function MarketingHomePage() {
  return (
    <LocaleProvider>
      <AnalyticsRouteBeacon event="open_home" />
      <SiteHeader />
      <HeroSection />
      <div className="border-b border-white/[0.06] bg-[var(--background)] px-4 pb-8 pt-2">
        <BuildMarkerLine />
      </div>
      <LandingOpenKnowWhatToDo />
      <LandingGuidanceNotProgram />
      <LandingSystemAngle />
      <LandingWhenLifeHappens />
      <LandingYouSeeIt />
      <LandingFeatureFlow />
      <LandingSalesStrip />
      <LandingProductStrip />
      <LandingAudienceSection />
      <LandingFoundationSection />
      <LandingPricingPreview />
      <LandingFreeTrialSection />
      <LandingComingNext />
      <FinalCta />
      <footer className="border-t border-white/[0.06] bg-[#05060a] py-16 text-center text-[12px] text-zinc-600">
        Coach
      </footer>
    </LocaleProvider>
  );
}
