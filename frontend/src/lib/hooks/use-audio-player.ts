// src/lib/hooks/use-audio-player.ts

import { useRef, useState, useCallback, useEffect } from 'react';
import { logger } from '@/lib/utils/logger';

// =====================================================
// TYPES
// =====================================================

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  queueAudio: (audioData: ArrayBuffer) => void;
  play: () => Promise<void>;
  stop: () => void;
  clear: () => void;
}

// =====================================================
// HOOK
// =====================================================

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isProcessingRef = useRef(false);

  // ===================================================
  // INITIALIZE AUDIO CONTEXT
  // ===================================================

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // ===================================================
  // PLAY NEXT IN QUEUE
  // ===================================================

  const playNext = useCallback(async () => {
    if (isProcessingRef.current) return;
    if (audioQueueRef.current.length === 0) {
      setIsPlaying(false);
      return;
    }

    isProcessingRef.current = true;
    setIsPlaying(true);

    const audioData = audioQueueRef.current.shift()!;

    try {
      const audioContext = getAudioContext();

      // Resume context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Decode audio data
      const audioBuffer = await audioContext.decodeAudioData(audioData.slice(0));

      // Create source
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      currentSourceRef.current = source;

      // Play and wait for completion
      source.start();

      await new Promise<void>((resolve) => {
        source.onended = () => {
          resolve();
        };
      });
    } catch (error) {
      logger.error('[AudioPlayer] Failed to play audio', error);
    } finally {
      isProcessingRef.current = false;
      currentSourceRef.current = null;

      // Play next in queue
      playNext();
    }
  }, [getAudioContext]);

  // ===================================================
  // QUEUE AUDIO
  // ===================================================

  const queueAudio = useCallback(
    (audioData: ArrayBuffer) => {
      audioQueueRef.current.push(audioData);

      // Start playing if not already
      if (!isProcessingRef.current) {
        playNext();
      }
    },
    [playNext]
  );

  // ===================================================
  // PLAY
  // ===================================================

  const play = useCallback(async () => {
    if (!isProcessingRef.current && audioQueueRef.current.length > 0) {
      await playNext();
    }
  }, [playNext]);

  // ===================================================
  // STOP
  // ===================================================

  const stop = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (error) {
        // Ignore if already stopped
      }
      currentSourceRef.current = null;
    }

    isProcessingRef.current = false;
    setIsPlaying(false);
  }, []);

  // ===================================================
  // CLEAR
  // ===================================================

  const clear = useCallback(() => {
    stop();
    audioQueueRef.current = [];
  }, [stop]);

  // ===================================================
  // CLEANUP
  // ===================================================

  useEffect(() => {
    return () => {
      clear();
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [clear]);

  // ===================================================
  // RETURN
  // ===================================================

  return {
    isPlaying,
    queueAudio,
    play,
    stop,
    clear,
  };
}