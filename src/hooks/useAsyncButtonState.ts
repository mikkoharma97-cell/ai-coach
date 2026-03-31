"use client";

import { logButtonClick } from "@/lib/uiInteractionDebug";
import { useCallback, useRef, useState } from "react";

const DEFAULT_TIMEOUT_MS = 4000;

type Options = {
  /** Analytics-style name for logs */
  name: string;
  /** Reset loading if action hangs (default 4000ms) */
  timeoutMs?: number;
  /** Set true to emit BUTTON CLICK in development */
  debugClick?: boolean;
};

/**
 * Standard async button: guard double-submit, try/catch/finally, loading reset,
 * and a failsafe timeout so UI never stays disabled forever.
 */
export function useAsyncButtonState({
  name,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  debugClick = true,
}: Options) {
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);
  const runGeneration = useRef(0);
  const failsafeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFailsafe = useCallback(() => {
    if (failsafeTimer.current) {
      clearTimeout(failsafeTimer.current);
      failsafeTimer.current = null;
    }
  }, []);

  const run = useCallback(
    async (action: () => void | Promise<void>) => {
      if (inFlight.current) return;
      inFlight.current = true;
      const gen = ++runGeneration.current;
      if (debugClick) logButtonClick(name);
      setLoading(true);

      clearFailsafe();
      failsafeTimer.current = setTimeout(() => {
        if (runGeneration.current !== gen) return;
        console.error(`[interaction] loading timeout, reset: ${name}`);
        inFlight.current = false;
        setLoading(false);
        failsafeTimer.current = null;
      }, timeoutMs);

      try {
        await Promise.resolve(action());
      } catch (e) {
        console.error(`[interaction] ${name}`, e);
      } finally {
        clearFailsafe();
        if (runGeneration.current === gen) {
          inFlight.current = false;
          setLoading(false);
        }
      }
    },
    [name, timeoutMs, debugClick, clearFailsafe],
  );

  const reset = useCallback(() => {
    runGeneration.current += 1;
    inFlight.current = false;
    clearFailsafe();
    setLoading(false);
  }, [clearFailsafe]);

  return { loading, run, reset };
}
