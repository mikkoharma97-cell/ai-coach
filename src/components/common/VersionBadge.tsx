"use client";

// TEMP: version marker for release validation, remove later
/** Juokseva HÄRMÄ-numero — nosta yhdellä jokaisen viimeistelypassin jälkeen (3, 4, …). */
export const HARMÄ_BUILD = 5;

export function VersionBadge() {
  const label = `HÄRMÄ${HARMÄ_BUILD}`;
  return (
    <div
      className="pointer-events-none select-none"
      style={{
        position: "fixed",
        top: "env(safe-area-inset-top, 12px)",
        right: "12px",
        zIndex: 9999,
        padding: "6px 10px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.05em",
        borderRadius: "999px",
        background: "rgba(30, 40, 80, 0.8)",
        color: "#AFC6FF",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      }}
    >
      {label}
    </div>
  );
}
