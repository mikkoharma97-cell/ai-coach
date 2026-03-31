"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { getHelpVideo, isHelpNoviceUser } from "@/lib/helpVideos";
import {
  isHelpCardDismissed,
  setHelpCardDismissed,
} from "@/lib/helpVideoStorage";
import type { HelpVideoPageId } from "@/types/help";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Props = {
  pageId: HelpVideoPageId;
  className?: string;
  /** Kun false (esim. `showHelpVideos`), ei renderöidä. */
  enabled?: boolean;
  /**
   * Tiivis `<details>` + “Katso 30 s ohje” — sisältö avautuu napauttamalla (ei modaalia).
   * Kun false, koko kortti näkyvissä (esim. tiivis embed).
   */
  collapsible?: boolean;
};

function PlayTriangleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Kun videota ei ole — kevyt explain-rivi, ei isoa tyhjää laatikkoa. */
function ExplainFallbackCompact({
  title,
  description,
  duration,
  soonLabel,
}: {
  title: string;
  description: string;
  duration: string;
  soonLabel: string;
}) {
  return (
    <div className="max-w-[min(100%,280px)] rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2.5">
      <p className="text-[12px] font-semibold leading-snug text-foreground">
        {title}
      </p>
      <p className="mt-1 line-clamp-3 text-[11px] leading-snug text-muted">
        {description}
      </p>
      <p className="mt-1.5 text-[10px] font-medium tabular-nums text-muted-2">
        {duration} · {soonLabel}
      </p>
    </div>
  );
}

function VideoWithPlayOverlay({
  videoUrl,
  posterUrl,
  onPlayLabel,
}: {
  videoUrl: string;
  posterUrl?: string;
  onPlayLabel: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const onOverlayClick = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    void el.play();
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-white/10 sm:max-w-[min(100%,280px)]">
      <video
        ref={ref}
        className="aspect-video w-full bg-black/50 object-cover"
        controls
        playsInline
        preload="metadata"
        poster={posterUrl}
        src={videoUrl}
        onPlay={() => setStarted(true)}
      />
      {!started ? (
        <button
          type="button"
          onClick={onOverlayClick}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition hover:bg-black/40 active:bg-black/45"
          aria-label={onPlayLabel}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/92 pl-1 text-[var(--coach-bg)] shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
            <PlayTriangleIcon className="h-7 w-7" />
          </span>
        </button>
      ) : null}
    </div>
  );
}

export function HelpVideoCard({
  pageId,
  className = "",
  enabled = true,
  collapsible = true,
}: Props) {
  const { locale, t } = useTranslation();
  const item = getHelpVideo(pageId);
  const novice = isHelpNoviceUser();
  const baseId = useId();

  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    setDismissed(isHelpCardDismissed(pageId));
    setHydrated(true);
  }, [pageId]);

  const onDismiss = useCallback(() => {
    setHelpCardDismissed(pageId, true);
    setDismissed(true);
    setForceShow(false);
  }, [pageId]);

  if (!enabled) {
    return null;
  }

  if (!hydrated) {
    return null;
  }

  const title = locale === "en" ? item.titleEn : item.titleFi;
  const description =
    locale === "en" ? item.descriptionEn : item.descriptionFi;
  const duration =
    locale === "en" ? item.durationLabelEn : item.durationLabelFi;
  const bullets =
    locale === "en"
      ? (item.bulletsEn ?? [])
      : (item.bulletsFi ?? []);

  const compact = !novice;
  const showCard = !dismissed || forceShow;

  const hasVideo = Boolean(item.videoUrl);

  const mediaColumn: ReactNode = hasVideo ? (
    <VideoWithPlayOverlay
      videoUrl={item.videoUrl!}
      posterUrl={item.posterUrl}
      onPlayLabel={t("help.playVideo")}
    />
  ) : (
    <ExplainFallbackCompact
      title={title}
      description={description}
      duration={duration}
      soonLabel={t("help.videoSoon")}
    />
  );

  const body = (
    <div
      id={`coach-help-video-${pageId}`}
      className={`rounded-[var(--radius-xl)] border border-white/[0.08] bg-[rgba(12,16,28,0.55)] shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] backdrop-blur-md ${compact ? "px-3 py-3 sm:px-4" : "px-4 py-4 sm:px-5 sm:py-5"}`}
    >
      {hasVideo ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-2">
              {t("help.eyebrow")}
            </p>
            <h2
              className={`mt-1.5 font-semibold leading-snug tracking-[-0.03em] text-foreground ${compact ? "text-[14px]" : "text-[15px] sm:text-[16px]"}`}
            >
              {title}
            </h2>
            <p
              className={`mt-2 leading-relaxed text-muted ${compact ? "text-[12px]" : "text-[13px] sm:text-[14px]"}`}
            >
              {description}
            </p>
            <p className="mt-2 text-[11px] font-medium tabular-nums text-muted-2">
              {duration}
            </p>
          </div>
          <div className="flex w-full min-w-0 shrink-0 flex-col items-stretch gap-2 sm:w-auto sm:max-w-[min(100%,280px)] sm:items-end">
            {mediaColumn}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-2">
            {t("help.eyebrow")}
          </p>
          {mediaColumn}
        </div>
      )}

      {bullets.length > 0 ? (
        <ul className="mt-4 space-y-1.5 border-t border-white/[0.06] pt-4">
          {bullets.map((line) => (
            <li
              key={line}
              className="flex gap-2 text-[12px] leading-snug text-muted"
            >
              <span
                className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/70"
                aria-hidden
              />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--radius-lg)] bg-white/[0.08] px-4 text-[13px] font-semibold text-foreground transition hover:bg-white/[0.12]"
        >
          {t("help.dismissOk")}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="inline-flex min-h-[44px] items-center justify-center px-2 text-[12px] font-medium text-muted-2 underline-offset-2 transition hover:text-foreground hover:underline"
        >
          {t("help.dismissHide")}
        </button>
      </div>
    </div>
  );

  if (!showCard) {
    return (
      <div
        className={`flex flex-wrap items-center justify-end gap-2 ${className}`}
      >
        <button
          type="button"
          onClick={() => setForceShow(true)}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-2 text-[12px] font-semibold text-muted transition hover:border-accent/35 hover:text-foreground"
        >
          <span className="text-[14px] leading-none text-accent" aria-hidden>
            ?
          </span>
          {t("help.showAgain")}
        </button>
      </div>
    );
  }

  if (collapsible) {
    return (
      <details
        className={`group rounded-[var(--radius-lg)] border border-white/[0.07] bg-white/[0.02] ${className}`}
        id={`${baseId}-help-wrap`}
      >
        <summary
          className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-left marker:content-none [&::-webkit-details-marker]:hidden"
          aria-controls={`coach-help-video-${pageId}`}
        >
          <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-accent">
            {t("help.watch30s")}
          </span>
          <span className="text-muted-2 transition group-open:rotate-180">
            <ChevronIcon className="shrink-0 opacity-80" />
          </span>
        </summary>
        <div className="border-t border-white/[0.06] px-2 pb-2 pt-2 sm:px-3 sm:pb-3">
          {body}
        </div>
      </details>
    );
  }

  return <div className={className}>{body}</div>;
}
