/**
 * Coach release — näkyvä merkki (HÄRMÄ / BUILD).
 * package.json + buildInfo.generated pitävät teknisen semverin; tämä on tuoteversio.
 */
export const APP_VERSION = "v6";

/** Juokseva HÄRMÄ-numero — isompi passi (copy, moottori, data). */
export const HARMÄ_BUILD = 6;

export const COACH_RELEASE_LABEL = `HÄRMÄ${HARMÄ_BUILD}`;

export const BUILD_V_DISPLAY = `BUILD ${APP_VERSION}`;
