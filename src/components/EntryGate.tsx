"use client";

import { loadProfile } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Juuripolun reititys: profiili tallessa → /app, muuten /start.
 * Ei näytä markkinointisivua — landing on /home.
 */
export function EntryGate() {
  const router = useRouter();
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    try {
      const p = loadProfile();
      if (p) {
        router.replace("/app");
      } else {
        router.replace("/home");
      }
    } catch (e) {
      console.warn("[coach] EntryGate error", e);
      setStuck(true);
    }
  }, [router]);

  useEffect(() => {
    const t = window.setTimeout(() => setStuck(true), 4000);
    return () => clearTimeout(t);
  }, []);

  if (stuck) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#06070b] px-6 text-center text-[14px] text-muted">
        <p className="text-[15px] font-semibold text-foreground">
          Aloitetaan tästä.
        </p>
        <p className="max-w-sm text-muted">
          Tietoja ei löytynyt tai lataus keskeytyi. Voit jatkaa etusivulta tai
          aloituksesta.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="/home"
            className="rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-[15px] font-semibold text-foreground"
          >
            Etusivu
          </a>
          <a
            href="/start"
            className="rounded-xl bg-accent px-5 py-3 text-[15px] font-semibold text-white"
          >
            Avaa aloitus
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#06070b]">
      <div
        className="size-10 animate-pulse rounded-2xl bg-accent/30"
        aria-hidden
      />
      <p className="mt-6 text-[12px] font-medium uppercase tracking-[0.2em] text-muted-2">
        Coach
      </p>
    </div>
  );
}
