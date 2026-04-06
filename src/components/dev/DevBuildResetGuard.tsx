"use client";

import { BUILD_INFO } from "@/lib/buildInfo";
import {
  DEV_LS_LAST_BUILD_ID,
  DEV_LS_LAST_RESET_AT,
  DEV_LS_LAST_RESET_BUILD_ID,
  DEV_SS_RELOAD_GUARD,
  DEV_SS_RESET_OK_FLASH,
  devAutoResetOnBuildEnabled,
} from "@/lib/devAutoResetOnBuild";
import { clearAllCoachLocalData } from "@/lib/storage";
import { useEffect } from "react";

/**
 * Tyhjentää coach-local-datan kun BUILD_INFO.buildId vaihtuu (dev/preview).
 * Yksi reset per build; yksi reload tyhjentämään muistissa oleva tila.
 */
export function DevBuildResetGuard() {
  useEffect(() => {
    if (!devAutoResetOnBuildEnabled()) return;

    const bid = BUILD_INFO.buildId;

    try {
      const last = localStorage.getItem(DEV_LS_LAST_BUILD_ID);

      if (last === bid) {
        sessionStorage.removeItem(DEV_SS_RELOAD_GUARD);
        return;
      }

      const reloaded = sessionStorage.getItem(DEV_SS_RELOAD_GUARD);
      if (reloaded === bid && last !== bid) {
        localStorage.setItem(DEV_LS_LAST_BUILD_ID, bid);
        localStorage.setItem(DEV_LS_LAST_RESET_BUILD_ID, bid);
        sessionStorage.removeItem(DEV_SS_RELOAD_GUARD);
        return;
      }

      clearAllCoachLocalData();

      const now = new Date().toISOString();
      localStorage.setItem(DEV_LS_LAST_RESET_BUILD_ID, bid);
      localStorage.setItem(DEV_LS_LAST_RESET_AT, now);
      localStorage.setItem(DEV_LS_LAST_BUILD_ID, bid);

      sessionStorage.setItem(DEV_SS_RELOAD_GUARD, bid);
      sessionStorage.setItem(DEV_SS_RESET_OK_FLASH, "1");

      window.location.reload();
    } catch (e) {
      console.warn("[dev] DevBuildResetGuard failed", e);
    }
  }, []);

  return null;
}
