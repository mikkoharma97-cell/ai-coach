"use client";

import { dayKeyFromDate } from "@/lib/dateKey";
import { generateDailyPlan } from "@/lib/dailyEngine";
import {
  LOCALE_STORAGE_KEY,
  translate,
  type Locale,
  type MessageKey,
} from "@/lib/i18n";
import {
  pickNextReminder,
  type ReminderKind,
} from "@/lib/notifications/reminderSchedule";
import {
  loadReminderDayLog,
  loadReminderPrefs,
  saveReminderDayLog,
} from "@/lib/notifications/reminderStorage";
import { isDayMarkedDone, loadProfile, PROFILE_KEY_V3 } from "@/lib/storage";
import { useCallback, useEffect } from "react";

const TITLE_KEYS: Record<ReminderKind, MessageKey> = {
  workout: "notifications.titleWorkout",
  food: "notifications.titleFood",
  dayIncomplete: "notifications.titleDay",
};

const BODY_KEYS: Record<ReminderKind, MessageKey> = {
  workout: "notifications.bodyWorkout",
  food: "notifications.bodyFood",
  dayIncomplete: "notifications.bodyDay",
};

function resolveUiLocale(): Locale {
  if (typeof window === "undefined") return "fi";
  try {
    const s = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (s === "en" || s === "fi") return s;
    const raw = localStorage.getItem(PROFILE_KEY_V3);
    if (raw) {
      const p = JSON.parse(raw) as { uiLocale?: string };
      if (p.uiLocale === "en" || p.uiLocale === "fi") return p.uiLocale;
    }
  } catch {
    /* ignore */
  }
  return "fi";
}

/**
 * Selainilmoitukset (opt-in): treeni / ruoka / päivä kesken.
 * Rajoitettu: max 3/pvä, 90 min väli, hiljaiset tunnit — ei spämmiä.
 */
export function CoachReminderNotifications() {
  const run = useCallback(() => {
    const locale = resolveUiLocale();
    if (typeof window === "undefined") return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;

    const prefs = loadReminderPrefs();
    if (!prefs.enabled) return;

    const profile = loadProfile();
    if (!profile) return;

    const now = new Date();
    const dayKey = dayKeyFromDate(now);

    let plan = null;
    try {
      plan = generateDailyPlan(profile, now, locale);
    } catch {
      return;
    }

    if (isDayMarkedDone(now)) return;

    let log = loadReminderDayLog(dayKey);
    if (log.dayKey !== dayKey) {
      log = {
        dayKey,
        workout: false,
        food: false,
        dayIncomplete: false,
        count: 0,
        lastAt: 0,
      };
    }

    const kind = pickNextReminder({
      now,
      prefs,
      plan,
      dayMarkedDone: false,
      lastNotificationAt: log.lastAt,
      sentWorkout: log.workout,
      sentFood: log.food,
      sentDayIncomplete: log.dayIncomplete,
      sentCount: log.count,
    });
    if (!kind) return;

    const title = translate(locale, TITLE_KEYS[kind]);
    const body = translate(locale, BODY_KEYS[kind]);

    try {
      new Notification(title, {
        body,
        tag: `coach-reminder-${kind}-${dayKey}`,
        silent: true,
      });
    } catch {
      return;
    }

    const next = { ...log };
    if (kind === "workout") next.workout = true;
    if (kind === "food") next.food = true;
    if (kind === "dayIncomplete") next.dayIncomplete = true;
    next.count = log.count + 1;
    next.lastAt = Date.now();
    saveReminderDayLog(next);
  }, []);

  useEffect(() => {
    const id = window.setInterval(run, 60_000);
    const onVis = () => {
      if (document.visibilityState === "visible") run();
    };
    const onPrefs = () => run();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("coach-reminder-prefs-changed", onPrefs);
    run();
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("coach-reminder-prefs-changed", onPrefs);
    };
  }, [run]);

  return null;
}
