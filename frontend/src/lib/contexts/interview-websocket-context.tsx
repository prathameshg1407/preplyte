// src/lib/contexts/interview-websocket-context.tsx

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
  connect: (sessionId: string) => void;
  disconnect: () => void;
  sendAudio: (audioData: ArrayBuffer) => void;
  startRecording: () => void;
  stopRecording: () => void;
  endInterview: (reason?: 'completed' | 'cancelled' | 'timeout') => void;
  pause: () => void;
  resume: () => void;
  registerAudioHandler: (handler: (data: ArrayBuffer) => void) => () => void;
  registerAiDoneHandler: (handler: () => void) => () => void;
  registerEndHandler: (handler: (feedbackUrl: string) => void) => () => void;
  registerErrorHandler: (handler: (error: { code: string; message: string }) => void) => () => void;
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

  // ===================================================
  // REFS
  // ===================================================

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY);
  const isManualDisconnectRef = useRef(false);
  const messageIdRef = useRef(0);
  const mountedRef = useRef(true);
  const lastServerActivityRef = useRef<number>(Date.now());

  // Handler refs
  const audioHandlersRef = useRef<Set<(data: ArrayBuffer) => void>>(new Set());
  const aiDoneHandlersRef = useRef<Set<() => void>>(new Set());
  const endHandlersRef = useRef<Set<(feedbackUrl: string) => void>>(new Set());
  const errorHandlersRef = useRef<Set<(error: { code: string; message: string }) => void>>(new Set());

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
  // HELPERS
  // ===================================================

  const clearAllTimeouts = useCallback((): void => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Send message helper - returns true if sent
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

  // Safe store update - defers to next microtask to avoid React warnings
  const safeStoreUpdate = useCallback((updateFn: () => void): void => {
    queueMicrotask(() => {
      if (mountedRef.current) {
        updateFn();
      }
    });
  }, []);

  // Notification helpers
  const notifyAudioHandlers = useCallback((data: ArrayBuffer): void => {
    audioHandlersRef.current.forEach((handler) => {
      try {
        handler(data);
      } catch (e) {
        console.error('[WS Context] Audio handler error:', e);
      }
    });
  }, []);

  const notifyAiDoneHandlers = useCallback((): void => {
    aiDoneHandlersRef.current.forEach((handler) => {
      try {
        handler();
      } catch (e) {
        console.error('[WS Context] AI done handler error:', e);
      }
    });
  }, []);

  const notifyEndHandlers = useCallback((feedbackUrl: string): void => {
    endHandlersRef.current.forEach((handler) => {
      try {
        handler(feedbackUrl);
      } catch (e) {
        console.error('[WS Context] End handler error:', e);
      }
    });
  }, []);

  const notifyErrorHandlers = useCallback((error: { code: string; message: string }): void => {
    errorHandlersRef.current.forEach((handler) => {
      try {
        handler(error);
      } catch (e) {
        console.error('[WS Context] Error handler error:', e);
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
        try {
          ws.close(1000, 'User disconnect');
        } catch {
          // Ignore
        }
      }
    }

    setIsConnected(false);
    setIsConnecting(false);
    setCurrentSessionId(null);
    setConnectionAttempts(0);
    
    // Defer store updates
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

      // Already connected to this session
      if (wsRef.current?.readyState === WebSocket.OPEN && currentSessionId === sessionId) {
        console.log('[WS Context] Already connected to this session');
        return;
      }

      // Already connecting
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

          // Reset activity time on connect
          lastServerActivityRef.current = Date.now();
        };

        ws.onmessage = (event: MessageEvent): void => {
          if (!mountedRef.current) return;

          // Update last activity on ANY message from server
          lastServerActivityRef.current = Date.now();

          // Binary audio
          if (event.data instanceof ArrayBuffer) {
            notifyAudioHandlers(event.data);
            return;
          }

          if (event.data instanceof Blob) {
            event.data.arrayBuffer().then((buffer) => {
              if (mountedRef.current) {
                notifyAudioHandlers(buffer);
              }
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
                // Server is pinging us - respond immediately
                console.log('[WS Context] Received ping from server, sending pong');
                sendMessage('pong');
                break;

              case 'pong':
                // Server responded to our ping (if we sent one)
                console.log('[WS Context] Received pong from server');
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
                  
                  if (data.currentQuestion) {
                    storeRef.current.setCurrentQuestion(data.currentQuestion);
                    
                    // FIX 1: Explicitly add message to history on RESUME/READY
                    // This fixes the "Invisible Question" bug when resuming an interview
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
                  storeRef.current.addMessage({
                    id: `user-${Date.now()}-${++messageIdRef.current}`,
                    role: 'user',
                    content: data.text,
                    timestamp: new Date(),
                  });
                  storeRef.current.clearTranscript();
                  storeRef.current.setRecording(false);
                  storeRef.current.setProcessing(true);
                });
                break;
              }

              case 'ai_thinking':
                safeStoreUpdate(() => {
                  storeRef.current.setProcessing(true);
                });
                break;

              case 'ai_speaking': {
                const data = message.data as WSAISpeakingData;
                safeStoreUpdate(() => {
                  storeRef.current.setProcessing(false);
                  storeRef.current.setAISpeaking(true);
                  storeRef.current.addMessage({
                    id: `ai-${Date.now()}-${++messageIdRef.current}`,
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
                  notifyAudioHandlers(bytes.buffer);
                } catch (e) {
                  console.error('[WS Context] Audio decode error:', e);
                }
                break;
              }

              case 'ai_done':
                console.log('[WS Context] AI done speaking (server side)');
                
                // FIX 2: DO NOT UPDATE STATE HERE.
                // We must wait for the UI Audio Player to finish playing.
                // If we flip to "Listening" now, the mic will turn on while audio is still buffering!
                // safeStoreUpdate(() => {
                //   storeRef.current.setAISpeaking(false);
                //   storeRef.current.setRecording(true);
                // });
                
                notifyAiDoneHandlers();
                break;

              case 'session_state': {
                const data = message.data as WSSessionStateData;
                safeStoreUpdate(() => {
                  storeRef.current.setProgress(data.progress);
                  if (data.currentQuestion) {
                    storeRef.current.setCurrentQuestion(data.currentQuestion);
                    
                    // FIX 3: Also add to history on Session State update
                    storeRef.current.addMessage({
                        id: data.currentQuestion.id,
                        role: 'assistant',
                        content: data.currentQuestion.question,
                        timestamp: new Date(),
                        category: data.currentQuestion.category,
                        isFollowUp: data.currentQuestion.isFollowUp,
                    });
                  }
                  
                  // Don't auto-set recording/speaking here, let the room handle it based on activity
                  // storeRef.current.setRecording(data.isListening);
                  // storeRef.current.setAISpeaking(data.isAISpeaking);
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
                notifyErrorHandlers({ code: data.code, message: data.message });
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
          
          safeStoreUpdate(() => {
            storeRef.current.setConnected(false);
            storeRef.current.setConnecting(false);
          });

          // Reconnect logic
          if (!isManualDisconnectRef.current && event.code !== 1000) {
            setConnectionAttempts((prev) => {
              const newAttempts = prev + 1;

              if (newAttempts >= MAX_RECONNECT_ATTEMPTS) {
                // Defer the error update to avoid React warning
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
      notifyAudioHandlers,
      notifyAiDoneHandlers,
      notifyEndHandlers,
      notifyErrorHandlers,
      sendMessage,
      safeStoreUpdate,
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

  const pause = useCallback((): void => {
    if (sendMessage('pause')) {
      safeStoreUpdate(() => {
        storeRef.current.setRecording(false);
        storeRef.current.setPaused(true);
      });
    }
  }, [sendMessage, safeStoreUpdate]);

  const resume = useCallback((): void => {
    if (sendMessage('resume')) {
      safeStoreUpdate(() => {
        storeRef.current.setPaused(false);
      });
    }
  }, [sendMessage, safeStoreUpdate]);

  // ===================================================
  // HANDLER REGISTRATION
  // ===================================================

  const registerAudioHandler = useCallback((handler: (data: ArrayBuffer) => void): (() => void) => {
    audioHandlersRef.current.add(handler);
    return () => {
      audioHandlersRef.current.delete(handler);
    };
  }, []);

  const registerAiDoneHandler = useCallback((handler: () => void): (() => void) => {
    aiDoneHandlersRef.current.add(handler);
    return () => {
      aiDoneHandlersRef.current.delete(handler);
    };
  }, []);

  const registerEndHandler = useCallback((handler: (feedbackUrl: string) => void): (() => void) => {
    endHandlersRef.current.add(handler);
    return () => {
      endHandlersRef.current.delete(handler);
    };
  }, []);

  const registerErrorHandler = useCallback(
    (handler: (error: { code: string; message: string }) => void): (() => void) => {
      errorHandlersRef.current.add(handler);
      return () => {
        errorHandlersRef.current.delete(handler);
      };
    },
    []
  );

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

      audioHandlersRef.current.clear();
      aiDoneHandlersRef.current.clear();
      endHandlersRef.current.clear();
      errorHandlersRef.current.clear();
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
      connect,
      disconnect,
      sendAudio,
      startRecording,
      stopRecording,
      endInterview,
      pause,
      resume,
      registerAudioHandler,
      registerAiDoneHandler,
      registerEndHandler,
      registerErrorHandler,
    }),
    [
      isConnected,
      isConnecting,
      connectionAttempts,
      currentSessionId,
      connect,
      disconnect,
      sendAudio,
      startRecording,
      stopRecording,
      endInterview,
      pause,
      resume,
      registerAudioHandler,
      registerAiDoneHandler,
      registerEndHandler,
      registerErrorHandler,
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