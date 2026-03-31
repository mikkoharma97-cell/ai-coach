"use client";

import {
  logOpenApp,
  logOpenFood,
  logOpenToday,
  logOpenWorkout,
} from "@/lib/eventLogger";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Session-level open_app + reittikohtaiset näkymät (coach-shell). */
export function AnalyticsSession() {
  const path = usePathname();
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    if (typeof sessionStorage !== "undefined") {
      const k = "coach_analytics_open_app";
      if (!sessionStorage.getItem(k)) {
        sessionStorage.setItem(k, "1");
        logOpenApp();
      }
    }
  }, []);

  useEffect(() => {
    if (path === "/app") logOpenToday();
    if (path === "/food") logOpenFood();
    if (path === "/workout") logOpenWorkout();
  }, [path]);

  return null;
}
