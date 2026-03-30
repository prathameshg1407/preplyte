// src/lib/contexts/mock-interview-ws-context.tsx
// Mirrors the practice interview WS context architecture for real-time conversation

import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    ReactNode,
    useCallback,
} from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToast } from "@/components/ui/use-toast";
import { refreshTokenManually } from "@/lib/api/axios-instance";
import { AUTH_STORAGE_KEYS, storage } from "@/lib/utils/storage";
import { useAudioPlayer } from "@/lib/hooks/use-audio-player";

// =====================================================
// TYPES
// =====================================================

export type ConnectionState =
    | "DISCONNECTED"
    | "CONNECTING"
    | "CONNECTED"
    | "ERROR";

export type InterviewState =
    | "INITIALIZING"
    | "READY"
    | "INTERVIEWING"
    | "AI_SPEAKING"
    | "AI_PROCESSING"
    | "COMPLETED"
    | "ERROR";

export interface WSResponse {
    type: string;
    data: any;
    error?: string;
}

// Must match WS_EVENTS in backend/src/module/practice/interview/interview.constants.ts
export const MockInterviewWSEvents = {
    CLIENT: {
        AUDIO_CHUNK: "audio_chunk",
        START_RECORDING: "start_recording",
        STOP_RECORDING: "stop_recording",
        END_INTERVIEW: "end_interview",
        PING: "ping",
        PONG: "pong",
    },
    SERVER: {
        CONNECTED: "connected",
        SESSION_READY: "session_ready",
        TRANSCRIPTION: "transcription",
        TRANSCRIPTION_FINAL: "transcription_final",
        AI_THINKING: "ai_thinking",
        AI_SPEAKING: "ai_speaking",
        AI_AUDIO: "ai_audio",
        AI_DONE: "ai_done",
        SESSION_STATE: "session_state",
        ERROR: "error",
        INTERVIEW_ENDED: "interview_ended",
        PING: "ping",
        PONG: "pong",
    },
};

interface MockInterviewContextType {
    connectionState: ConnectionState;
    interviewState: InterviewState;
    currentQuestion: string | null;
    transcription: string;
    isConnected: boolean;
    isConnecting: boolean;
    connect: (moduleAttemptId: string) => Promise<void>;
    disconnect: () => void;
    // Real-time binary audio (mirrors practice interview)
    sendAudio: (audioData: ArrayBuffer) => void;
    sendStartRecording: () => void;
    sendStopRecording: () => void;
    // Aliases for compatibility with InterviewRoom
    startRecording: () => void;
    stopRecording: () => void;
    endInterview: () => void;
    // Audio State
    isPlaying: boolean;
    isBuffering: boolean;
    isPendingPlayback: boolean; // True in the gap between AI_DONE and audio actually starting
    resumeContext: () => Promise<void>;
    resumeAudioContext: () => Promise<void>;
    registerEndHandler: (handler: (feedbackUrl: string) => void) => () => void;
}

// =====================================================
// CONTEXT
// =====================================================

const MockInterviewContext = createContext<MockInterviewContextType | null>(null);

// =====================================================
// PROVIDER
// =====================================================

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 2000;

export function MockInterviewProvider({ children }: { children: ReactNode }) {
    const accessToken = useAuthStore((s) => s.accessToken);
    const { toast } = useToast();

    // =====================================================
    // STATE
    // =====================================================

    const [connectionState, setConnectionState] = useState<ConnectionState>("DISCONNECTED");
    const [interviewState, setInterviewState] = useState<InterviewState>("INITIALIZING");
    const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
    const [transcription, setTranscription] = useState<string>("");
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isPendingPlayback, setIsPendingPlayback] = useState(false); // True between AI_DONE and first isPlaying tick

    // =====================================================
    // REFS (no stale closures — use refs for values needed in callbacks)
    // =====================================================

    const wsRef = useRef<WebSocket | null>(null);
    const attemptIdRef = useRef<string>("");
    const reconnectAttemptsRef = useRef(0);
    const isManualDisconnectRef = useRef(false); // Prevents reconnect on intentional close
    const interviewStateRef = useRef<InterviewState>("INITIALIZING"); // Ref to avoid stale closures
    const mountedRef = useRef(true);

    // ─── Audio Player ─────────────────────────────────────────────────────────
    const {
        queueAudio,
        playAccumulated,
        isPlaying,
        isBuffering,
        resumeContext,
    } = useAudioPlayer({
        onPlaybackEnd: () => {
            console.log("[MockInterview WS] Audio playback ended");
            // Note: Consumer (InterviewModule) handles mic auto-start after playback
        },
    });

    // Clear isPendingPlayback as soon as audio actually starts playing
    useEffect(() => {
        if (isPlaying) {
            setIsPendingPlayback(false);
        }
    }, [isPlaying]);

    // Register audio handler (internal use)
    const handleAiAudio = useCallback((data: ArrayBuffer) => {
        queueAudio(data);
    }, [queueAudio]);

    const handleAiDone = useCallback(async () => {
        // Mark that playback is pending (audio will start after async decode)
        setIsPendingPlayback(true);
        // Resume AudioContext (may be suspended due to browser autoplay policy)
        try { await resumeContext(); } catch { /* ignore */ }
        await playAccumulated();
        // Safety: if there were no chunks to play, isPlaying never flips true,
        // so isPendingPlayback would stay stuck. Always clear it here as fallback.
        setIsPendingPlayback(false);
    }, [playAccumulated, resumeContext]);

    // =====================================================
    // HELPERS
    // =====================================================

    const setInterviewStateWithRef = useCallback((state: InterviewState) => {
        interviewStateRef.current = state;
        setInterviewState(state);
    }, []);

    const sendJson = useCallback((payload: object) => {
        const ws = wsRef.current;
        if (ws?.readyState === WebSocket.OPEN) {
            try {
                const json = JSON.stringify(payload);
                ws.send(json);
                console.debug("[MockInterview WS] Sent JSON:", payload);
                return true;
            } catch (e) { 
                console.error("[MockInterview WS] sendJson error:", e);
                return false; 
            }
        }
        console.warn("[MockInterview WS] sendJson failed: socket not OPEN", { state: ws?.readyState });
        return false;
    }, []);

    // =====================================================
    // MESSAGE HANDLER
    // =====================================================

    const handleMessage = useCallback((msg: WSResponse) => {
        switch (msg.type) {
            case MockInterviewWSEvents.SERVER.CONNECTED:
                console.log("[MockInterview WS] Server confirmed connection");
                break;

            case MockInterviewWSEvents.SERVER.SESSION_READY:
                setIsConnected(true);
                setIsConnecting(false);
                setConnectionState("CONNECTED");
                setInterviewStateWithRef("READY");
                if (msg.data?.currentQuestion?.question) {
                    setCurrentQuestion(msg.data.currentQuestion.question);
                }
                break;

            // Live transcription as user speaks
            case MockInterviewWSEvents.SERVER.TRANSCRIPTION:
                setTranscription(msg.data?.text || "");
                break;

            // Final transcription — wait for AI_THINKING to switch state
            case MockInterviewWSEvents.SERVER.TRANSCRIPTION_FINAL:
                setTranscription(msg.data?.text || "");
                break;

            // AI is formulating a response
            case MockInterviewWSEvents.SERVER.AI_THINKING:
                setInterviewStateWithRef("AI_PROCESSING");
                setTranscription(""); // Clear transcription for the new turn
                break;

            // AI is about to speak — text is ready
            case MockInterviewWSEvents.SERVER.AI_SPEAKING:
                setInterviewStateWithRef("AI_SPEAKING");
                setTranscription(""); // Clear transcription for the new turn
                if (msg.data?.text) {
                    setCurrentQuestion(msg.data.text);
                }
                break;

            // Audio chunk from TTS — decode and forward to audio player
            case MockInterviewWSEvents.SERVER.AI_AUDIO: {
                if (msg.data?.chunk) {
                    try {
                        const binaryString = window.atob(msg.data.chunk);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        handleAiAudio(bytes.buffer);
                    } catch (e) {
                        console.error("[MockInterview WS] Audio decode error:", e);
                    }
                }
                break;
            }

            // handleMessage callback depends on handleAiDone which is now async
            case MockInterviewWSEvents.SERVER.AI_DONE:
                console.log("[MockInterview WS] AI done, triggering audio playback");
                reconnectAttemptsRef.current = 0;
                handleAiDone();
                break;

            // Progress update or state sync (also sent on reconnect resume)
            case MockInterviewWSEvents.SERVER.SESSION_STATE:
                // Transition to INTERVIEWING so mic auto-starts in the module
                setInterviewStateWithRef("INTERVIEWING");
                setIsConnected(true);
                setIsConnecting(false);
                break;

            case MockInterviewWSEvents.SERVER.INTERVIEW_ENDED:
                setInterviewStateWithRef("COMPLETED");
                setIsConnected(false);
                console.log("[MockInterview WS] Interview ended");
                break;

            case MockInterviewWSEvents.SERVER.ERROR:
                toast({
                    title: "Interview Error",
                    description: msg.data?.message || msg.error || "Something went wrong.",
                    variant: "destructive",
                });
                setInterviewStateWithRef("ERROR");
                break;

            // Respond to heartbeat ping immediately
            case MockInterviewWSEvents.SERVER.PING:
                sendJson({ type: MockInterviewWSEvents.CLIENT.PONG });
                break;

            default:
                // Ignore unrecognized events (safe)
                break;
        }
    }, [setInterviewStateWithRef, toast, sendJson, handleAiDone, handleAiAudio]);

    // =====================================================
    // DISCONNECT
    // =====================================================

    const disconnect = useCallback(() => {
        console.log("[MockInterview WS] Manual disconnect");
        isManualDisconnectRef.current = true;
        reconnectAttemptsRef.current = 0;

        const ws = wsRef.current;
        if (ws) {
            wsRef.current = null;
            // Null out handlers first to prevent onclose from triggering reconnect
            ws.onopen = null;
            ws.onmessage = null;
            ws.onerror = null;
            ws.onclose = null;
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                try { ws.close(1000, "User disconnect"); } catch { /* ignore */ }
            }
        }

        setIsConnected(false);
        setIsConnecting(false);
        setConnectionState("DISCONNECTED");
    }, []);

    // =====================================================
    // CONNECT
    // =====================================================

    const connect = useCallback(async (moduleAttemptId: string) => {
        // Already connected to this attempt - avoid duplicate connections
        if (wsRef.current?.readyState === WebSocket.OPEN && attemptIdRef.current === moduleAttemptId) {
            return;
        }

        // Already connecting to the same attempt
        if (wsRef.current?.readyState === WebSocket.CONNECTING && attemptIdRef.current === moduleAttemptId) return;

        if (!accessToken) {
            console.warn("[MockInterview WS] No access token");
            return;
        }

        attemptIdRef.current = moduleAttemptId;
        isManualDisconnectRef.current = false;

        setIsConnecting(true);
        setConnectionState("CONNECTING");

        // Get a fresh token: read from localStorage directly (avoids stale React state),
        // and proactively refresh if expired within 60 seconds.
        let token: string | null = storage.getRaw
            ? storage.getRaw(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
            : (typeof window !== "undefined" ? localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) : null);

        const isTokenExpiredOrSoon = (t: string | null): boolean => {
            if (!t) return true;
            try {
                const payload = JSON.parse(atob(t.split(".")[1]));
                return payload.exp * 1000 < Date.now() + 60_000; // refresh if <60s left
            } catch { return true; }
        };

        if (isTokenExpiredOrSoon(token)) {
            console.log("[MockInterview WS] Token expired/expiring, refreshing...");
            const ok = await refreshTokenManually();
            if (!ok) {
                console.error("[MockInterview WS] Token refresh failed, cannot connect");
                setIsConnecting(false);
                setConnectionState("ERROR");
                return;
            }
            // Re-read the freshly stored token
            token = storage.getRaw
                ? storage.getRaw(AUTH_STORAGE_KEYS.ACCESS_TOKEN)
                : (typeof window !== "undefined" ? localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) : null);
        }

        if (!token) {
            console.warn("[MockInterview WS] No access token after refresh attempt");
            setIsConnecting(false);
            setConnectionState("DISCONNECTED");
            return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:4000";
        const wsUrl = `${baseUrl}/ws/mock-drive/interview/${moduleAttemptId}?token=${token}`;
        console.log("[MockInterview WS] Connecting to:", wsUrl);

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;
            // Enable binary for audio (only if we need raw binary later)
            ws.binaryType = "arraybuffer";

            ws.onopen = () => {
                console.log("[MockInterview WS] Connected");
                reconnectAttemptsRef.current = 0;
                // NOTE: Don't set isConnected=true here. Wait for session_ready.
                if (mountedRef.current) {
                    setConnectionState("CONNECTING"); // Still initializing on server side
                }
            };

            ws.onmessage = (event) => {
                if (!mountedRef.current) return;
                try {
                    // Handle raw binary audio (if server ever sends binary)
                    if (event.data instanceof ArrayBuffer) {
                        handleAiAudio(event.data);
                        return;
                    }
                    const msg: WSResponse = JSON.parse(event.data);
                    handleMessage(msg);
                } catch (e) {
                    console.error("[MockInterview WS] Parse error:", e);
                }
            };

            ws.onerror = () => {
                console.error("[MockInterview WS] WebSocket error", "URL:", wsUrl);
                setConnectionState("ERROR");
            };

            ws.onclose = (event) => {
                if (wsRef.current === ws) wsRef.current = null;
                if (!mountedRef.current) return;

                console.log("[MockInterview WS] Closed:", event.code, event.reason);
                setIsConnected(false);
                setIsConnecting(false);
                setConnectionState("DISCONNECTED");

                // Only reconnect if NOT a manual disconnect and NOT completed
                // Use ref (not state) to avoid stale closure
                if (
                    !isManualDisconnectRef.current &&
                    interviewStateRef.current !== "COMPLETED" &&
                    interviewStateRef.current !== "ERROR" &&
                    event.code !== 1000 &&
                    reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
                ) {
                    reconnectAttemptsRef.current += 1;
                    const delay = RECONNECT_DELAY_MS * reconnectAttemptsRef.current;
                    console.log(`[MockInterview WS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
                    setTimeout(() => {
                        if (mountedRef.current && !isManualDisconnectRef.current) {
                            connect(attemptIdRef.current);
                        }
                    }, delay);
                }
            };
        } catch (err) {
            console.error("[MockInterview WS] Failed to create WebSocket:", err);
            setIsConnecting(false);
            setConnectionState("ERROR");
        }
    }, [accessToken, handleMessage]);

    // =====================================================
    // AUDIO AND CONTROL ACTIONS
    // =====================================================

    /**
     * Send real-time binary audio chunks to the server (mirrors practice interview).
     * The gateway streams these to Deepgram for live transcription.
     */
    const sendAudio = useCallback((audioData: ArrayBuffer) => {
        const ws = wsRef.current;
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(audioData);
        }
    }, []);

    /**
     * Notify server that user started recording (gateway sets isListening=true).
     */
    const sendStartRecording = useCallback(() => {
        sendJson({ type: MockInterviewWSEvents.CLIENT.START_RECORDING });
    }, [sendJson]);

    /**
     * Notify server that user stopped recording (gateway processes accumulated transcript).
     */
    const sendStopRecording = useCallback(() => {
        sendJson({ type: MockInterviewWSEvents.CLIENT.STOP_RECORDING });
    }, [sendJson]);

    const endInterview = useCallback(() => {
        sendJson({
            type: MockInterviewWSEvents.CLIENT.END_INTERVIEW,
            data: { reason: "completed" },
        });
    }, [sendJson]);

    // Aliases for compatibility with InterviewRoom
    const startRecording = sendStartRecording;
    const stopRecording = sendStopRecording;
    const resumeAudioContext = resumeContext;
    
    // Stub for registerEndHandler (mock interviews handle this differently)
    const registerEndHandler = useCallback((_handler: (feedbackUrl: string) => void): (() => void) => {
        // Mock interviews don't use this pattern, return no-op unsubscribe
        return () => {};
    }, []);

    // =====================================================
    // KEEPALIVE PING — prevents code 1005 idle drops
    // =====================================================
    useEffect(() => {
        const interval = setInterval(() => {
            const ws = wsRef.current;
            if (ws?.readyState === WebSocket.OPEN) {
                try {
                    ws.send(JSON.stringify({ type: MockInterviewWSEvents.CLIENT.PING }));
                } catch { /* ignore */ }
            }
        }, 5_000); // every 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            // On unmount: just mark as unmounted
            // DO NOT close the WS here — that's the consumer's job via disconnect().
            mountedRef.current = false;
        };
    }, []);

    // =====================================================
    // CONTEXT VALUE
    // =====================================================

    return (
        <MockInterviewContext.Provider
            value={{
                connectionState,
                interviewState,
                currentQuestion,
                transcription,
                isConnected,
                isConnecting,
                connect,
                disconnect,
                sendAudio,
                sendStartRecording,
                sendStopRecording,
                startRecording,
                stopRecording,
                endInterview,
                isPlaying,
                isBuffering,
                isPendingPlayback,
                resumeContext,
                resumeAudioContext,
                registerEndHandler,
            }}
        >
            {children}
        </MockInterviewContext.Provider>
    );
}

// =====================================================
// HOOK
// =====================================================

export const useMockInterviewWS = () => {
    const context = useContext(MockInterviewContext);
    if (!context) {
        throw new Error("useMockInterviewWS must be used within a MockInterviewProvider");
    }
    return context;
};
