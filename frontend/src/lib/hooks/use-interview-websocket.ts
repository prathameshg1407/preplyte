// src/lib/hooks/use-interview-websocket.ts

import { useEffect, useRef, useCallback, useState } from 'react';
import { useInterviewStore } from '@/lib/store/interview-store';
import { interviewService } from '@/lib/api/services/interview.service';
import { useAuthStore } from '@/lib/store/auth-store';
import { logger } from '@/lib/utils/logger';
import type {
  WSMessage,
  ConversationMessage,
  QuestionCategory,
} from '@/types/interview.types';

// =====================================================
// CONSTANTS
// =====================================================

const WS_EVENTS = {
  CLIENT: {
    AUDIO_CHUNK: 'audio_chunk',
    START_RECORDING: 'start_recording',
    STOP_RECORDING: 'stop_recording',
    END_INTERVIEW: 'end_interview',
    PAUSE: 'pause',
    RESUME: 'resume',
    PING: 'ping',
  },
  SERVER: {
    CONNECTED: 'connected',
    SESSION_READY: 'session_ready',
    TRANSCRIPTION: 'transcription',
    TRANSCRIPTION_FINAL: 'transcription_final',
    AI_THINKING: 'ai_thinking',
    AI_SPEAKING: 'ai_speaking',
    AI_AUDIO: 'ai_audio',
    AI_DONE: 'ai_done',
    SESSION_STATE: 'session_state',
    INTERVIEW_ENDED: 'interview_ended',
    ERROR: 'error',
    PONG: 'pong',
  },
};

// =====================================================
// TYPES
// =====================================================

interface UseInterviewWebSocketOptions {
  sessionId: string;
  onAudioReceived?: (audioData: ArrayBuffer) => void;
  onInterviewEnded?: (feedbackUrl: string) => void;
}

interface UseInterviewWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
  sendAudio: (audioData: ArrayBuffer) => void;
  startRecording: () => void;
  stopRecording: () => void;
  endInterview: (reason?: string) => void;
  pause: () => void;
  resume: () => void;
}

// =====================================================
// HOOK
// =====================================================

export function useInterviewWebSocket(
  options: UseInterviewWebSocketOptions
): UseInterviewWebSocketReturn {
  const { sessionId, onAudioReceived, onInterviewEnded } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);

  const [isConnecting, setIsConnecting] = useState(false);

  const { accessToken } = useAuthStore();
  const {
    setConnected,
    setConnecting,
    setRecording,
    setAISpeaking,
    setProcessing,
    setCurrentTranscript,
    appendTranscript,
    setError,
    setProgress,
    setCurrentQuestion,
    addMessage,
    updateSessionStatus,
  } = useInterviewStore();

  const isConnected = useInterviewStore((state) => state.ui.isConnected);

  // ===================================================
  // SEND MESSAGE
  // ===================================================

  const sendMessage = useCallback((type: string, data?: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type,
          data,
          timestamp: Date.now(),
        })
      );
    }
  }, []);

  // ===================================================
  // MESSAGE HANDLERS
  // ===================================================

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        // Handle binary audio data
        if (event.data instanceof Blob) {
          event.data.arrayBuffer().then((buffer) => {
            onAudioReceived?.(buffer);
          });
          return;
        }

        const message: WSMessage = JSON.parse(event.data);
        logger.debug('[WS] Received message', { type: message.type });

        switch (message.type) {
          case WS_EVENTS.SERVER.CONNECTED:
            logger.info('[WS] Connected to interview session');
            break;

          case WS_EVENTS.SERVER.SESSION_READY:
            setConnected(true);
            setConnecting(false);
            const readyData = message.data as any;
            if (readyData.currentQuestion) {
              setCurrentQuestion(readyData.currentQuestion);
            }
            break;

          case WS_EVENTS.SERVER.TRANSCRIPTION:
            const transcriptData = message.data as { text: string; isFinal: boolean };
            setCurrentTranscript(transcriptData.text);
            break;

          case WS_EVENTS.SERVER.TRANSCRIPTION_FINAL:
            const finalData = message.data as { text: string };
            // Add user message to conversation
            addMessage({
              id: `user-${Date.now()}`,
              role: 'user',
              content: finalData.text,
              timestamp: new Date(),
            });
            setCurrentTranscript('');
            setRecording(false);
            setProcessing(true);
            break;

          case WS_EVENTS.SERVER.AI_THINKING:
            setProcessing(true);
            break;

          case WS_EVENTS.SERVER.AI_SPEAKING:
            setProcessing(false);
            setAISpeaking(true);
            const speakingData = message.data as {
              text: string;
              category: QuestionCategory;
              isFollowUp?: boolean;
            };
            addMessage({
              id: `ai-${Date.now()}`,
              role: 'assistant',
              content: speakingData.text,
              timestamp: new Date(),
              category: speakingData.category,
              isFollowUp: speakingData.isFollowUp,
            });
            break;

          case WS_EVENTS.SERVER.AI_AUDIO:
            const audioData = message.data as { chunk: string; isLast: boolean };
            // Decode base64 and queue audio
            const binaryString = atob(audioData.chunk);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            onAudioReceived?.(bytes.buffer);
            break;

          case WS_EVENTS.SERVER.AI_DONE:
            setAISpeaking(false);
            setRecording(true);
            break;

          case WS_EVENTS.SERVER.SESSION_STATE:
            const stateData = message.data as any;
            setProgress(stateData.progress);
            if (stateData.currentQuestion) {
              setCurrentQuestion(stateData.currentQuestion);
            }
            break;

          case WS_EVENTS.SERVER.INTERVIEW_ENDED:
            const endData = message.data as { sessionId: string; reason: string; feedbackUrl: string };
            updateSessionStatus('COMPLETED');
            setConnected(false);
            onInterviewEnded?.(endData.feedbackUrl);
            break;

          case WS_EVENTS.SERVER.ERROR:
            const errorData = message.data as { code: string; message: string; recoverable: boolean };
            setError(errorData.message);
            if (!errorData.recoverable) {
              disconnect();
            }
            break;

          case WS_EVENTS.SERVER.PONG:
            // Keep-alive acknowledged
            break;

          default:
            logger.warn('[WS] Unknown message type', { type: message.type });
        }
      } catch (error) {
        logger.error('[WS] Failed to parse message', error);
      }
    },
    [
      addMessage,
      onAudioReceived,
      onInterviewEnded,
      setAISpeaking,
      setConnected,
      setConnecting,
      setCurrentQuestion,
      setCurrentTranscript,
      setError,
      setProcessing,
      setProgress,
      setRecording,
      updateSessionStatus,
    ]
  );

  // ===================================================
  // CONNECTION MANAGEMENT
  // ===================================================

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      logger.debug('[WS] Already connected');
      return;
    }

    if (!accessToken) {
      setError('Not authenticated');
      return;
    }

    setIsConnecting(true);
    setConnecting(true);

    const wsUrl = interviewService.getWebSocketUrl(sessionId, accessToken);
    logger.info('[WS] Connecting to', { wsUrl: wsUrl.replace(/token=.*/, 'token=***') });

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      logger.info('[WS] Connection opened');
      setIsConnecting(false);
      startPingInterval();
    };

    ws.onmessage = handleMessage;

    ws.onerror = (error) => {
      logger.error('[WS] Connection error', error);
      setError('Connection error');
    };

    ws.onclose = (event) => {
      logger.info('[WS] Connection closed', { code: event.code, reason: event.reason });
      setConnected(false);
      setIsConnecting(false);
      stopPingInterval();

      // Attempt reconnect for unexpected closes
      if (event.code !== 1000 && event.code !== 1001) {
        scheduleReconnect();
      }
    };
  }, [accessToken, handleMessage, sessionId, setConnected, setConnecting, setError]);

  const disconnect = useCallback(() => {
    logger.info('[WS] Disconnecting');

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    stopPingInterval();

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }

    setConnected(false);
  }, [setConnected]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) return;

    logger.info('[WS] Scheduling reconnect in 3s');
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connect();
    }, 3000);
  }, [connect]);

  const startPingInterval = useCallback(() => {
    pingIntervalRef.current = setInterval(() => {
      sendMessage(WS_EVENTS.CLIENT.PING);
    }, 30000);
  }, [sendMessage]);

  const stopPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  // ===================================================
  // AUDIO ACTIONS
  // ===================================================

  const sendAudio = useCallback(
    (audioData: ArrayBuffer) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(audioData);
      }
    },
    []
  );

  const startRecording = useCallback(() => {
    sendMessage(WS_EVENTS.CLIENT.START_RECORDING);
    setRecording(true);
    setCurrentTranscript('');
  }, [sendMessage, setRecording, setCurrentTranscript]);

  const stopRecording = useCallback(() => {
    sendMessage(WS_EVENTS.CLIENT.STOP_RECORDING);
    setRecording(false);
  }, [sendMessage, setRecording]);

  // ===================================================
  // INTERVIEW CONTROL ACTIONS
  // ===================================================

  const endInterview = useCallback(
    (reason: string = 'completed') => {
      sendMessage(WS_EVENTS.CLIENT.END_INTERVIEW, { reason });
    },
    [sendMessage]
  );

  const pause = useCallback(() => {
    sendMessage(WS_EVENTS.CLIENT.PAUSE);
    setRecording(false);
  }, [sendMessage, setRecording]);

  const resume = useCallback(() => {
    sendMessage(WS_EVENTS.CLIENT.RESUME);
  }, [sendMessage]);

  // ===================================================
  // CLEANUP
  // ===================================================

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // ===================================================
  // RETURN
  // ===================================================

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendAudio,
    startRecording,
    stopRecording,
    endInterview,
    pause,
    resume,
  };
}