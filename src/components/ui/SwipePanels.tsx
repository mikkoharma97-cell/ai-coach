"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

export type SwipePanelItem = {
  /** Vakaa avain listalle */
  key: string;
  /** Lyhyt otsikko (dots / välilehdet) */
  label: string;
  children: React.ReactNode;
};

type Props = {
  items: SwipePanelItem[];
  initialIndex?: number;
  showDots?: boolean;
  showLabels?: boolean;
  className?: string;
  /** Visuaalinen korkeus: tasainen rima mobiilissa */
  panelMinHeightClassName?: string;
  /** Saavutettavuus */
  ariaLabel?: string;
};

/**
 * Vaakapyyhkäisy + scroll-snap. Ei levitä overflow-x:ää bodylle —
 * kääre on `overflow-x-hidden`, sisäinen track `overflow-x-auto` + snap.
 */
export function SwipePanels({
  items,
  initialIndex = 0,
  showDots = true,
  showLabels = true,
  className = "",
  panelMinHeightClassName = "min-h-[11rem]",
  ariaLabel = "Swipe panels",
}: Props) {
  const uid = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(() =>
    Math.min(Math.max(0, initialIndex), Math.max(0, items.length - 1)),
  );

  const scrollToIndex = useCallback(
    (i: number) => {
      const el = trackRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const next = Math.min(Math.max(0, i), items.length - 1);
      el.scrollTo({ left: next * w, behavior: "smooth" });
      setActive(next);
    },
    [items.length],
  );

  useEffect(() => {
    const el = trackRef.current;
    if (!el || items.length === 0) return;
    const w = el.clientWidth;
    if (w > 0) {
      el.scrollLeft = Math.min(initialIndex, items.length - 1) * w;
    }
  }, [initialIndex, items.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = el.clientWidth;
        if (w <= 0) return;
        const i = Math.round(el.scrollLeft / w);
        setActive(Math.min(Math.max(0, i), items.length - 1));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [items.length]);

  const goPrev = useCallback(() => scrollToIndex(active - 1), [active, scrollToIndex]);
  const goNext = useCallback(() => scrollToIndex(active + 1), [active, scrollToIndex]);

  const canPrev = active > 0;
  const canNext = active < items.length - 1;

  const labelButtons = useMemo(
    () =>
      showLabels && items.length > 1 ? (
        <div
          className="mb-2 flex flex-wrap gap-1.5"
          role="tablist"
          aria-label={ariaLabel}
        >
          {items.map((it, i) => (
            <button
              key={it.key}
              type="button"
              role="tab"
              id={`${uid}-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`${uid}-panel-${i}`}
              onClick={() => scrollToIndex(i)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                i === active
                  ? "bg-accent/25 text-accent ring-1 ring-accent/40"
                  : "bg-white/[0.05] text-muted-2 hover:bg-white/[0.08]"
              }`}
            >
              {it.label}
            </button>
          ))}
        </div>
      ) : null,
    [active, ariaLabel, items, scrollToIndex, showLabels, uid],
  );

  if (items.length === 0) return null;

  return (
    <div className={`swipe-panels-root ${className}`}>
      <div className="flex items-center justify-between gap-2">
        {labelButtons}
        {items.length > 1 ? (
          <div className="ml-auto hidden shrink-0 gap-1 sm:flex" aria-hidden={false}>
            <button
              type="button"
              onClick={goPrev}
              disabled={!canPrev}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-[13px] font-semibold text-foreground transition enabled:hover:bg-white/[0.08] disabled:opacity-35"
              aria-label="Edellinen"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canNext}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-[13px] font-semibold text-foreground transition enabled:hover:bg-white/[0.08] disabled:opacity-35"
              aria-label="Seuraava"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>

      <div className="overflow-x-hidden rounded-[var(--radius-xl)] border border-white/[0.07] bg-white/[0.02]">
        <div
          ref={trackRef}
          className={`swipe-panels-track flex touch-pan-x overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden ${panelMinHeightClassName}`}
          role="region"
          aria-label={ariaLabel}
          tabIndex={0}
        >
          {items.map((it, i) => (
            <div
              key={it.key}
              id={`${uid}-panel-${i}`}
              role="tabpanel"
              aria-labelledby={`${uid}-tab-${i}`}
              className="box-border min-h-0 w-full min-w-0 max-w-full flex-[0_0_100%] snap-start snap-always px-4 py-4 sm:px-5"
            >
              {it.children}
            </div>
          ))}
        </div>
      </div>

      {showDots && items.length > 1 ? (
        <div
          className="mt-3 flex justify-center gap-2"
          role="group"
          aria-label="Sivutus"
        >
          {items.map((it, i) => (
            <button
              key={`dot-${it.key}`}
              type="button"
              onClick={() => scrollToIndex(i)}
              className={`h-2 rounded-full transition-all ${
                i === active
                  ? "w-6 bg-accent"
                  : "w-2 bg-white/20 hover:bg-white/35"
              }`}
              aria-label={it.label}
              aria-current={i === active}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
