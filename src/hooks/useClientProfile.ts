"use client";

import { loadProfile } from "@/lib/storage";
import type { OnboardingAnswers } from "@/types/coach";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

/**
 * Profile from localStorage — always `undefined` until first client layout read
 * (avoids hydration / client-only mismatch from sync loadProfile in useState).
 */
export function useClientProfile():
  | undefined
  | OnboardingAnswers
  | null {
  const pathname = usePathname();
  const [profile, setProfile] = useState<
    OnboardingAnswers | null | undefined
  >(undefined);

  useLayoutEffect(() => {
    try {
      const p = loadProfile();
      setProfile(p);
    } catch (e) {
      console.error(e);
      setProfile(null);
    }
  }, [pathname]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setProfile((prev) => (prev !== undefined ? prev : null));
      } catch (e) {
        console.error(e);
        setProfile(null);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [pathname]);

  return profile;
}
