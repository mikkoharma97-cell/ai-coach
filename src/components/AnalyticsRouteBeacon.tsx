"use client";

import { trackEvent, type AnalyticsEventName } from "@/lib/analytics";
import { useEffect } from "react";

/** Yksi kerta / mount — kevyt sivunäkymän lokitus (ei ulkoista palvelua). */
export function AnalyticsRouteBeacon({ event }: { event: AnalyticsEventName }) {
  useEffect(() => {
    trackEvent(event);
  }, [event]);
  return null;
}
