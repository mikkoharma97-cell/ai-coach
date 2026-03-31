/**
 * HÄRMÄ20 — muistutusasetukset (localStorage, ei backend).
 */
export const REMINDER_PREFS_KEY = "ai-coach-reminder-prefs-v1";

export type ReminderPrefs = {
  enabled: boolean;
  /** Treenimuistutus: tunnin jälkeen (0–23), jos treenipäivä ja päivä ei merkitty. */
  workoutHour: number;
  /** Ruokamuistutus: tunnin jälkeen. */
  foodHour: number;
  /** Päivä kesken — illan muistutus. */
  dayIncompleteHour: number;
  /** Hiljaisuus alkaa (klo). */
  quietStartHour: number;
  /** Hiljaisuus päättyy (klo). */
  quietEndHour: number;
};

export const DEFAULT_REMINDER_PREFS: ReminderPrefs = {
  enabled: false,
  workoutHour: 17,
  foodHour: 12,
  dayIncompleteHour: 20,
  quietStartHour: 22,
  quietEndHour: 7,
};

export type ReminderDayLog = {
  dayKey: string;
  workout: boolean;
  food: boolean;
  dayIncomplete: boolean;
  /** Lähetetyt ilmoitukset tänään (max 3). */
  count: number;
  /** Viimeisin lähetys (epoch ms). */
  lastAt: number;
};

const DAY_LOG_KEY = "ai-coach-reminder-daylog-v1";

const emptyDayLog = (dayKey: string): ReminderDayLog => ({
  dayKey,
  workout: false,
  food: false,
  dayIncomplete: false,
  count: 0,
  lastAt: 0,
});

export function loadReminderPrefs(): ReminderPrefs {
  if (typeof window === "undefined") return DEFAULT_REMINDER_PREFS;
  try {
    const raw = localStorage.getItem(REMINDER_PREFS_KEY);
    if (!raw) return DEFAULT_REMINDER_PREFS;
    const p = JSON.parse(raw) as Partial<ReminderPrefs>;
    return {
      ...DEFAULT_REMINDER_PREFS,
      ...p,
      workoutHour: clampHour(p.workoutHour, DEFAULT_REMINDER_PREFS.workoutHour),
      foodHour: clampHour(p.foodHour, DEFAULT_REMINDER_PREFS.foodHour),
      dayIncompleteHour: clampHour(
        p.dayIncompleteHour,
        DEFAULT_REMINDER_PREFS.dayIncompleteHour,
      ),
      quietStartHour: clampHour(p.quietStartHour, DEFAULT_REMINDER_PREFS.quietStartHour),
      quietEndHour: clampHour(p.quietEndHour, DEFAULT_REMINDER_PREFS.quietEndHour),
    };
  } catch {
    return DEFAULT_REMINDER_PREFS;
  }
}

function clampHour(n: unknown, fallback: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return fallback;
  return Math.min(23, Math.max(0, Math.round(n)));
}

export function saveReminderPrefs(prefs: ReminderPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REMINDER_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new Event("coach-reminder-prefs-changed"));
  } catch {
    /* ignore */
  }
}

export function loadReminderDayLog(dayKey: string): ReminderDayLog {
  if (typeof window === "undefined") return emptyDayLog(dayKey);
  try {
    const raw = localStorage.getItem(DAY_LOG_KEY);
    if (!raw) return emptyDayLog(dayKey);
    const parsed = JSON.parse(raw) as ReminderDayLog;
    if (parsed.dayKey !== dayKey) return emptyDayLog(dayKey);
    return {
      ...emptyDayLog(dayKey),
      ...parsed,
      dayKey,
    };
  } catch {
    return emptyDayLog(dayKey);
  }
}

export function saveReminderDayLog(log: ReminderDayLog): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DAY_LOG_KEY, JSON.stringify(log));
  } catch {
    /* ignore */
  }
}
