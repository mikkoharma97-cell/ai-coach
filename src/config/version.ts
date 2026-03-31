/**
 * Coach release — näkyvä merkki (HÄRMÄ / BUILD).
 * package.json + buildInfo.generated pitävät teknisen semverin; tämä on tuoteversio.
 * MASTER BUILD -kokonaisuus: `docs/MASTER_BUILD_AUDIT.md`.
 */
export const APP_VERSION = "v22";

/** Juokseva HÄRMÄ-numero — isompi passi (copy, moottori, data). */
export const HARMÄ_BUILD = 22;

export const COACH_RELEASE_LABEL = `HÄRMÄ${HARMÄ_BUILD}`;

export const BUILD_V_DISPLAY = `BUILD ${APP_VERSION}`;
