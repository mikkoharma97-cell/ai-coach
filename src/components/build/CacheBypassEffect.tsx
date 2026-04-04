"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const CACHE_BYPASS_SESSION_KEY = "coach_ver_cache_bypass_applied";

/**
 * `?ver=` → tyhjennä service worker -cachet kerran per sessio.
 * Ei UI:ta — refresh-nappi poistettiin tuotantopinnasta (duplikaatti HomeCheckButtonin kanssa).
 */
function CacheBypassInner() {
  const searchParams = useSearchParams();
  const verParam = searchParams.get("ver");

  useEffect(() => {
    if (verParam == null || verParam === "") return;
    const prev = sessionStorage.getItem(CACHE_BYPASS_SESSION_KEY);
    if (prev === verParam) return;
    sessionStorage.setItem(CACHE_BYPASS_SESSION_KEY, verParam);
    if (typeof caches !== "undefined") {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .catch(() => {});
    }
  }, [verParam]);

  return null;
}

export function CacheBypassEffect() {
  return (
    <Suspense fallback={null}>
      <CacheBypassInner />
    </Suspense>
  );
}
