"use client";

import { getPublicBuildInfo } from "@/lib/buildInfo";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "coach_seen_build_version";

/**
 * Vertaa tallennettua build-versiota nykyiseen.
 * Jos deploy vaihtoi version → näytä kevyt ilmoitus (ei automaattista reloadia).
 */
export function useBuildRefreshNotice(): {
  showNotice: boolean;
  dismiss: () => void;
} {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { buildVersion } = getPublicBuildInfo();
    const prev = window.localStorage.getItem(STORAGE_KEY);
    if (prev != null && prev !== buildVersion) {
      setShowNotice(true);
    }
    window.localStorage.setItem(STORAGE_KEY, buildVersion);
  }, []);

  const dismiss = useCallback(() => {
    setShowNotice(false);
  }, []);

  return { showNotice, dismiss };
}
