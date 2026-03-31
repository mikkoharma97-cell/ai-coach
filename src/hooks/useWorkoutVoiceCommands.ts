"use client";

import {
  normalizeVoiceTranscript,
  parseWorkoutVoiceCommand,
  type WorkoutVoiceCommand,
} from "@/lib/workout/voiceParser";
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

export type UseWorkoutVoiceCommandsOptions = {
  /** `fi` → fi-FI, `en` → en-US */
  locale: "fi" | "en";
  /** Called once per push-to-talk session with the first successfully parsed command, or null */
  onCommand: (command: WorkoutVoiceCommand | null, rawTranscript: string) => void;
};

export type WorkoutVoiceErrorKey = "notAllowed" | "noSpeech" | "aborted" | "unknown";

export type UseWorkoutVoiceCommandsResult = {
  supported: boolean;
  isListening: boolean;
  lastRawTranscript: string;
  lastErrorKey: WorkoutVoiceErrorKey | null;
  startListening: () => void;
  stopListening: () => void;
};

/**
 * Push-to-talk Web Speech API (one utterance per press).
 * If the browser lacks SpeechRecognition, `supported` is false.
 */
/** Failsafe if browser never fires onend (stuck “listening”). */
const LISTEN_MAX_MS = 25_000;

export function useWorkoutVoiceCommands(
  options: UseWorkoutVoiceCommandsOptions,
): UseWorkoutVoiceCommandsResult {
  const { locale, onCommand } = options;
  const onCommandRef = useRef(onCommand);
  onCommandRef.current = onCommand;

  const [supported, setSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [lastRawTranscript, setLastRawTranscript] = useState("");
  const [lastErrorKey, setLastErrorKey] = useState<WorkoutVoiceErrorKey | null>(
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
        const normalized = normalizeVoiceTranscript(trimmed);
        const cmd = parseWorkoutVoiceCommand(normalized);
        onCommandRef.current(cmd, trimmed);
      };

      rec.onerror = (ev: { error: string }) => {
        if (ev.error === "aborted") return;
        const map: Record<string, WorkoutVoiceErrorKey> = {
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
        console.warn("[voice] workout listen max duration — stopping");
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
