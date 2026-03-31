"use client";

import { useEffect } from "react";

/** Lock page scroll (e.g. fullscreen loading overlay) — no Escape handler. */
export function useBodyScrollLock(lock: boolean) {
  useEffect(() => {
    if (!lock) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [lock]);
}
