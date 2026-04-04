import { useEffect, useState } from "react";

/** Ensimmäinen SSR/CSR-frame yhtenäinen; tarkat client-only päivitykset vasta mountin jälkeen (hydration). */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
