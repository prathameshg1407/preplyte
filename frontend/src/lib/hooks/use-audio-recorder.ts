// src/lib/hooks/use-audio-recorder.ts

import { useRef, useState, useCallback, useEffect } from 'react';
import { logger } from '@/lib/utils/logger';

// =====================================================
// TYPES
// =====================================================

interface UseAudioRecorderOptions {
  onAudioData?: (data: ArrayBuffer) => void;
  sampleRate?: number;
  channelCount?: number;
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isSupported: boolean;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  volume: number;
}

// =====================================================
// CONSTANTS
// =====================================================

const DEFAULT_SAMPLE_RATE = 16000;
const DEFAULT_CHANNEL_COUNT = 1;
const BUFFER_SIZE = 4096;

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
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // ===================================================
  // CHECK SUPPORT
  // ===================================================

  useEffect(() => {
    const checkSupport = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setIsSupported(false);
          setError('Audio recording is not supported in this browser');
        }
      } catch (err) {
        setIsSupported(false);
        setError('Audio recording is not available');
      }
    };

    checkSupport();
  }, []);

  // ===================================================
  // VOLUME MONITORING
  // ===================================================

  const updateVolume = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setVolume(average / 255);

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    }
  }, [isRecording]);

  // ===================================================
  // START RECORDING
  // ===================================================

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      logger.info('[AudioRecorder] Starting recording');

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate,
          channelCount,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext({ sampleRate });
      audioContextRef.current = audioContext;

      // Create source from stream
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create analyser for volume monitoring
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);

      // Create processor for audio data
      const processor = audioContext.createScriptProcessor(BUFFER_SIZE, channelCount, channelCount);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (!isRecording) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = float32ToPCM16(inputData);
        onAudioData?.(pcmData);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);

      // Start volume monitoring
      animationFrameRef.current = requestAnimationFrame(updateVolume);

      logger.info('[AudioRecorder] Recording started');
    } catch (err: any) {
      logger.error('[AudioRecorder] Failed to start recording', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.');
      } else {
        setError('Failed to start recording');
      }
    }
  }, [sampleRate, channelCount, onAudioData, updateVolume, isRecording]);

  // ===================================================
  // STOP RECORDING
  // ===================================================

  const stopRecording = useCallback(() => {
    logger.info('[AudioRecorder] Stopping recording');

    setIsRecording(false);

    // Stop animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Disconnect processor
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    // Disconnect source
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    analyserRef.current = null;
    setVolume(0);

    logger.info('[AudioRecorder] Recording stopped');
  }, []);

  // ===================================================
  // CLEANUP
  // ===================================================

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  // ===================================================
  // RETURN
  // ===================================================

  return {
    isRecording,
    isSupported,
    error,
    startRecording,
    stopRecording,
    volume,
  };
}

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