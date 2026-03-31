import { APP_VERSION, BUILD_TIME_ISO } from "./buildInfo.generated";

export type PublicBuildInfo = {
  /** Näkyvä versio (env tai package / generoitu) */
  buildVersion: string;
  /** ISO-aikaleima tai "dev" */
  buildTimestamp: string;
  /** Yksi rivi diagnostiikkaan / UI:hin */
  buildLabel: string;
};

/**
 * Julkinen build-tieto — toimii clientissä ja serverillä.
 * Prioriteetti: NEXT_PUBLIC_* → generoitu → "dev".
 */
export function getPublicBuildInfo(): PublicBuildInfo {
  const envVer = process.env.NEXT_PUBLIC_APP_VERSION?.trim();
  const envTime = process.env.NEXT_PUBLIC_BUILD_TIME?.trim();

  const buildVersion =
    envVer ||
    (APP_VERSION && APP_VERSION.length > 0 ? APP_VERSION : "") ||
    "dev";

  const buildTimestamp =
    envTime ||
    (BUILD_TIME_ISO && BUILD_TIME_ISO !== "not-yet-built" ? BUILD_TIME_ISO : "") ||
    "dev";

  const buildLabel = `${getBuildLabelShort()} · v${buildVersion} · ${buildTimestamp}`;

  return { buildVersion, buildTimestamp, buildLabel };
}

/** Lyhyt aikaleima UI:hin (locale). */
export function formatBuildTimestampForUi(
  iso: string,
  locale: "fi" | "en",
): string {
  if (!iso || iso === "dev") {
    return locale === "en" ? "dev" : "dev";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleString(locale === "en" ? "en-US" : "fi-FI", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

/**
 * Cache-bustin testilinkkeihin — ei muuta Next Link -reititystä.
 * Lisää ?b= tai &b= vain kun versio ei ole pelkkä "dev".
 */
export function appendBuildQuery(href: string): string {
  const v = getPublicBuildInfo().buildVersion;
  if (!v || v === "dev") return href;
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}b=${encodeURIComponent(v)}`;
}

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
  return getPublicBuildInfo().buildLabel;
}

/** Lyhyt label badgeille (esim. "Preview build"). */
export function getBuildLabelShort(): string {
  const env = getEnvironmentMarker();
  if (env === "development" || env === "local") return "Local / dev";
  if (env === "preview") return "Preview build";
  return "Production build";
}
