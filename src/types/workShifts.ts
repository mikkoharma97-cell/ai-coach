/**
 * Työvuorot V1 — yksi tyyppi / päivä; kellonajat valinnaisia myöhempää synkkiä varten.
 * (Kalenteri- / toistuvat mallit: ei V1.)
 */
export type WorkShiftType = "morning" | "evening" | "night" | "off";

export type WorkShiftEntry = {
  /** Kalenteriavain — sama muoto kuin `calendarDayKey` (YYYY-M-D) */
  date: string;
  shiftType: WorkShiftType;
  /** Valinnainen — V1 ei käytä päätöksissä */
  startTime?: string;
  /** Valinnainen — V1 ei käytä päätöksissä */
  endTime?: string;
};
