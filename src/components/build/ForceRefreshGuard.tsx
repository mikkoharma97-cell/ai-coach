"use client";

import { useEffect, useState } from "react";
import {
  peekBuildVersionMismatch,
  runBuildVersionSync,
} from "@/lib/versionStorage";
import { translate, type Locale } from "@/lib/i18n";

function uiLocale(): Locale {
  if (typeof navigator === "undefined") return "fi";
  return navigator.language.toLowerCase().startsWith("fi") ? "fi" : "en";
}

/**
 * Pakottaa yhden cache-bust -latauksen kun bundlattu APP_VERSION ei täsmää storageen.
 * Ei ikuisia looppeja: sessionStorage-lippu + `refresh`-queryn käsittely.
 */
export function ForceRefreshGuard() {
  const [toast, setToast] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (peekBuildVersionMismatch()) {
      setSyncing(true);
    }

    const result = runBuildVersionSync();

    if (!result.didNavigate) {
      setSyncing(false);
    }

    if (result.didFinishRefreshCycle) {
      setToast(true);
      window.setTimeout(() => setToast(false), 4500);
    }
  }, []);

  const loc = uiLocale();
  const toastText = translate(loc, "build.newVersionLoaded");

  return (
    <>
      {syncing ? (
        <div
          className="pointer-events-none fixed left-2 top-[max(2.75rem,env(safe-area-inset-top,0px))] z-[101] max-w-[14rem] rounded-md border border-white/10 bg-[rgba(5,7,12,0.9)] px-2 py-1 font-mono text-[9px] text-muted-2 shadow-lg backdrop-blur-sm sm:left-3"
          role="status"
          aria-live="polite"
        >
          {loc === "fi" ? "Synkronoidaan build…" : "Syncing build…"}
        </div>
      ) : null}
      {toast ? (
        <div
          className="pointer-events-auto fixed bottom-[calc(6rem+env(safe-area-inset-bottom,0px))] left-1/2 z-[102] w-[min(100%,20rem)] -translate-x-1/2 px-4"
          role="status"
        >
          <div className="rounded-[var(--radius-lg)] border border-accent/35 bg-[rgba(5,6,10,0.96)] px-4 py-3 text-center text-[12px] font-medium leading-snug text-foreground shadow-[var(--shadow-float)] backdrop-blur-md">
            {toastText}
          </div>
        </div>
      ) : null}
    </>
  );
}
