import { APP_VERSION, BUILD_TIME_ISO } from "./buildInfo.generated";

/** package.json — sama kuin buildInfo.generated (kirjoitetaan buildissa). */
export function getAppVersion(): string {
  return APP_VERSION;
}

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

/** Vercel / dev -erottelu näkyvään merkkijonoon (ei salaisuuksia). */
export function getEnvironmentMarker():
  | "development"
  | "preview"
  | "production"
  | "local" {
  if (process.env.NODE_ENV === "development") return "development";
  if (process.env.VERCEL_ENV === "preview") return "preview";
  if (process.env.VERCEL_ENV === "production") return "production";
  if (process.env.NEXT_PUBLIC_PREVIEW_BUILD === "1") return "preview";
  return "local";
}

/** Yksi rivi: versio + ympäristö + build-aika (deploy-testit). */
export function getBuildDisplayString(): string {
  const env = getEnvironmentMarker();
  const time =
    BUILD_TIME_ISO === "not-yet-built" ? "dev" : BUILD_TIME_ISO;
  return `v${APP_VERSION} · ${env} · ${time}`;
}

/** Lyhyt label badgeille (esim. "Preview build"). */
export function getBuildLabelShort(): string {
  const env = getEnvironmentMarker();
  if (env === "development" || env === "local") return "Local / dev";
  if (env === "preview") return "Preview build";
  return "Production build";
}
