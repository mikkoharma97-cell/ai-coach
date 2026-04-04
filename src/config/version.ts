/**
 * Versio + build — yksi lähde: `buildInfo.generated.ts` (npm run build → write-build-info.mjs).
 */
import {
  APP_VERSION,
  BUILD_DATE_DISPLAY,
  BUILD_DISPLAY_LINE,
  BUILD_TIME_DISPLAY,
  BUILD_TIME_ISO,
} from "@/lib/buildInfo.generated";

export {
  APP_VERSION,
  BUILD_DATE_DISPLAY,
  BUILD_TIME_DISPLAY,
  BUILD_TIME_ISO,
  BUILD_DISPLAY_LINE,
};

/** @deprecated Käytä APP_VERSION — juokseva build-numero; fingerprint käyttää BUILD_TIME_ISO */
export const HARMÄ_BUILD = 71;

export const BUILD_DATE = BUILD_DATE_DISPLAY;
export const BUILD_TIME = BUILD_TIME_DISPLAY;

/** Sama kuin `BUILD_DISPLAY_LINE` (generoitu yksi rivi). */
export const BUILD_TIMESTAMP = BUILD_DISPLAY_LINE;

export const BUILD_SYNC_FINGERPRINT = `${APP_VERSION}|${BUILD_TIME_ISO}`;

export const BUILD_V_DISPLAY = `BUILD ${APP_VERSION}`;

export const COACH_RELEASE_LABEL = APP_VERSION;
