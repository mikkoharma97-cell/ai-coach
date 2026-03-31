"use client";

import { useEffect } from "react";

/**
 * Body + coach scroll -kontin lukitus + Escape — modaalin tausta ei jää "hölskyttämään"
 * pääasiallista scrollia (.app-main-scroll), joka on bodyn ulkopuolella.
 */
export function useOverlayLayer(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.dataset.overlayOpen = "1";

    const main = document.querySelector<HTMLElement>(".app-main-scroll");
    const prevMainOverflow = main?.style.overflow ?? "";
    if (main) {
      main.style.overflow = "hidden";
      main.style.overscrollBehavior = "none";
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      delete document.documentElement.dataset.overlayOpen;
      if (main) {
        main.style.overflow = prevMainOverflow;
        main.style.removeProperty("overscroll-behavior");
      }
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
}
