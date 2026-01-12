// src/lib/hooks/use-interview-websocket.ts

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useInterviewStore } from '@/lib/store/interview-store';
import { interviewService } from '@/lib/api/services/interview.service';
import { useAuthStore } from '@/lib/store/auth-store';
import type {
  WSMessage,
  WSSessionReadyData,
  WSTranscriptionData,
  WSAISpeakingData,
  WSAIAudioData,
  WSSessionStateData,
  WSInterviewEndedData,
  WSErrorData,
  ConversationMessage,
} from '@/types/interview.types';

// =====================================================
// CONSTANTS
// =====================================================

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

// =====================================================
// TYPES
// =====================================================

interface UseInterviewWebSocketOptions {
  sessionId: string;
  onAudioReceived?: (audioData: ArrayBuffer) => void;
  onInterviewEnded?: (feedbackUrl: string) => void;
  onError?: (error: { code: string; message: string }) => void;
  autoConnect?: boolean;
}

interface UseInterviewWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  connectionAttempts: number;
  connect: () => void;
  disconnect: () => void;
  sendAudio: (audioData: ArrayBuffer) => void;
  startRecording: () => void;
  stopRecording: () => void;
  endInterview: (reason?: 'completed' | 'cancelled' | 'timeout') => void;
  pause: () => void;
  resume: () => void;
}

// =====================================================
// HOOK
// =====================================================

export function useInterviewWebSocket(
  options: UseInterviewWebSocketOptions
): UseInterviewWebSocketReturn {
  const {
    sessionId,
    onAudioReceived,
    onInterviewEnded,
    onError,
    autoConnect = false,
  } = options;

  // ===================================================
  // REFS
  // ===================================================

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const isManualDisconnectRef = useRef(false);
  const mountedRef = useRef(false);
  const connectingRef = useRef(false);
  const connectedRef = useRef(false);
  const messageIdRef = useRef(0);
  const sessionIdRef = useRef(sessionId);
  const lastServerActivityRef = useRef<number>(Date.now());

  // Callback refs
  const onAudioReceivedRef = useRef(onAudioReceived);
  const onInterviewEndedRef = useRef(onInterviewEnded);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    onAudioReceivedRef.current = onAudioReceived;
    onInterviewEndedRef.current = onInterviewEnded;
    onErrorRef.current = onError;
  }, [onAudioReceived, onInterviewEnded, onError]);

  // ===================================================
  // AUTH & STORE
  // ===================================================

  const accessToken = useAuthStore((state) => state.accessToken);
  const accessTokenRef = useRef(accessToken);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const store = useInterviewStore();
  const storeRef = useRef(store);

  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  const ui = useInterviewStore((state) => state.ui);

  // ===================================================
  // HELPERS
  // ===================================================

  const clearAllTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(<T = unknown>(type: string, data?: T): boolean => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      const message: WSMessage<T> = {
        type,
        data,
        timestamp: Date.now(),
      };
      ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // ===================================================
  // DISCONNECT
  // ===================================================

  const disconnect = useCallback(() => {
    console.log('[WS] Disconnect called');
    isManualDisconnectRef.current = true;
    connectingRef.current = false;
    connectedRef.current = false;

    clearAllTimeouts();

    const ws = wsRef.current;
    if (ws) {
      wsRef.current = null;

      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;

      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        try {
          ws.close(1000, 'User disconnect');
        } catch (e) {
          // Ignore
        }
      }
    }

    storeRef.current.setConnected(false);
    storeRef.current.setConnecting(false);
  }, [clearAllTimeouts]);

  // ===================================================
  // CONNECT
  // ===================================================

  const connect = useCallback(() => {
    const currentSessionId = sessionIdRef.current;
    const currentToken = accessTokenRef.current;

    console.log('[WS] Connect called', {
      sessionId: currentSessionId,
      hasToken: !!currentToken,
      mounted: mountedRef.current,
      connecting: connectingRef.current,
      wsState: wsRef.current?.readyState,
    });

    // Guards
    if (!mountedRef.current) {
      console.log('[WS] Not mounted, skipping connect');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WS] Already connected');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING || connectingRef.current) {
      console.log('[WS] Already connecting');
      return;
    }

    if (!currentToken) {
      console.error('[WS] No access token');
      storeRef.current.setError('Authentication required');
      return;
    }

    if (!currentSessionId) {
      console.error('[WS] No session ID');
      storeRef.current.setError('Session ID required');
      return;
    }

    // Start connecting
    console.log('[WS] Creating WebSocket connection...');
    isManualDisconnectRef.current = false;
    connectingRef.current = true;
    storeRef.current.setConnecting(true);
    storeRef.current.setError(null);

    try {
      const wsUrl = interviewService.getWebSocketUrl(currentSessionId, currentToken);
      console.log('[WS] URL:', wsUrl.substring(0, 50) + '...');

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        console.log('[WS] Connection opened');

        if (!mountedRef.current) {
          console.log('[WS] Unmounted during connect, closing');
          ws.close(1000, 'Component unmounted');
          return;
        }

        connectingRef.current = false;
        connectedRef.current = true;
        lastServerActivityRef.current = Date.now();
      };

      ws.onmessage = (event: MessageEvent) => {
        if (!mountedRef.current) return;

        // Update activity on any message
        lastServerActivityRef.current = Date.now();

        try {
          // Binary audio
          if (event.data instanceof Blob) {
            event.data.arrayBuffer().then((buffer) => {
              if (mountedRef.current) {
                onAudioReceivedRef.current?.(buffer);
              }
            });
            return;
          }

          if (event.data instanceof ArrayBuffer) {
            onAudioReceivedRef.current?.(event.data);
            return;
          }

          // JSON message
          const message = JSON.parse(event.data) as WSMessage;

          switch (message.type) {
            case 'connected': {
              console.log('[WS] Server confirmed connection:', message.data);
              break;
            }

            case 'ping':
              console.log('[WS] Received ping, sending pong');
              sendMessage('pong');
              break;

            case 'pong':
              console.log('[WS] Received pong');
              break;

            case 'session_ready': {
              const data = message.data as WSSessionReadyData;
              console.log('[WS] Session ready:', data);
              storeRef.current.setConnected(true);
              storeRef.current.setConnecting(false);
              storeRef.current.resetConnectionAttempts();
              reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
              if (data.currentQuestion) {
                storeRef.current.setCurrentQuestion(data.currentQuestion);
              }
              break;
            }

            case 'transcription': {
              const data = message.data as WSTranscriptionData;
              storeRef.current.setCurrentTranscript(data.text);
              break;
            }

            case 'transcription_final': {
              const data = message.data as WSTranscriptionData;
              const userMessage: ConversationMessage = {
                id: `user-${Date.now()}-${++messageIdRef.current}`,
                role: 'user',
                content: data.text,
                timestamp: new Date(),
              };
              storeRef.current.addMessage(userMessage);
              storeRef.current.clearTranscript();
              storeRef.current.setRecording(false);
              storeRef.current.setProcessing(true);
              break;
            }

            case 'ai_thinking': {
              storeRef.current.setProcessing(true);
              break;
            }

            case 'ai_speaking': {
              const data = message.data as WSAISpeakingData;
              if (!storeRef.current.ui.isConnected) {
                storeRef.current.setConnected(true);
            }
              storeRef.current.setProcessing(false);
              storeRef.current.setAISpeaking(true);
              const aiMessage: ConversationMessage = {
                id: `ai-${Date.now()}-${++messageIdRef.current}`,
                role: 'assistant',
                content: data.text,
                timestamp: new Date(),
                category: data.category,
                isFollowUp: data.isFollowUp,
              };
              storeRef.current.addMessage(aiMessage);
              break;
            }

            case 'ai_audio': {
              const data = message.data as WSAIAudioData;
              try {
                const binaryString = atob(data.chunk);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                onAudioReceivedRef.current?.(bytes.buffer);
              } catch (e) {
                console.error('[WS] Failed to decode audio:', e);
              }
              break;
            }

            case 'ai_done': {
              storeRef.current.setAISpeaking(false);
              storeRef.current.setRecording(true);
              break;
            }

            case 'session_state': {
              const data = message.data as WSSessionStateData;
              storeRef.current.setProgress(data.progress);
              if (data.currentQuestion) {
                storeRef.current.setCurrentQuestion(data.currentQuestion);
              }
              storeRef.current.setRecording(data.isListening);
              storeRef.current.setAISpeaking(data.isAISpeaking);
              break;
            }

            case 'interview_ended': {
              const data = message.data as WSInterviewEndedData;
              storeRef.current.updateSessionStatus('COMPLETED');
              storeRef.current.setConnected(false);
              onInterviewEndedRef.current?.(data.feedbackUrl);
              break;
            }

            case 'error': {
              const data = message.data as WSErrorData;
              console.error('[WS] Server error:', data);
              storeRef.current.setError(data.message);
              onErrorRef.current?.({ code: data.code, message: data.message });
              if (!data.recoverable) {
                disconnect();
              }
                            break;
            }

            default:
              console.log('[WS] Unknown message:', message.type);
          }
        } catch (e) {
          console.error('[WS] Message parse error:', e);
        }
      };

      ws.onerror = (error) => {
        console.error('[WS] Error:', error);
      };

      ws.onclose = (event) => {
        console.log('[WS] Closed:', { code: event.code, reason: event.reason });

        connectingRef.current = false;
        connectedRef.current = false;

        if (wsRef.current === ws) {
          wsRef.current = null;
        }

        if (!mountedRef.current) return;

        storeRef.current.setConnected(false);
        storeRef.current.setConnecting(false);

        // Reconnect if not manual disconnect
        if (!isManualDisconnectRef.current && event.code !== 1000) {
          const attempts = useInterviewStore.getState().ui.connectionAttempts;

          if (attempts >= MAX_RECONNECT_ATTEMPTS) {
            storeRef.current.setError('Connection failed. Please refresh the page.');
            return;
          }

          const delay = Math.min(
            reconnectDelayRef.current * Math.pow(2, attempts),
            MAX_RECONNECT_DELAY
          );

          console.log(`[WS] Reconnecting in ${delay}ms...`);

          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current && !isManualDisconnectRef.current) {
              storeRef.current.incrementConnectionAttempts();
              connect();
            }
          }, delay);
        }
      };

    } catch (error) {
      console.error('[WS] Create failed:', error);
      connectingRef.current = false;
      storeRef.current.setConnecting(false);
      storeRef.current.setError('Failed to connect');
    }
  }, [clearAllTimeouts, disconnect, sendMessage]);

  // ===================================================
  // ACTIONS
  // ===================================================

  const sendAudio = useCallback((audioData: ArrayBuffer) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(audioData);
    }
  }, []);

  const startRecording = useCallback(() => {
    if (sendMessage('start_recording')) {
      storeRef.current.setRecording(true);
      storeRef.current.clearTranscript();
    }
  }, [sendMessage]);

  const stopRecording = useCallback(() => {
    if (sendMessage('stop_recording')) {
      storeRef.current.setRecording(false);
    }
  }, [sendMessage]);

  const endInterview = useCallback(
    (reason: 'completed' | 'cancelled' | 'timeout' = 'completed') => {
      sendMessage('end_interview', { reason });
    },
    [sendMessage]
  );

  const pause = useCallback(() => {
    if (sendMessage('pause')) {
      storeRef.current.setRecording(false);
      storeRef.current.setPaused(true);
    }
  }, [sendMessage]);

  const resume = useCallback(() => {
    if (sendMessage('resume')) {
      storeRef.current.setPaused(false);
    }
  }, [sendMessage]);

  // ===================================================
  // LIFECYCLE
  // ===================================================

  // Mount/unmount tracking
  useEffect(() => {
    mountedRef.current = true;
    console.log('[WS] Hook mounted');

    return () => {
      console.log('[WS] Hook unmounting - cleaning up');
      mountedRef.current = false;
      clearAllTimeouts();

      // Close WebSocket on unmount
      const ws = wsRef.current;
      if (ws) {
        wsRef.current = null;
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.onclose = null;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close(1000, 'Unmount');
        }
      }
    };
  }, [clearAllTimeouts]);

  // Auto-connect effect
  useEffect(() => {
    if (!autoConnect) return;
    if (!accessToken) return;
    if (!sessionId) return;

    console.log('[WS] Auto-connect effect triggered');

    // Delay to survive React StrictMode
    connectTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current && !wsRef.current && !connectingRef.current) {
        console.log('[WS] Auto-connecting...');
        connect();
      }
    }, 150);

    return () => {
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
    };
  }, [autoConnect, accessToken, sessionId, connect]);

  // ===================================================
  // RETURN
  // ===================================================

  return useMemo(
    () => ({
      isConnected: ui.isConnected,
      isConnecting: ui.isConnecting,
      connectionAttempts: ui.connectionAttempts,
      connect,
      disconnect,
      sendAudio,
      startRecording,
      stopRecording,
      endInterview,
      pause,
      resume,
    }),
    [
      ui.isConnected,
      ui.isConnecting,
      ui.connectionAttempts,
      connect,
      disconnect,
      sendAudio,
      startRecording,
      stopRecording,
      endInterview,
      pause,
      resume,
    ]
  );
}