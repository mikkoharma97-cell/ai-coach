import { BUILD_TIME_ISO } from "./buildInfo.generated";

/** Näytetään devissä tai kun preview-build on käännetty (NEXT_PUBLIC_PREVIEW_BUILD=1). */
export function showPreviewBuildMarker(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_PREVIEW_BUILD === "1"
  );
}

/** Build-aika ISO (generoitu buildin yhteydessä). */
export function getBuildTimeIso(): string {
  return BUILD_TIME_ISO;
}

/** Lyhyt merkkijono asetuksiin / footeriin. */
export function getPreviewBuildLabel(): string {
  if (process.env.NODE_ENV === "development") {
    return "development";
  }
  if (BUILD_TIME_ISO === "not-yet-built") {
    return "—";
  }
  return BUILD_TIME_ISO;
}
