"use client";

import { HeroFocusCard } from "@/components/landing/HeroFocusCard";

type Props = {
  /** @deprecated Uusi kortti on aina tumma — arvoa ei käytetä. */
  context?: "default" | "darkHero";
};

/** @deprecated Käytä suoraan `HeroFocusCard`. Säilytetään import-yhteensopivuus. */
export function HeroTodayLiving(_props: Props) {
  return <HeroFocusCard />;
}
