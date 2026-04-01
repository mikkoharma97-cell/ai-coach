/**
 * Tuoteversio — HÄRMÄ70: build-päivä ja -aika tulevat `buildInfo.generated.ts`istä
 * (kirjoitetaan `npm run build` → write-build-info.mjs, sama hetki kuin BUILD_TIME_ISO).
 * `BUILD_SYNC_FINGERPRINT`: cache-bypass / ForceRefreshGuard.
 */
import {
  BUILD_DATE_DISPLAY,
  BUILD_TIME_DISPLAY,
} from "@/lib/buildInfo.generated";

export const APP_VERSION = "HÄRMÄ70";

/** Juokseva build-numero — käytä fingerprintissä */
export const HARMÄ_BUILD = 70;

/** Generoitu jokaisessa buildissa — ei manuaalista päivitystä */
export const BUILD_DATE = BUILD_DATE_DISPLAY;

export const BUILD_TIME = BUILD_TIME_DISPLAY;

/** Näkyvä toinen rivi build-markerissa */
export const BUILD_DISPLAY_LINE = `${BUILD_DATE} · ${BUILD_TIME}`;

export const BUILD_SYNC_FINGERPRINT = `${APP_VERSION}|${HARMÄ_BUILD}`;

export const COACH_RELEASE_LABEL = APP_VERSION;

export const BUILD_V_DISPLAY = `BUILD ${APP_VERSION}`;
