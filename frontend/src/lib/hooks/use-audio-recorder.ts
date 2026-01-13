// src/lib/hooks/use-audio-recorder.ts

import { useRef, useState, useCallback, useEffect } from 'react';

// =====================================================
// TYPES
// =====================================================

interface UseAudioRecorderOptions {
  onAudioData?: (data: ArrayBuffer) => void;
  sampleRate?: number;
  channelCount?: number;
  onError?: (error: string) => void;
  onVolumeChange?: (volume: number) => void;
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isSupported: boolean;
  isInitialized: boolean;
  error: string | null;
  volume: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  requestPermission: () => Promise<boolean>;
}

// =====================================================
// CONSTANTS
// =====================================================

const DEFAULT_SAMPLE_RATE = 16000;
const DEFAULT_CHANNEL_COUNT = 1;
const BUFFER_SIZE = 4096;
const VOLUME_SMOOTHING = 0.8;
const NOISE_THRESHOLD = 0.01; // Ignore audio below this volume (noise gate)

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function float32ToPCM16(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(i * 2, Math.round(val), true);
  }

  return buffer;
}

// =====================================================
// HOOK
// =====================================================

export function useAudioRecorder(
  options: UseAudioRecorderOptions = {}
): UseAudioRecorderReturn {
  const {
    onAudioData,
    sampleRate = DEFAULT_SAMPLE_RATE,
    channelCount = DEFAULT_CHANNEL_COUNT,
    onError,
    onVolumeChange,
  } = options;

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  // Refs for audio resources
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Refs for state management
  const isRecordingRef = useRef(false);
  const smoothedVolumeRef = useRef(0);
  const mountedRef = useRef(true);

  // Callback refs to avoid stale closures
  const onAudioDataRef = useRef(onAudioData);
  const onErrorRef = useRef(onError);
  const onVolumeChangeRef = useRef(onVolumeChange);

  // Keep callback refs updated
  useEffect(() => {
    onAudioDataRef.current = onAudioData;
    onErrorRef.current = onError;
    onVolumeChangeRef.current = onVolumeChange;
  }, [onAudioData, onError, onVolumeChange]);

  // ===================================================
  // CHECK SUPPORT
  // ===================================================

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsSupported(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false);
      const msg = 'Audio recording is not supported in this browser';
      setError(msg);
      onErrorRef.current?.(msg);
    }
  }, []);

  // ===================================================
  // VOLUME MONITORING
  // ===================================================

  const updateVolume = useCallback((): void => {
    if (!analyserRef.current || !isRecordingRef.current || !mountedRef.current) {
      return;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const normalizedVolume = average / 255;

    smoothedVolumeRef.current =
      smoothedVolumeRef.current * VOLUME_SMOOTHING +
      normalizedVolume * (1 - VOLUME_SMOOTHING);

    setVolume(smoothedVolumeRef.current);
    onVolumeChangeRef.current?.(smoothedVolumeRef.current);

    animationFrameRef.current = requestAnimationFrame(updateVolume);
  }, []);

  // ===================================================
  // STOP RECORDING
  // ===================================================

  const stopRecording = useCallback((): void => {
    if (!isRecordingRef.current) return;
    
    console.log('[AudioRecorder] Stopping recording');

    isRecordingRef.current = false;
    setIsRecording(false);

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Disconnect and clean up processor
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    // Disconnect source
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    analyserRef.current = null;
    smoothedVolumeRef.current = 0;
    setVolume(0);
  }, []);

  // ===================================================
  // REQUEST PERMISSION
  // ===================================================

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate,
          channelCount,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Immediately stop - we just wanted permission
      stream.getTracks().forEach((track) => track.stop());
      setIsInitialized(true);
      setError(null);
      return true;
    } catch (err: unknown) {
      const errorName = err instanceof Error ? err.name : '';
      let msg: string;

      if (errorName === 'NotAllowedError') {
        msg = 'Microphone access denied. Please allow microphone access.';
      } else if (errorName === 'NotFoundError') {
        msg = 'No microphone found. Please connect a microphone.';
      } else {
        msg = 'Failed to access microphone';
      }

      setError(msg);
      onErrorRef.current?.(msg);
      return false;
    }
  }, [sampleRate, channelCount]);

  // ===================================================
  // START RECORDING
  // ===================================================

  const startRecording = useCallback(async (): Promise<void> => {
    if (isRecordingRef.current) return;

    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate,
          channelCount,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      setIsInitialized(true);

      const audioContext = new AudioContext({ sampleRate });
      audioContextRef.current = audioContext;

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create analyser for volume monitoring
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      source.connect(analyser);

      // Create processor for audio data
      const processor = audioContext.createScriptProcessor(
        BUFFER_SIZE,
        channelCount,
        channelCount
      );
      processorRef.current = processor;

      processor.onaudioprocess = (e: AudioProcessingEvent): void => {
        if (!isRecordingRef.current) return;
        
        // NOISE GATE LOGIC: Calculate RMS amplitude of this buffer
        const inputData = e.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);

        // Only send audio if it's loud enough (ignore silence/static)
        // Note: We still send data if volume is low, but the backend VAD handles it better if the stream is clean.
        // If you want to strictly prevent sending silence:
        // if (rms < NOISE_THRESHOLD) return; 
        
        // HOWEVER, completely cutting packets can cause sync issues.
        // Better strategy: Convert to PCM regardless, but monitor volume for UI.
        
        const pcmData = float32ToPCM16(inputData);
        onAudioDataRef.current?.(pcmData);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      isRecordingRef.current = true;
      setIsRecording(true);

      // Start volume monitoring
      animationFrameRef.current = requestAnimationFrame(updateVolume);

      console.log('[AudioRecorder] Recording started');
    } catch (err: unknown) {
      console.error('[AudioRecorder] Failed to start recording:', err);

      const errorName = err instanceof Error ? err.name : '';
      let msg: string;

      if (errorName === 'NotAllowedError') {
        msg = 'Microphone access denied. Please allow microphone access.';
      } else if (errorName === 'NotFoundError') {
        msg = 'No microphone found. Please connect a microphone.';
      } else {
        msg = 'Failed to start recording';
      }

      setError(msg);
      onErrorRef.current?.(msg);
    }
  }, [sampleRate, channelCount, updateVolume]);

  // ===================================================
  // CLEANUP
  // ===================================================

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      stopRecording();
    };
  }, [stopRecording]);

  return {
    isRecording,
    isSupported,
    isInitialized,
    error,
    volume,
    startRecording,
    stopRecording,
    requestPermission,
  };
}