"use client";

import { TodayView } from "@/components/today/TodayView";

/** Direct import — avoids dynamic chunk failures on slow/tunnel networks (stuck “Loading…”). */
export function AppPageClient() {
  return <TodayView />;
}
