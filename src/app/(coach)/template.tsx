import type { ReactNode } from "react";

/**
 * Remounts on each coach URL change (Next template). Wraps only layout `children`
 * inside AppShell’s scroll region — header + bottom nav stay fixed.
 * @see docs/adr/001-client-navigation.md
 */
export default function CoachRouteTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="coach-route-template flex min-h-0 w-full min-w-0 flex-1 flex-col">
      {children}
    </div>
  );
}
