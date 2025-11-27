// src/hooks/useSpeechRecognition.ts

import { useRef, useCallback, useEffect, useState } from "react";
import type {
  ISpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from "../../types/speech-recognition";

interface UseSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onSpeechDetected?: () => void;
}

interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  hasPermission: boolean | null;
  requestPermission: () => Promise<boolean>;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    language = "en-US",
    continuous = true,
    interimResults = true,
    onResult,
    onError,
    onEnd,
    onSpeechDetected,
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isIntentionalStopRef = useRef(false);
  const transcriptRef = useRef("");
  
  // Store callbacks in refs to avoid stale closures
  const callbacksRef = useRef({
    onResult,
    onError,
    onEnd,
    onSpeechDetected,
  });

  // Update callback refs when they change
  useEffect(() => {
    callbacksRef.current = {
      onResult,
      onError,
      onEnd,
      onSpeechDetected,
    };
  }, [onResult, onError, onEnd, onSpeechDetected]);

  // Initialize speech recognition once
  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    setIsSupported(!!SpeechRecognitionAPI);

    if (SpeechRecognitionAPI && !recognitionRef.current) {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = language;
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        let hasSpeech = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript.trim();
          const confidence = result[0].confidence || 0;

          if (text.length > 0 && confidence > 0.5) {
            hasSpeech = true;
          }

          if (result.isFinal) {
            transcriptRef.current += text + " ";
            setTranscript(transcriptRef.current);
            callbacksRef.current.onResult?.(text, true);
          } else {
            interim += text + " ";
          }
        }

        setInterimTranscript(interim);
        
        if (hasSpeech) {
          callbacksRef.current.onSpeechDetected?.();
        }

        if (interim) {
          callbacksRef.current.onResult?.(transcriptRef.current + interim, false);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        
        if (event.error !== "aborted" && event.error !== "no-speech") {
          callbacksRef.current.onError?.(event.error);
        } else if (event.error === "no-speech") {
          callbacksRef.current.onError?.(event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        
        if (!isIntentionalStopRef.current) {
          callbacksRef.current.onEnd?.();
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [language, continuous, interimResults]); // Remove callback deps

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      return true;
    } catch {
      setHasPermission(false);
      return false;
    }
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;

    isIntentionalStopRef.current = false;
    setInterimTranscript("");

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      callbacksRef.current.onError?.("Failed to start speech recognition");
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    isIntentionalStopRef.current = true;
    recognitionRef.current.stop();
    setIsListening(false);
    setInterimTranscript("");
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    hasPermission,
    requestPermission,
  };
}