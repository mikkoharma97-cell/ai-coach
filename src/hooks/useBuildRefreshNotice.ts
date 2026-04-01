"use client";

import { BUILD_SYNC_FINGERPRINT } from "@/config/version";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "coach_seen_build_version";

/**
 * Vertaa tallennettua build-fingerprintiä nykyiseen (HÄRMÄx|n).
 * Jos deploy vaihtoi version → näytä kevyt ilmoitus (ei automaattista reloadia).
 */
export function useBuildRefreshNotice(): {
  showNotice: boolean;
  dismiss: () => void;
} {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prev = window.localStorage.getItem(STORAGE_KEY);
    if (prev != null && prev !== BUILD_SYNC_FINGERPRINT) {
      setShowNotice(true);
    }
    window.localStorage.setItem(STORAGE_KEY, BUILD_SYNC_FINGERPRINT);
  }, []);

  const dismiss = useCallback(() => {
    setShowNotice(false);
  }, []);

  return { showNotice, dismiss };
}
