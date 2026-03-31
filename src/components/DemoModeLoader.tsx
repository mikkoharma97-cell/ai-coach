"use client";

import { runDemoPresetIfNeeded } from "@/lib/demoSeed";
import { useEffect } from "react";

export function DemoModeLoader() {
  useEffect(() => {
    runDemoPresetIfNeeded();
  }, []);
  return null;
}
