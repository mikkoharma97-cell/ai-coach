/**
 * i18n runtime — imports string tables from `./i18n.messages` (key:value only).
 */
export type Locale = "fi" | "en";

export const LOCALE_STORAGE_KEY = "coach-locale";

export { fi, en, type MessageKey } from "./i18n.messages";

import { fi, en, type MessageKey } from "./i18n.messages";

export type TranslateFn = (
  key: MessageKey,
  vars?: Record<string, string | number>,
) => string;

export function dateLocaleForUi(locale: Locale): string {
  return locale === "fi" ? "fi-FI" : "en-US";
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  try {
  const table = locale === "fi" ? fi : en;
  let out = table[key];
    if (typeof out !== "string") {
      console.error("[i18n] missing or invalid key", key);
      return String(key);
    }
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.replaceAll(`{{${k}}}`, String(v));
    }
  }
  return out;
  } catch (e) {
    console.error("[i18n] translate failed", key, e);
    return String(key);
  }
}
