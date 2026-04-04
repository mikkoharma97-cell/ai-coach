"use client";

import { usePathname } from "next/navigation";
import { isAppShellRoute } from "@/lib/appShellRoutes";
import { translate, type Locale, type MessageKey } from "@/lib/i18n";
import {
  appendFeedbackEntry,
  getDeviceKind,
  readClientLocale,
  type FeedbackEntryV2,
  type FeedbackTypeV2,
} from "@/lib/feedbackStorage";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

const MAX_LEN = 200;

export function FeedbackWidget() {
  const pathname = usePathname();
  const baseId = useId();

  /**
   * Navin yläpuolelle (`--bottom-stack`) + pieni väli — ei peitä tabeja.
   */
  const fabBottomClass =
    "bottom-[calc(var(--bottom-stack)+12px)] md:bottom-8";

  const fabScaleClass =
    "max-[480px]:origin-bottom-right max-[480px]:scale-[0.95]";
  const [locale, setLocale] = useState<Locale>("fi");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<FeedbackTypeV2>("idea");
  const [sent, setSent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const t = useCallback(
    (key: MessageKey) => translate(locale, key),
    [locale],
  );

  useEffect(() => {
    setLocale(readClientLocale());
    const onVis = () => setLocale(readClientLocale());
    window.addEventListener("focus", onVis);
    const id = window.setInterval(() => setLocale(readClientLocale()), 2000);
    return () => {
      window.removeEventListener("focus", onVis);
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    queueMicrotask(() => textareaRef.current?.focus());
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (pathname === "/feedback") {
    return null;
  }

  /** Vain coach-shell (bottom nav) — ei marketing / paywall / landing -pintaan. */
  if (!isAppShellRoute(pathname ?? "")) {
    return null;
  }

  const canSubmit =
    message.trim().length > 0 && message.trim().length <= MAX_LEN;

  const submit = () => {
    if (!canSubmit) return;
    const now = Date.now();
    const entry: FeedbackEntryV2 = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `fb-${now}-${Math.random().toString(36).slice(2, 9)}`,
      message: message.trim(),
      type,
      path: pathname || "/",
      device: getDeviceKind(),
      viewport: {
        w: typeof window !== "undefined" ? window.innerWidth : 0,
        h: typeof window !== "undefined" ? window.innerHeight : 0,
      },
      timestamp: now,
    };
    try {
      const last =
        typeof sessionStorage !== "undefined"
          ? sessionStorage.getItem("coach-last-ui-action") ?? undefined
          : undefined;
      if (last) entry.lastAction = last;
    } catch {
      /* ignore */
    }

    appendFeedbackEntry(entry);
    console.log("[feedback]", entry);
    setSent(true);
    setMessage("");
    setOpen(false);
    window.setTimeout(() => setSent(false), 2800);
  };

  return (
    <>
      {sent ? (
        <div
          className={`pointer-events-none fixed left-1/2 z-[96] max-w-[min(100%,20rem)] -translate-x-1/2 rounded-2xl border border-white/12 bg-[rgba(8,10,16,0.92)] px-4 py-2.5 text-center text-[13px] font-medium text-foreground shadow-lg backdrop-blur-xl ${fabBottomClass}`}
          role="status"
        >
          {t("feedback.successToast")}
        </div>
      ) : null}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`fixed right-4 z-[90] flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-[rgba(8,10,16,0.78)] px-3.5 py-2 text-[12px] font-semibold tracking-[-0.02em] text-foreground shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-[18px] transition hover:border-accent/35 hover:bg-[rgba(12,14,22,0.88)] active:scale-[0.98] md:right-6 md:px-4 md:text-[13px] md:scale-100 ${fabBottomClass} ${fabScaleClass}`}
          aria-haspopup="dialog"
          aria-expanded={false}
        >
          <span aria-hidden className="text-[14px] leading-none">
            ✍️
          </span>
          {t("feedback.button")}
        </button>
      ) : null}

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[var(--z-overlay-backdrop)] bg-black/50 backdrop-blur-[2px]"
            aria-label={t("feedback.close")}
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${baseId}-title`}
            className="fixed inset-x-0 bottom-0 z-[var(--z-overlay-sheet)] max-h-[60vh] min-h-[40vh] rounded-t-[var(--radius-xl)] border border-white/[0.1] border-b-0 bg-[rgba(6,7,11,0.96)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-12px_48px_rgba(0,0,0,0.55)] backdrop-blur-[20px] md:left-1/2 md:max-w-md md:-translate-x-1/2"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" aria-hidden />
            <h2
              id={`${baseId}-title`}
              className="text-center text-[1.125rem] font-semibold tracking-[-0.03em] text-foreground"
            >
              {t("feedback.sheetTitle")}
            </h2>
            <p
              id={`${baseId}-prompt`}
              className="mt-3 text-center text-[13px] font-medium leading-snug text-muted-2"
            >
              {t("feedback.promptAbove")}
            </p>

            <textarea
              ref={textareaRef}
              value={message}
              maxLength={MAX_LEN}
              onChange={(e) => setMessage(e.target.value.slice(0, MAX_LEN))}
              placeholder={t("feedback.placeholder")}
              aria-describedby={`${baseId}-prompt`}
              rows={3}
              className="mt-4 w-full resize-none rounded-[var(--radius-lg)] border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-[15px] leading-relaxed text-foreground placeholder:text-muted-2 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/25"
            />
            <p className="mt-1 text-right text-[11px] text-muted-2">
              {message.length}/{MAX_LEN}
            </p>

            <fieldset className="mt-4 space-y-2.5">
              <legend className="sr-only">{t("feedback.typeLegend")}</legend>
              {(
                [
                  ["bug", "feedback.typeBug"] as const,
                  ["confusing", "feedback.typeConfusing"] as const,
                  ["idea", "feedback.typeIdea"] as const,
                ] as const
              ).map(([value, key]) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-lg)] border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 transition hover:border-white/12"
                >
                  <input
                    type="radio"
                    name={`${baseId}-type`}
                    checked={type === value}
                    onChange={() => setType(value)}
                    className="size-4 accent-accent"
                  />
                  <span className="text-[14px] font-medium text-foreground/95">
                    {t(key)}
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                disabled={!canSubmit}
                onClick={submit}
                className="flex h-[52px] w-full touch-manipulation items-center justify-center rounded-[var(--radius-lg)] bg-accent text-[16px] font-semibold text-white shadow-[var(--shadow-primary-cta)] transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {t("feedback.submit")}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius-lg)] border border-white/[0.1] bg-transparent text-[15px] font-semibold text-muted transition hover:bg-white/[0.05] hover:text-foreground"
              >
                {t("feedback.close")}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
