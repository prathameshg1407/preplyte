// src/lib/contexts/interview-websocket-context.tsx
// Mirrors mock-interview-ws-context.tsx architecture:
//  - Audio player lives INSIDE this context (so isPendingPlayback + isPlaying are authoritative)
//  - No handler-registration pattern — audio/done handled internally
//  - Consumer just reads isPendingPlayback / isPlaying to gate mic

'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useInterviewStore } from '@/lib/store/interview-store';
import { interviewService } from '@/lib/api/services/interview.service';
import { useAudioPlayer } from '@/lib/hooks/use-audio-player';
import type {
  WSMessage,
  WSSessionReadyData,
  WSTranscriptionData,
  WSAISpeakingData,
  WSAIAudioData,
  WSSessionStateData,
  WSInterviewEndedData,
  WSErrorData,
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

interface InterviewWebSocketContextValue {
  isConnected: boolean;
  isConnecting: boolean;
  connectionAttempts: number;
  currentSessionId: string | null;
  // Audio state (from integrated audio player)
  isPlaying: boolean;
  isBuffering: boolean;
  isPendingPlayback: boolean;
  // Actions
  connect: (sessionId: string) => void;
  disconnect: () => void;
  sendAudio: (audioData: ArrayBuffer) => void;
  startRecording: () => void;
  stopRecording: () => void;
  endInterview: (reason?: 'completed' | 'cancelled' | 'timeout') => void;
  resumeAudioContext: () => Promise<void>;
  // End handler registration (kept for router redirect)
  registerEndHandler: (handler: (feedbackUrl: string) => void) => () => void;
}

const InterviewWebSocketContext = createContext<InterviewWebSocketContextValue | null>(null);

// =====================================================
// PROVIDER
// =====================================================

export function InterviewWebSocketProvider({ children }: { children: React.ReactNode }) {
  // ===================================================
  // STATE
  // ===================================================

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isPendingPlayback, setIsPendingPlayback] = useState(false);

  // ===================================================
  // REFS
  // ===================================================

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const isManualDisconnectRef = useRef(false);
  const messageIdRef = useRef(0);
  const mountedRef = useRef(true);

  // End handler refs
  const endHandlersRef = useRef<Set<(feedbackUrl: string) => void>>(new Set());

  // ===================================================
  // AUTH & STORE
  // ===================================================

  const accessToken = useAuthStore((state) => state.accessToken);
  const store = useInterviewStore();
  const storeRef = useRef(store);

  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  // ===================================================
  // AUDIO PLAYER (integrated, mirrors mock-interview-ws-context)
  // ===================================================

  const {
    queueAudio,
    playAccumulated,
    isPlaying,
    isBuffering,
    resumeContext: resumeAudioContextInternal,
  } = useAudioPlayer({
    onPlaybackEnd: () => {
      // Audio finished — consumer (interview-room) will start mic in response
      console.log('[WS Context] Audio playback ended');
    },
    onError: (err) => {
      console.error('[WS Context] Audio player error:', err);
    },
  });

  // Clear isPendingPlayback as soon as audio actually starts playing
  useEffect(() => {
    if (isPlaying) {
      setIsPendingPlayback(false);
    }
  }, [isPlaying]);

  const resumeAudioContext = useCallback(async () => {
    try {
      await resumeAudioContextInternal();
    } catch {
      // ignore
    }
  }, [resumeAudioContextInternal]);

  // ===================================================
  // HELPERS
  // ===================================================

  const clearAllTimeouts = useCallback((): void => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const sendMessage = useCallback(<T = unknown>(type: string, data?: T): boolean => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type, data, timestamp: Date.now() }));
        return true;
      } catch (e) {
        console.error('[WS Context] Failed to send message:', e);
        return false;
      }
    }
    return false;
  }, []);

  const safeStoreUpdate = useCallback((updateFn: () => void): void => {
    queueMicrotask(() => {
      if (mountedRef.current) {
        updateFn();
      }
    });
  }, []);

  const notifyEndHandlers = useCallback((feedbackUrl: string): void => {
    endHandlersRef.current.forEach((handler) => {
      try { handler(feedbackUrl); } catch (e) {
        console.error('[WS Context] End handler error:', e);
      }
    });
  }, []);

  // ===================================================
  // DISCONNECT
  // ===================================================

  const disconnect = useCallback((): void => {
    console.log('[WS Context] Disconnecting');
    isManualDisconnectRef.current = true;

    clearAllTimeouts();

    const ws = wsRef.current;
    if (ws) {
      wsRef.current = null;
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;

      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        try { ws.close(1000, 'User disconnect'); } catch { /* ignore */ }
      }
    }

    setIsConnected(false);
    setIsConnecting(false);
    setCurrentSessionId(null);
    setConnectionAttempts(0);
    setIsPendingPlayback(false);

    safeStoreUpdate(() => {
      storeRef.current.setConnected(false);
      storeRef.current.setConnecting(false);
    });
  }, [clearAllTimeouts, safeStoreUpdate]);

  // ===================================================
  // CONNECT
  // ===================================================

  const connect = useCallback(
    (sessionId: string): void => {
      console.log('[WS Context] Connect called:', sessionId);

      if (!mountedRef.current) {
        console.log('[WS Context] Not mounted, skipping connect');
        return;
      }

      if (wsRef.current?.readyState === WebSocket.OPEN && currentSessionId === sessionId) {
        console.log('[WS Context] Already connected to this session');
        return;
      }

      if (wsRef.current?.readyState === WebSocket.CONNECTING) {
        console.log('[WS Context] Already connecting');
        return;
      }

      if (!accessToken) {
        console.error('[WS Context] No access token');
        safeStoreUpdate(() => {
          storeRef.current.setError('Authentication required');
        });
        return;
      }

      // Close existing connection if different session
      if (wsRef.current && currentSessionId !== sessionId) {
        console.log('[WS Context] Closing existing connection');
        const oldWs = wsRef.current;
        wsRef.current = null;
        oldWs.onclose = null;
        oldWs.close(1000, 'Switching sessions');
      }

      console.log('[WS Context] Creating connection...');
      isManualDisconnectRef.current = false;
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;
      setIsConnecting(true);
      setCurrentSessionId(sessionId);

      safeStoreUpdate(() => {
        storeRef.current.setConnecting(true);
        storeRef.current.setError(null);
      });

      try {
        const wsUrl = interviewService.getWebSocketUrl(sessionId, accessToken);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.binaryType = 'arraybuffer';

        ws.onopen = (): void => {
          console.log('[WS Context] Connection opened');
          if (!mountedRef.current) {
            ws.close(1000, 'Component unmounted');
            return;
          }
        };

        ws.onmessage = (event: MessageEvent): void => {
          if (!mountedRef.current) return;

          // Binary audio — queue it directly
          if (event.data instanceof ArrayBuffer) {
            queueAudio(event.data);
            return;
          }

          if (event.data instanceof Blob) {
            event.data.arrayBuffer().then((buffer) => {
              if (mountedRef.current) queueAudio(buffer);
            });
            return;
          }

          // JSON message
          try {
            const message = JSON.parse(event.data) as WSMessage;

            switch (message.type) {
              case 'connected':
                console.log('[WS Context] Server confirmed connection');
                break;

              case 'ping':
                sendMessage('pong');
                break;

              case 'pong':
                break;

              case 'session_ready': {
                const data = message.data as WSSessionReadyData;
                console.log('[WS Context] Session ready');
                setIsConnected(true);
                setIsConnecting(false);
                setConnectionAttempts(0);
                reconnectDelayRef.current = INITIAL_RECONNECT_DELAY;

                safeStoreUpdate(() => {
                  storeRef.current.setConnected(true);
                  storeRef.current.setConnecting(false);
                  storeRef.current.resetConnectionAttempts();

                  const wsData = data as any;
                  if (wsData.history && Array.isArray(wsData.history)) {
                    wsData.history.forEach((histItem: any) => {
                      if (histItem.question) {
                        storeRef.current.addMessage({
                          id: `ai-${histItem.id}`,
                          role: 'assistant',
                          content: histItem.question,
                          timestamp: new Date(),
                          category: histItem.category,
                          isFollowUp: histItem.isFollowUp
                        });
                      }
                      if (histItem.answer) {
                        storeRef.current.addMessage({
                          id: `user-${histItem.id}`,
                          role: 'user',
                          content: histItem.answer,
                          timestamp: new Date()
                        });
                      }
                    });
                  }

                  if (data.currentQuestion) {
                    storeRef.current.setCurrentQuestion(data.currentQuestion);
                    const isResuming = wsData.history && Array.isArray(wsData.history) && wsData.history.length > 0;
                    if (isResuming && data.currentQuestion.question) {
                      storeRef.current.addMessage({
                        id: data.currentQuestion.id,
                        role: 'assistant',
                        content: data.currentQuestion.question,
                        timestamp: new Date(),
                        category: data.currentQuestion.category,
                        isFollowUp: data.currentQuestion.isFollowUp,
                      });
                    }
                  }
                });
                break;
              }

              case 'transcription': {
                const data = message.data as WSTranscriptionData;
                safeStoreUpdate(() => {
                  storeRef.current.setCurrentTranscript(data.text);
                });
                break;
              }

              case 'transcription_final': {
                const data = message.data as WSTranscriptionData;
                safeStoreUpdate(() => {
                  storeRef.current.setCurrentTranscript(data.text);
                });
                break;
              }

              case 'ai_thinking':
                safeStoreUpdate(() => {
                  storeRef.current.setProcessing(true);
                  // Move accumulated transcript to chat history
                  const finalUserText = useInterviewStore.getState().ui.currentTranscript;
                  if (finalUserText.trim()) {
                    storeRef.current.addMessage({
                      id: `user-${Date.now()}-${++messageIdRef.current}`,
                      role: 'user',
                      content: finalUserText,
                      timestamp: new Date(),
                    });
                  }
                  storeRef.current.clearTranscript();
                  storeRef.current.setRecording(false);
                });
                break;

              case 'ai_speaking': {
                const data = message.data as WSAISpeakingData & { id?: string };
                safeStoreUpdate(() => {
                  storeRef.current.setProcessing(false);
                  storeRef.current.setAISpeaking(true);
                  const messageId = data.id || `ai-${Date.now()}-${++messageIdRef.current}`;
                  storeRef.current.addMessage({
                    id: messageId,
                    role: 'assistant',
                    content: data.text,
                    timestamp: new Date(),
                    category: data.category,
                    isFollowUp: data.isFollowUp,
                  });
                });
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
                  queueAudio(bytes.buffer);
                } catch (e) {
                  console.error('[WS Context] Audio decode error:', e);
                }
                break;
              }

              case 'ai_done':
                console.log('[WS Context] AI done — triggering audio playback');
                // Set isPendingPlayback BEFORE playAccumulated (prevents premature mic start)
                setIsPendingPlayback(true);
                resumeAudioContextInternal()
                  .catch(() => { /* ignore */ })
                  .finally(() => {
                    playAccumulated().finally(() => {
                      // Safety: if no chunks, isPlaying never flips true
                      setIsPendingPlayback(false);
                    });
                  });
                break;

              case 'session_state': {
                const data = message.data as WSSessionStateData;
                safeStoreUpdate(() => {
                  storeRef.current.setProgress(data.progress);
                  if (data.currentQuestion) {
                    storeRef.current.setCurrentQuestion(data.currentQuestion);
                    storeRef.current.addMessage({
                      id: data.currentQuestion.id,
                      role: 'assistant',
                      content: data.currentQuestion.question,
                      timestamp: new Date(),
                      category: data.currentQuestion.category,
                      isFollowUp: data.currentQuestion.isFollowUp,
                    });
                  }
                });
                break;
              }

              case 'interview_ended': {
                const data = message.data as WSInterviewEndedData;
                setIsConnected(false);
                safeStoreUpdate(() => {
                  storeRef.current.updateSessionStatus('COMPLETED');
                  storeRef.current.setConnected(false);
                });
                notifyEndHandlers(data.feedbackUrl);
                break;
              }

              case 'error': {
                const data = message.data as WSErrorData;
                console.error('[WS Context] Server error:', data);
                safeStoreUpdate(() => {
                  storeRef.current.setError(data.message);
                });
                if (!data.recoverable) {
                  disconnect();
                }
                break;
              }

              default:
                console.log('[WS Context] Received message:', message.type);
            }
          } catch (e) {
            console.error('[WS Context] Parse error:', e);
          }
        };

        ws.onerror = (error): void => {
          console.error('[WS Context] WebSocket error:', error);
        };

        ws.onclose = (event): void => {
          console.log('[WS Context] Connection closed:', event.code, event.reason);

          if (wsRef.current === ws) {
            wsRef.current = null;
          }

          clearAllTimeouts();

          if (!mountedRef.current) return;

          setIsConnected(false);
          setIsConnecting(false);
          setIsPendingPlayback(false);

          safeStoreUpdate(() => {
            storeRef.current.setConnected(false);
            storeRef.current.setConnecting(false);
          });

          // Reconnect logic
          if (!isManualDisconnectRef.current && event.code !== 1000) {
            setConnectionAttempts((prev) => {
              const newAttempts = prev + 1;

              if (newAttempts >= MAX_RECONNECT_ATTEMPTS) {
                safeStoreUpdate(() => {
                  storeRef.current.setError('Connection failed. Please refresh the page.');
                });
                return newAttempts;
              }

              const delay = Math.min(
                reconnectDelayRef.current * Math.pow(2, prev),
                MAX_RECONNECT_DELAY
              );

              console.log(`[WS Context] Reconnecting in ${delay}ms... (attempt ${newAttempts})`);

              reconnectTimeoutRef.current = setTimeout(() => {
                if (mountedRef.current) {
                  connect(sessionId);
                }
              }, delay);

              return newAttempts;
            });
          }
        };
      } catch (error) {
        console.error('[WS Context] Failed to create WebSocket:', error);
        setIsConnecting(false);
        safeStoreUpdate(() => {
          storeRef.current.setConnecting(false);
          storeRef.current.setError('Failed to connect');
        });
      }
    },
    [
      accessToken,
      currentSessionId,
      clearAllTimeouts,
      disconnect,
      sendMessage,
      safeStoreUpdate,
      queueAudio,
      playAccumulated,
      resumeAudioContextInternal,
      notifyEndHandlers,
    ]
  );

  // ===================================================
  // ACTIONS
  // ===================================================

  const sendAudio = useCallback((audioData: ArrayBuffer): void => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(audioData);
    }
  }, []);

  const startRecording = useCallback((): void => {
    if (sendMessage('start_recording')) {
      safeStoreUpdate(() => {
        storeRef.current.setRecording(true);
        storeRef.current.clearTranscript();
      });
    }
  }, [sendMessage, safeStoreUpdate]);

  const stopRecording = useCallback((): void => {
    if (sendMessage('stop_recording')) {
      safeStoreUpdate(() => {
        storeRef.current.setRecording(false);
      });
    }
  }, [sendMessage, safeStoreUpdate]);

  const endInterview = useCallback(
    (reason: 'completed' | 'cancelled' | 'timeout' = 'completed'): void => {
      sendMessage('end_interview', { reason });
    },
    [sendMessage]
  );

  // ===================================================
  // HANDLER REGISTRATION (end handler only, for router redirect)
  // ===================================================

  const registerEndHandler = useCallback((handler: (feedbackUrl: string) => void): (() => void) => {
    endHandlersRef.current.add(handler);
    return () => {
      endHandlersRef.current.delete(handler);
    };
  }, []);

  // ===================================================
  // KEEPALIVE PING
  // ===================================================

  useEffect(() => {
    const interval = setInterval(() => {
      const ws = wsRef.current;
      if (ws?.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'ping' }));
        } catch { /* ignore */ }
      }
    }, 5_000);
    return () => clearInterval(interval);
  }, []);

  // ===================================================
  // CLEANUP
  // ===================================================

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      console.log('[WS Context] Provider unmounting');
      mountedRef.current = false;
      clearAllTimeouts();

      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close(1000, 'Provider unmount');
        wsRef.current = null;
      }

      endHandlersRef.current.clear();
    };
  }, [clearAllTimeouts]);

  // ===================================================
  // CONTEXT VALUE
  // ===================================================

  const value = useMemo<InterviewWebSocketContextValue>(
    () => ({
      isConnected,
      isConnecting,
      connectionAttempts,
      currentSessionId,
      isPlaying,
      isBuffering,
      isPendingPlayback,
      connect,
      disconnect,
      sendAudio,
      startRecording,
      stopRecording,
      endInterview,
      resumeAudioContext,
      registerEndHandler,
    }),
    [
      isConnected,
      isConnecting,
      connectionAttempts,
      currentSessionId,
      isPlaying,
      isBuffering,
      isPendingPlayback,
      connect,
      disconnect,
      sendAudio,
      startRecording,
      stopRecording,
      endInterview,
      resumeAudioContext,
      registerEndHandler,
    ]
  );

  return (
    <InterviewWebSocketContext.Provider value={value}>
      {children}
    </InterviewWebSocketContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useInterviewWebSocket(): InterviewWebSocketContextValue {
  const context = useContext(InterviewWebSocketContext);
  if (!context) {
    throw new Error('useInterviewWebSocket must be used within InterviewWebSocketProvider');
  }
  return context;
}