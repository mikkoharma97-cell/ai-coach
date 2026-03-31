"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useRef } from "react";

export type ExerciseMediaExercise = {
  name: string;
  target: string;
  videoUrl?: string;
  videoPoster?: string;
  coachTipFi?: string;
  coachTipEn?: string;
  coachMistakeFi?: string;
  coachMistakeEn?: string;
  coachFocusFi?: string;
  coachFocusEn?: string;
};

type Props = {
  exercise: ExerciseMediaExercise;
  index: number;
  total: number;
};

/** Vain video / fallback — swipe-paneelin “Media”-välilehti. */
export function ExerciseMediaVideoSlot({
  exercise,
}: {
  exercise: ExerciseMediaExercise;
}) {
  const { t, locale } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const tip =
    locale === "en"
      ? exercise.coachTipEn ?? exercise.coachTipFi
      : exercise.coachTipFi ?? exercise.coachTipEn;

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !exercise.videoUrl) return;
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    el.setAttribute("muted", "");
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.catch(() => {});
    }
  }, [exercise.videoUrl, exercise.name]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] bg-black/40">
      {exercise.videoUrl ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          controls
          playsInline
          muted
          loop
          poster={exercise.videoPoster}
          preload="metadata"
        >
          <source src={exercise.videoUrl} />
        </video>
      ) : (
        <div className="relative flex h-full min-h-[160px] flex-col items-center justify-center gap-3 overflow-hidden px-4 text-center">
          <div
            className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(80%_80%_at_50%_40%,rgba(59,130,246,0.25),transparent_70%)]"
            aria-hidden
          />
          <div
            className="relative h-14 w-14 rounded-full border-2 border-accent/40 border-t-transparent animate-spin"
            style={{ animationDuration: "2.8s" }}
            aria-hidden
          />
          <div className="relative space-y-1">
            <p className="text-[13px] font-semibold text-foreground/95">
              {t("workout.exercise.videoFallbackTitle")}
            </p>
            <p className="max-w-xs text-[12px] leading-relaxed text-muted-2">
              {t("workout.exercise.videoFallbackBody")}
            </p>
          </div>
          {tip ? (
            <p className="relative mt-1 max-w-sm text-[12px] leading-relaxed text-muted">
              {tip}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

/** Ohjeet — swipe-paneelin “Ohje”-välilehti (eri kuin video). */
export function ExerciseCoachTipsPanel({
  exercise,
}: {
  exercise: ExerciseMediaExercise;
}) {
  const { t, locale } = useTranslation();
  const tip =
    locale === "en"
      ? exercise.coachTipEn ?? exercise.coachTipFi
      : exercise.coachTipFi ?? exercise.coachTipEn;
  const mistake =
    locale === "en"
      ? exercise.coachMistakeEn ?? exercise.coachMistakeFi
      : exercise.coachMistakeFi ?? exercise.coachMistakeEn;
  const focus =
    locale === "en"
      ? exercise.coachFocusEn ?? exercise.coachFocusFi
      : exercise.coachFocusFi ?? exercise.coachFocusEn;

  if (!tip && !mistake && !focus) {
    return (
      <p className="text-[13px] leading-relaxed text-muted-2">
        {t("workout.exercise.coachTipPlaceholder")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {tip ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent/90">
            {t("workout.exercise.coachTipLabel")}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            {tip}
          </p>
        </div>
      ) : null}
      {mistake ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("workout.exercise.coachMistakeLabel")}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            {mistake}
          </p>
        </div>
      ) : null}
      {focus ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
            {t("workout.exercise.coachFocusLabel")}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            {focus}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function ExerciseMediaPanel({ exercise, index, total }: Props) {
  const { t, locale } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const tip =
    locale === "en"
      ? exercise.coachTipEn ?? exercise.coachTipFi
      : exercise.coachTipFi ?? exercise.coachTipEn;
  const mistake =
    locale === "en"
      ? exercise.coachMistakeEn ?? exercise.coachMistakeFi
      : exercise.coachMistakeFi ?? exercise.coachMistakeEn;
  const focus =
    locale === "en"
      ? exercise.coachFocusEn ?? exercise.coachFocusFi
      : exercise.coachFocusFi ?? exercise.coachFocusEn;

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !exercise.videoUrl) return;
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    el.setAttribute("muted", "");
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.catch(() => {
        /* autoplay estetty — käyttäjä voi painaa play */
      });
    }
  }, [exercise.videoUrl, exercise.name]);

  return (
    <div className="mt-4 overflow-hidden rounded-[var(--radius-xl)] border border-white/[0.08] bg-white/[0.03]">
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-2">
          {t("workout.exercise.activeEyebrow", { current: index + 1, total })}
        </p>
        <p className="mt-1 text-[1.05rem] font-semibold text-foreground">
          {exercise.name}
        </p>
        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-2">
          {exercise.target}
        </p>
        <p className="mt-2 text-[12px] font-semibold leading-snug text-accent/95">
          {t("workout.exercise.watchCue")}
        </p>
      </div>
      <div className="relative aspect-video w-full bg-black/40">
        {exercise.videoUrl ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            controls
            playsInline
            muted
            loop
            poster={exercise.videoPoster}
            preload="metadata"
          >
            <source src={exercise.videoUrl} />
          </video>
        ) : (
          <div className="relative flex h-full min-h-[140px] flex-col items-center justify-center gap-3 overflow-hidden px-4 text-center">
            <div
              className="pointer-events-none absolute inset-0 animate-pulse bg-[radial-gradient(80%_80%_at_50%_40%,rgba(59,130,246,0.25),transparent_70%)]"
              aria-hidden
            />
            <div
              className="relative h-16 w-16 rounded-full border-2 border-accent/40 border-t-transparent animate-spin"
              style={{ animationDuration: "2.8s" }}
              aria-hidden
            />
            <div className="relative space-y-1">
              <p className="text-[13px] font-semibold text-foreground/95">
                {t("workout.exercise.videoFallbackTitle")}
              </p>
              <p className="max-w-xs text-[12px] leading-relaxed text-muted-2">
                {t("workout.exercise.videoFallbackBody")}
              </p>
            </div>
            {tip ? (
              <p className="relative mt-1 max-w-sm text-[12px] leading-relaxed text-muted">
                {tip}
              </p>
            ) : null}
          </div>
        )}
      </div>
      {exercise.videoUrl ? (
        tip || mistake || focus ? (
          <div className="space-y-3 border-t border-white/[0.06] bg-white/[0.02] px-4 py-3">
            {tip ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-accent/90">
                  {t("workout.exercise.coachTipLabel")}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  {tip}
                </p>
              </div>
            ) : null}
            {mistake ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                  {t("workout.exercise.coachMistakeLabel")}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  {mistake}
                </p>
              </div>
            ) : null}
            {focus ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-2">
                  {t("workout.exercise.coachFocusLabel")}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">
                  {focus}
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="border-t border-white/[0.06] px-4 py-3">
            <p className="text-[12px] leading-relaxed text-muted-2">
              {t("workout.exercise.coachTipPlaceholder")}
            </p>
          </div>
        )
      ) : null}
    </div>
  );
}
