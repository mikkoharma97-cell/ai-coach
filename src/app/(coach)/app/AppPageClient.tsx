"use client";

import { AppDashboard } from "./AppDashboard";

/** Direct import — avoids dynamic chunk failures on slow/tunnel networks (stuck “Loading…”). */
export function AppPageClient() {
  return <AppDashboard />;
}
