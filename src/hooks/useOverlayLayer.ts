"use client";

import { popOverlay, pushOverlay } from "@/lib/overlayStack";
import { useEffect, useRef } from "react";

/**
 * Body + coach scroll -kontin lukitus + Escape — modaalin tausta ei jää "hölskyttämään"
 * pääasiallista scrollia (.app-main-scroll), joka on bodyn ulkopuolella.
 * Singleton-stack: vain yksi overlay kerrallaan; uusi sulkee edellisen.
 */
export function useOverlayLayer(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const close = () => onCloseRef.current();
    pushOverlay(close);
    return () => {
      popOverlay(close);
    };
  }, [open]);
}
