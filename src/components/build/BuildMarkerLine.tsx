"use client";

/** `GlobalBuildMarker` on no-op — build-tiedot: `CoachHeaderDevTools` (AppShell). */
export { buildMarkerVisible } from "@/lib/buildInfo";
export { GlobalBuildMarker } from "./BuildMarker";

type Props = {
  className?: string;
  compact?: boolean;
};

/** Legacy footer-strip — ei käytössä (ei duplikaattia kelluvaan merkkiin). */
export function BuildMarkerLine(_props: Props = {}) {
  return null;
}
