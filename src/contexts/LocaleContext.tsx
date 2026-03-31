"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  LOCALE_STORAGE_KEY,
  type Locale,
  translate,
  type TranslateFn,
} from "@/lib/i18n";
import { PROFILE_KEY_V3 } from "@/lib/storage";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TranslateFn;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fi");

  useEffect(() => {
    try {
      const s = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (s === "en" || s === "fi") {
        queueMicrotask(() => setLocaleState(s));
        return;
      }
      const raw = localStorage.getItem(PROFILE_KEY_V3);
      if (raw) {
        const p = JSON.parse(raw) as { uiLocale?: string };
        if (p.uiLocale === "en" || p.uiLocale === "fi") {
          const ul = p.uiLocale;
          queueMicrotask(() => {
            setLocaleState(ul);
            localStorage.setItem(LOCALE_STORAGE_KEY, ul);
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback<TranslateFn>(
    (key, vars) => translate(locale, key, vars),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useTranslation(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within LocaleProvider");
  }
  return ctx;
}
