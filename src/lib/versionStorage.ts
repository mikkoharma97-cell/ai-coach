import { BUILD_SYNC_FINGERPRINT } from "@/config/version";

/** Viimeksi nähty sync-avain (APP_VERSION|build) — vertailu bundlattuun fingerprintiin. */
export const BUILD_VERSION_STORAGE_KEY = "ai-coach-build-version";

/**
 * Estää reload-loopin: yksi pakotettu navigointi per sessio,
 * kunnes `refresh`-parametrilla tuleva lataus on käsitelty.
 */
export const REFRESH_SESSION_FLAG_KEY = "ai-coach-refresh-done";

const REFRESH_QUERY = "refresh";

/** React Strict Mode kutsuu effectejä kahdesti devissä — yksi synkronointi per täysi load. */
let syncInvokeCount = 0;

/** Näytetäänkö "Synkronoidaan build…" ennen mahdollista `replace`-kutsua. */
export function peekBuildVersionMismatch(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).has(REFRESH_QUERY)) {
      return false;
    }
    if (sessionStorage.getItem(REFRESH_SESSION_FLAG_KEY) === "1") {
      return false;
    }
    const stored = localStorage.getItem(BUILD_VERSION_STORAGE_KEY);
    if (stored === null) return false;
    return stored !== BUILD_SYNC_FINGERPRINT;
  } catch {
    return false;
  }
}

export type BuildVersionSyncResult = {
  /** Juuri kutsuttiin `location.replace` — sivu vaihtuu. */
  didNavigate: boolean;
  /** Tultiin takaisin `?refresh=` -latauksella; storage synkassa. */
  didFinishRefreshCycle: boolean;
};

/**
 * Vertaa localStoragea bundlattuun `BUILD_SYNC_FINGERPRINT`iin.
 * - Ei storagea → tallenna nykyinen.
 * - Ero → yksi hard-navigaatio `?refresh=<timestamp>` (cache-bust).
 * - Jo `refresh` URL:ssa → päivitä storage, siivoa URL, tyhjennä session-flag.
 * - Session-flag asetettu mutta yhä ero → päivitä storage nykyiseen koodiin (ei uutta reloadia).
 */
export function runBuildVersionSync(): BuildVersionSyncResult {
  if (typeof window === "undefined") {
    return { didNavigate: false, didFinishRefreshCycle: false };
  }

  syncInvokeCount += 1;
  if (syncInvokeCount > 1) {
    return { didNavigate: false, didFinishRefreshCycle: false };
  }

  const url = new URL(window.location.href);
  const hadRefreshQuery = url.searchParams.has(REFRESH_QUERY);

  if (hadRefreshQuery) {
    try {
      localStorage.setItem(BUILD_VERSION_STORAGE_KEY, BUILD_SYNC_FINGERPRINT);
    } catch {
      /* ignore */
    }
    url.searchParams.delete(REFRESH_QUERY);
    const next =
      `${url.pathname}${url.search}${url.hash}` || url.pathname;
    window.history.replaceState({}, "", next);
    try {
      sessionStorage.removeItem(REFRESH_SESSION_FLAG_KEY);
    } catch {
      /* ignore */
    }
    return { didNavigate: false, didFinishRefreshCycle: true };
  }

  let stored: string | null = null;
  try {
    stored = localStorage.getItem(BUILD_VERSION_STORAGE_KEY);
  } catch {
    /* ignore */
  }

  if (stored === null) {
    try {
      localStorage.setItem(BUILD_VERSION_STORAGE_KEY, BUILD_SYNC_FINGERPRINT);
    } catch {
      /* ignore */
    }
    return { didNavigate: false, didFinishRefreshCycle: false };
  }

  if (stored === BUILD_SYNC_FINGERPRINT) {
    return { didNavigate: false, didFinishRefreshCycle: false };
  }

  let flag = false;
  try {
    flag = sessionStorage.getItem(REFRESH_SESSION_FLAG_KEY) === "1";
  } catch {
    /* ignore */
  }

  if (flag) {
    try {
      localStorage.setItem(BUILD_VERSION_STORAGE_KEY, BUILD_SYNC_FINGERPRINT);
    } catch {
      /* ignore */
    }
    return { didNavigate: false, didFinishRefreshCycle: false };
  }

  try {
    sessionStorage.setItem(REFRESH_SESSION_FLAG_KEY, "1");
  } catch {
    /* ignore */
  }

  url.searchParams.set(REFRESH_QUERY, String(Date.now()));
  window.location.replace(url.toString());
  return { didNavigate: true, didFinishRefreshCycle: false };
}
