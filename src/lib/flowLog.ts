/**
 * FLOW-seuranta — konsoli vain devissä tai kun NEXT_PUBLIC_COACH_FLOW_DEBUG=1.
 * Tuotannossa ei logia (ei suorituskykypudotusta).
 */
const enabled =
  typeof process !== "undefined" &&
  (process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_COACH_FLOW_DEBUG === "1");

export function flowLog(step: string, detail?: unknown): void {
  if (!enabled) return;
  if (detail !== undefined) {
    console.log("FLOW:", step, detail);
  } else {
    console.log("FLOW:", step);
  }
}
