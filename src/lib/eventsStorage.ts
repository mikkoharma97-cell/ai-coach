import type { PlannedEvent } from "@/types/coach";

const EVENTS_KEY = "ai-coach-planned-events-v1";

export function loadPlannedEvents(): PlannedEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PlannedEvent[];
  } catch {
    return [];
  }
}

export function savePlannedEvents(events: PlannedEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch {
    /* ignore */
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Append one event (e.g. from Adjustments UI). */
export function addPlannedEvent(
  partial: Omit<PlannedEvent, "id"> & { id?: string },
): PlannedEvent {
  const event: PlannedEvent = {
    ...partial,
    id: partial.id ?? newId(),
  };
  const all = loadPlannedEvents();
  savePlannedEvents([...all, event]);
  return event;
}

export function removePlannedEvent(id: string): void {
  const all = loadPlannedEvents().filter((e) => e.id !== id);
  savePlannedEvents(all);
}
