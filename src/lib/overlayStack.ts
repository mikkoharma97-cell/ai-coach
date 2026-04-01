/**
 * Yksi overlay kerrallaan: uusi avaus sulkee edellisen (ei päällekkäisiä modaaleja).
 * Scroll-lukko + Escape — sama instanssi kuin useOverlayLayer.
 */

let activeCloser: (() => void) | null = null;
let scrollLockDepth = 0;

let escapeHandler: ((e: KeyboardEvent) => void) | null = null;
let prevBodyOverflow = "";
let prevHtmlOverflow = "";
let prevMainOverflow = "";
let mainEl: HTMLElement | null = null;

function removeEscapeListener(): void {
  if (escapeHandler) {
    window.removeEventListener("keydown", escapeHandler);
    escapeHandler = null;
  }
}

function applyScrollLock(): void {
  if (scrollLockDepth++ > 0) return;
  prevBodyOverflow = document.body.style.overflow;
  prevHtmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = "hidden";
  document.body.style.overscrollBehavior = "none";
  document.documentElement.style.overflow = "hidden";
  document.documentElement.style.overscrollBehavior = "none";
  document.documentElement.dataset.overlayOpen = "1";

  mainEl = document.querySelector<HTMLElement>(".app-main-scroll");
  prevMainOverflow = mainEl?.style.overflow ?? "";
  if (mainEl) {
    mainEl.style.overflow = "hidden";
    mainEl.style.overscrollBehavior = "none";
  }

  escapeHandler = (e: KeyboardEvent) => {
    if (e.key === "Escape" && activeCloser) activeCloser();
  };
  window.addEventListener("keydown", escapeHandler);
}

function releaseScrollLock(): void {
  scrollLockDepth = Math.max(0, scrollLockDepth - 1);
  if (scrollLockDepth > 0) return;

  removeEscapeListener();
  document.body.style.overflow = prevBodyOverflow;
  document.body.style.removeProperty("overscroll-behavior");
  document.documentElement.style.overflow = prevHtmlOverflow;
  document.documentElement.style.removeProperty("overscroll-behavior");
  delete document.documentElement.dataset.overlayOpen;
  if (mainEl) {
    mainEl.style.overflow = prevMainOverflow;
    mainEl.style.removeProperty("overscroll-behavior");
  }
  mainEl = null;
}

/** Uusi overlay: sulje edellinen ja lukitse scroll. */
export function pushOverlay(close: () => void): void {
  if (activeCloser) {
    const prev = activeCloser;
    activeCloser = null;
    releaseScrollLock();
    try {
      prev();
    } catch {
      /* ignore */
    }
  }
  activeCloser = close;
  applyScrollLock();
}

/** Sulje tämä overlay (vain jos se on aktiivinen). */
export function popOverlay(close: () => void): void {
  if (activeCloser !== close) return;
  activeCloser = null;
  releaseScrollLock();
}
