"use client";

import type { CoachVoiceQuickResult } from "@/lib/coachVoiceQuickParse";
import { parseCoachVoiceQuick } from "@/lib/coachVoiceQuickParse";
import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: { length: number; [i: number]: { 0: { transcript: string } } };
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type CoachVoiceInputErrorKey =
  | "notAllowed"
  | "noSpeech"
  | "aborted"
  | "unknown";

export type UseCoachVoiceInputOptions = {
  locale: "fi" | "en";
  onParsed: (result: CoachVoiceQuickResult, rawTranscript: string) => void;
};

export type UseCoachVoiceInputResult = {
  supported: boolean;
  isListening: boolean;
  lastRawTranscript: string;
  lastErrorKey: CoachVoiceInputErrorKey | null;
  startListening: () => void;
  stopListening: () => void;
};

/**
 * Yhteinen pikakirjaus (ruoka, liike, paino, muistiinpano) — sama Web Speech -malli kuin treenissä.
 */
const LISTEN_MAX_MS = 25_000;

export function useCoachVoiceInput(
  options: UseCoachVoiceInputOptions,
): UseCoachVoiceInputResult {
  const { locale, onParsed } = options;
  const onParsedRef = useRef(onParsed);
  onParsedRef.current = onParsed;

  const [supported, setSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [lastRawTranscript, setLastRawTranscript] = useState("");
  const [lastErrorKey, setLastErrorKey] = useState<CoachVoiceInputErrorKey | null>(
    null,
  );

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const listenMaxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSupported(getSpeechRecognitionCtor() !== null);
  }, []);

  const stopListening = useCallback(() => {
    if (listenMaxTimer.current) {
      clearTimeout(listenMaxTimer.current);
      listenMaxTimer.current = null;
    }
    const r = recRef.current;
    if (r) {
      try {
        r.abort();
      } catch {
        /* ignore */
      }
    }
    recRef.current = null;
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      return;
    }

    setLastErrorKey(null);
    setLastRawTranscript("");

    try {
      const rec = new Ctor();
      rec.lang = locale === "en" ? "en-US" : "fi-FI";
      rec.continuous = false;
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onresult = (ev: SpeechRecognitionEventLike) => {
        let text = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          text += ev.results[i][0].transcript;
        }
        const trimmed = text.trim();
        setLastRawTranscript(trimmed);
        const parsed = parseCoachVoiceQuick(trimmed, locale);
        onParsedRef.current(parsed, trimmed);
      };

      rec.onerror = (ev: { error: string }) => {
        if (ev.error === "aborted") return;
        const map: Record<string, CoachVoiceInputErrorKey> = {
          "not-allowed": "notAllowed",
          "service-not-allowed": "notAllowed",
          "no-speech": "noSpeech",
          aborted: "aborted",
        };
        setLastErrorKey(map[ev.error] ?? "unknown");
      };

      rec.onend = () => {
        if (listenMaxTimer.current) {
          clearTimeout(listenMaxTimer.current);
          listenMaxTimer.current = null;
        }
        recRef.current = null;
        setIsListening(false);
      };

      recRef.current = rec;
      setIsListening(true);
      if (listenMaxTimer.current) clearTimeout(listenMaxTimer.current);
      listenMaxTimer.current = setTimeout(() => {
        listenMaxTimer.current = null;
        console.warn("[voice] coach quick listen max duration — stopping");
        stopListening();
      }, LISTEN_MAX_MS);
      rec.start();
    } catch {
      setSupported(false);
      setIsListening(false);
    }
  }, [locale, stopListening]);

  useEffect(() => () => stopListening(), [stopListening]);

  return {
    supported,
    isListening,
    lastRawTranscript,
    lastErrorKey,
    startListening,
    stopListening,
  };
}
