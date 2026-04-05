import { APP_VERSION as COACH_APP_VERSION } from "@/config/version";
import {
  APP_VERSION as GENERATED_APP_VERSION,
  BUILD_ID as GENERATED_BUILD_ID,
  BUILD_TIME_ISO,
} from "./buildInfo.generated";

/**
 * Yksi totuus dev/preview -merkille — SSR/client sama (ei runtime-randomia renderissä).
 * Env voi yliajaa CI/deploy -ketjussa.
 */
export const BUILD_INFO = {
  version:
    process.env.NEXT_PUBLIC_APP_VERSION?.trim() ||
    (GENERATED_APP_VERSION && GENERATED_APP_VERSION.length > 0
      ? GENERATED_APP_VERSION
      : "dev"),
  buildTime:
    process.env.NEXT_PUBLIC_BUILD_TIME?.trim() ||
    (BUILD_TIME_ISO && BUILD_TIME_ISO !== "not-yet-built"
      ? BUILD_TIME_ISO
      : "dev"),
  buildId:
    process.env.NEXT_PUBLIC_BUILD_ID?.trim() ||
    (GENERATED_BUILD_ID && GENERATED_BUILD_ID.length > 0
      ? GENERATED_BUILD_ID
      : "local"),
} as const;

/**
 * Build-markerin SSR/hydration-yhteensopiva aika: UTC `HH:MM` ISO-merkkijonosta.
 * Ei `toLocaleTimeString` / paikallista aikaa — ne eroavat Node vs selain.
 */
export function formatBuildTimeUtcClock(iso: string): string {
  if (!iso || iso === "dev") return "--:--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

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
    (COACH_APP_VERSION && COACH_APP_VERSION.length > 0 ? COACH_APP_VERSION : "") ||
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
 * Build-merkin toinen rivi: `1.4.2026 · 14:32` (FI) / vastaava EN.
 * Lähde: `BUILD_TIME_ISO` → `getPublicBuildInfo().buildTimestamp`.
 */
export function formatBuildDateTimeForMarker(
  iso: string,
  locale: "fi" | "en",
): string {
  if (!iso || iso === "dev") {
    return locale === "en" ? "dev · —" : "dev · —";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  if (locale === "fi") {
    const datePart = new Intl.DateTimeFormat("fi-FI", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).format(d);
    const timePart = new Intl.DateTimeFormat("fi-FI", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
    return `${datePart} · ${timePart}`;
  }
  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(d);
  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
  return `${datePart} · ${timePart}`;
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

/** Tuoteversio — `src/config/version.ts`. */
export function getAppVersion(): string {
  return COACH_APP_VERSION;
}

/** Näytetään devissä tai kun preview-build on käännetty (NEXT_PUBLIC_PREVIEW_BUILD=1). */
export function showPreviewBuildMarker(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_PREVIEW_BUILD === "1"
  );
}

/** Kelluva build-marker (dev/preview) — piilota tuotannossa `NEXT_PUBLIC_SHOW_BUILD_MARKER=0`. */
export function buildMarkerVisible(): boolean {
  if (process.env.NEXT_PUBLIC_SHOW_BUILD_MARKER === "0") return false;
  return showPreviewBuildMarker();
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
