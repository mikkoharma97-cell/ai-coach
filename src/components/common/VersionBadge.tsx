"use client";

import { APP_VERSION } from "@/config/version";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const CACHE_BYPASS_SESSION_KEY = "coach_ver_cache_bypass_applied";

function VersionBadgeInner() {
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

  return (
    <>
      <button
        type="button"
        aria-label="Refresh"
        onClick={() => window.location.reload()}
        className="fixed bottom-2 left-2 z-[100] text-[10px] opacity-50"
      >
        refresh
      </button>
      <div className="pointer-events-none fixed bottom-2 right-2 z-[100] select-none text-[10px] opacity-50">
        {APP_VERSION}
      </div>
    </>
  );
}

export function VersionBadge() {
  return (
    <Suspense fallback={null}>
      <VersionBadgeInner />
    </Suspense>
  );
}
