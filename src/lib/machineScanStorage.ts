import type { MachineScanRecord } from "@/types/machineScan";

const KEY = "ai-coach-machine-scan-last-v1";

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function saveLastMachineScan(record: Omit<MachineScanRecord, "id" | "createdAt"> & { id?: string }): MachineScanRecord {
  const full: MachineScanRecord = {
    id: record.id ?? newId(),
    createdAt: new Date().toISOString(),
    imageDataUrl: record.imageDataUrl,
    guessedMachineType: record.guessedMachineType,
    notes: record.notes.trim(),
  };
  if (typeof window === "undefined") return full;
  try {
    localStorage.setItem(KEY, JSON.stringify(full));
  } catch {
    /* ignore */
  }
  return full;
}

export function loadLastMachineScan(): MachineScanRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as MachineScanRecord;
    if (!p?.imageDataUrl) return null;
    return p;
  } catch {
    return null;
  }
}
