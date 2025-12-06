// src/lib/hooks/use-audio-player.ts

import { useRef, useState, useCallback, useEffect } from 'react';

// =====================================================
// TYPES
// =====================================================

interface UseAudioPlayerOptions {
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isBuffering: boolean;
  queueLength: number;
  queueAudio: (audioData: ArrayBuffer) => void;
  playAccumulated: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  clear: () => void;
  setVolume: (volume: number) => void;
}

// =====================================================
// HOOK
// =====================================================

export function useAudioPlayer(
  options: UseAudioPlayerOptions = {}
): UseAudioPlayerReturn {
  const { onPlaybackStart, onPlaybackEnd, onError } = options;

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [queueLength, setQueueLength] = useState(0);

  // Refs for audio context
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Refs for state management
  const isPausedRef = useRef(false);
  const volumeRef = useRef(1);
  const isProcessingRef = useRef(false);
  const mountedRef = useRef(true);

  // Refs for audio data
  const chunksRef = useRef<Uint8Array[]>([]);
  const completeAudioQueueRef = useRef<ArrayBuffer[]>([]);

  // Callback refs to avoid stale closures
  const onPlaybackStartRef = useRef(onPlaybackStart);
  const onPlaybackEndRef = useRef(onPlaybackEnd);
  const onErrorRef = useRef(onError);

  // Keep callback refs updated
  useEffect(() => {
    onPlaybackStartRef.current = onPlaybackStart;
    onPlaybackEndRef.current = onPlaybackEnd;
    onErrorRef.current = onError;
  }, [onPlaybackStart, onPlaybackEnd, onError]);

  // ===================================================
  // INITIALIZE AUDIO CONTEXT
  // ===================================================

  const getAudioContext = useCallback((): AudioContext => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volumeRef.current;
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
    return audioContextRef.current;
  }, []);

  const resumeContext = useCallback(async (): Promise<AudioContext> => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx;
  }, [getAudioContext]);

  // ===================================================
  // PLAY NEXT COMPLETE AUDIO
  // ===================================================

  const playNextCompleteRef = useRef<(() => Promise<void>) | null>(null);

  const playNextComplete = useCallback(async (): Promise<void> => {
    if (!mountedRef.current) return;
    if (isProcessingRef.current || isPausedRef.current) return;
    if (completeAudioQueueRef.current.length === 0) {
      setIsPlaying(false);
      return;
    }

    isProcessingRef.current = true;
    setIsPlaying(true);

    const audioData = completeAudioQueueRef.current.shift()!;

    try {
      const audioContext = await resumeContext();

      // Clone the buffer to avoid detached ArrayBuffer issues
      const audioBuffer = await audioContext.decodeAudioData(audioData.slice(0));

      if (!mountedRef.current) return;

      // Create source and play
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(gainNodeRef.current!);
      currentSourceRef.current = source;

      onPlaybackStartRef.current?.();

      source.onended = (): void => {
        currentSourceRef.current = null;
        isProcessingRef.current = false;

        if (!mountedRef.current) return;

        // Check if there's more to play
        if (completeAudioQueueRef.current.length > 0) {
          playNextCompleteRef.current?.();
        } else {
          setIsPlaying(false);
          onPlaybackEndRef.current?.();
        }
      };

      source.start(0);
    } catch (error) {
      console.error('[AudioPlayer] Failed to decode/play audio:', error);
      onErrorRef.current?.('Failed to play audio');
      isProcessingRef.current = false;
      currentSourceRef.current = null;

      if (!mountedRef.current) return;

      // Try next if available
      if (completeAudioQueueRef.current.length > 0) {
        playNextCompleteRef.current?.();
      } else {
        setIsPlaying(false);
        onPlaybackEndRef.current?.();
      }
    }
  }, [resumeContext]);

  // Set the ref for self-reference
  useEffect(() => {
    playNextCompleteRef.current = playNextComplete;
  }, [playNextComplete]);

  // ===================================================
  // QUEUE AUDIO CHUNK (accumulates for streaming)
  // ===================================================

  const queueAudio = useCallback((audioData: ArrayBuffer): void => {
    if (!mountedRef.current) return;

    chunksRef.current.push(new Uint8Array(audioData));
    setQueueLength(chunksRef.current.length);
    setIsBuffering(true);
  }, []);

  // ===================================================
  // PLAY ACCUMULATED AUDIO (call when AI is done)
  // ===================================================

  const playAccumulated = useCallback(async (): Promise<void> => {
    if (!mountedRef.current) return;

    if (chunksRef.current.length === 0) {
      console.log('[AudioPlayer] No audio chunks to play');
      setIsBuffering(false);
      return;
    }

    console.log('[AudioPlayer] Playing accumulated audio, chunks:', chunksRef.current.length);

    // Combine all chunks
    const totalLength = chunksRef.current.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunksRef.current) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    // Clear chunks
    chunksRef.current = [];
    setQueueLength(0);
    setIsBuffering(false);

    // Add to complete audio queue
    completeAudioQueueRef.current.push(combined.buffer);

    // Start playing if not already
    if (!isProcessingRef.current) {
      await playNextComplete();
    }
  }, [playNextComplete]);

  // ===================================================
  // PLAYBACK CONTROLS
  // ===================================================

  const play = useCallback(async (): Promise<void> => {
    isPausedRef.current = false;
    await resumeContext();

    if (!isProcessingRef.current && completeAudioQueueRef.current.length > 0) {
      await playNextComplete();
    }
  }, [resumeContext, playNextComplete]);

  const pause = useCallback((): void => {
    isPausedRef.current = true;

    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {
        // Ignore - already stopped
      }
      currentSourceRef.current = null;
    }

    isProcessingRef.current = false;
    setIsPlaying(false);
  }, []);

  const stop = useCallback((): void => {
    isPausedRef.current = false;

    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {
        // Ignore - already stopped
      }
      currentSourceRef.current = null;
    }

    isProcessingRef.current = false;
    setIsPlaying(false);
    setIsBuffering(false);
  }, []);

  const clear = useCallback((): void => {
    stop();
    chunksRef.current = [];
    completeAudioQueueRef.current = [];
    setQueueLength(0);
  }, [stop]);

  const setVolume = useCallback((volume: number): void => {
    volumeRef.current = Math.max(0, Math.min(1, volume));

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volumeRef.current;
    }
  }, []);

  // ===================================================
  // CLEANUP
  // ===================================================

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      // Stop current playback
      if (currentSourceRef.current) {
        try {
          currentSourceRef.current.stop();
        } catch {
          // Ignore
        }
        currentSourceRef.current = null;
      }

      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }

      gainNodeRef.current = null;
      chunksRef.current = [];
      completeAudioQueueRef.current = [];
    };
  }, []);

  return {
    isPlaying,
    isBuffering,
    queueLength,
    queueAudio,
    playAccumulated,
    play,
    pause,
    stop,
    clear,
    setVolume,
  };
}