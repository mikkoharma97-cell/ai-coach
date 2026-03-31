/**
 * Temporary version marker for internal / preview builds ("HÄRMÄV1").
 * Remove this component + its import from AppShell when no longer needed.
 */
export function HarmavVersionBadge() {
  return (
    <span
      className="pointer-events-none shrink-0 select-none rounded-full border border-accent/40 bg-[linear-gradient(180deg,rgba(41,92,255,0.22),rgba(5,6,10,0.85))] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-[#b8c8ff] shadow-[0_0_14px_rgba(59,107,255,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] min-[380px]:text-[9px] sm:px-2.5 sm:tracking-[0.18em]"
      aria-hidden
    >
      HÄRMÄV1
    </span>
  );
}
