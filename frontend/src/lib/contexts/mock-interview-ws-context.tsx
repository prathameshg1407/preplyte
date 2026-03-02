import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    ReactNode,
} from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToast } from "@/components/ui/use-toast";

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

export const MockInterviewWSEvents = {
    CLIENT: {
        INITIALIZE: "INITIALIZE",
        AUDIO_CHUNK: "audio_chunk",
        PING: "PING",
    },
    SERVER: {
        INITIALIZED: "INITIALIZED",
        QUESTION: "QUESTION",
        AI_SPEAKING: "AI_SPEAKING",
        SESSION_STATE: "SESSION_STATE",
        ERROR: "ERROR",
        INTERVIEW_ENDED: "INTERVIEW_ENDED",
        AI_AUDIO: "AI_AUDIO",
        PONG: "PONG",
    },
};

interface MockInterviewContextType {
    connectionState: ConnectionState;
    interviewState: InterviewState;
    currentQuestion: string | null;
    transcription: string; // The active transcribed text received (can be used for UI)
    connect: (attemptId: string) => void;
    disconnect: () => void;
    sendAnswer: (answer: string) => void;
    endInterview: () => void; // Optional if you have an explicit end
    registerAudioHandler: (handler: (data: ArrayBuffer) => void) => () => void;
}

const MockInterviewContext = createContext<MockInterviewContextType | null>(
    null,
);

export function MockInterviewProvider({ children }: { children: ReactNode }) {
    const accessToken = useAuthStore((s) => s.accessToken);
    const { toast } = useToast();

    const [connectionState, setConnectionState] =
        useState<ConnectionState>("DISCONNECTED");
    const [interviewState, setInterviewState] =
        useState<InterviewState>("INITIALIZING");
    const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
    const [transcription, setTranscription] = useState<string>("");

    const ws = useRef<WebSocket | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    // Handler refs
    const audioHandlersRef = useRef<Set<(data: ArrayBuffer) => void>>(new Set());

    const notifyAudioHandlers = (data: ArrayBuffer) => {
        audioHandlersRef.current.forEach((handler) => handler(data));
    };

    const registerAudioHandler = (handler: (data: ArrayBuffer) => void) => {
        audioHandlersRef.current.add(handler);
        return () => {
            audioHandlersRef.current.delete(handler);
        };
    };

    const connect = (attemptId: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) return;

        if (!accessToken) {
            console.warn(
                "No access token available for Mock Drive WebSocket connection",
            );
            return;
        }

        setConnectionState("CONNECTING");

        const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
        const wsUrl = `${baseUrl}/ws/mock-drive/interview/${attemptId}?token=${accessToken}`;

        try {
            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                console.log("[MockInterview WS] Connected");
                setConnectionState("CONNECTED");
                reconnectAttempts.current = 0;

                // Initializing logic triggers automatically on connection in the gateway, but you can also send explicitly
                ws.current?.send(
                    JSON.stringify({ type: MockInterviewWSEvents.CLIENT.INITIALIZE }),
                );
            };

            ws.current.onmessage = (event) => {
                try {
                    const response: WSResponse = JSON.parse(event.data);
                    handleMessage(response);
                } catch (err) {
                    console.error("[MockInterview WS] Failed to parse message", err);
                }
            };

            ws.current.onerror = (error) => {
                console.error("[MockInterview WS] Error:", error);
                setConnectionState("ERROR");
            };

            ws.current.onclose = () => {
                console.log("[MockInterview WS] Disconnected");
                setConnectionState("DISCONNECTED");

                // Basic reconnection logic
                if (
                    reconnectAttempts.current < maxReconnectAttempts &&
                    interviewState !== "COMPLETED"
                ) {
                    reconnectAttempts.current += 1;
                    setTimeout(
                        () => connect(attemptId),
                        1000 * reconnectAttempts.current,
                    );
                }
            };
        } catch (err) {
            console.error("Failed to initialize WebSocket:", err);
            setConnectionState("ERROR");
        }
    };

    const handleMessage = (msg: WSResponse) => {
        switch (msg.type) {
            case MockInterviewWSEvents.SERVER.SESSION_STATE:
                setInterviewState(msg.data.state);
                break;

            case MockInterviewWSEvents.SERVER.INITIALIZED:
                setInterviewState("READY");
                if (msg.data?.question) {
                    setCurrentQuestion(msg.data.question);
                }
                break;

            case MockInterviewWSEvents.SERVER.QUESTION:
                if (msg.data.question) {
                    setCurrentQuestion(msg.data.question);
                }
                setInterviewState("INTERVIEWING");
                // If there's audio, the frontend InterviewModule will listen to the same WS or we handle it here
                // Current implementation is relying on direct events or state updates
                break;

            case MockInterviewWSEvents.SERVER.AI_SPEAKING:
                setInterviewState("AI_SPEAKING");
                break;

            case MockInterviewWSEvents.SERVER.AI_AUDIO: {
                if (msg.data && msg.data.chunk) {
                    try {
                        const binaryString = window.atob(msg.data.chunk);
                        const len = binaryString.length;
                        const bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        notifyAudioHandlers(bytes.buffer);
                    } catch (e) {
                        console.error("[MockInterview WS] Audio decode error:", e);
                    }
                }
                break;
            }

            case MockInterviewWSEvents.SERVER.INTERVIEW_ENDED:
                setInterviewState("COMPLETED");
                if (msg.data.feedbackUrl) {
                    window.location.href = msg.data.feedbackUrl;
                }
                break;

            case MockInterviewWSEvents.SERVER.ERROR:
                toast({
                    title: "Interview Error",
                    description: msg.error || "Something went wrong.",
                    variant: "destructive",
                });
                setInterviewState("ERROR");
                break;

            default:
                console.log(`[MockInterview WS] Unhandled event: ${msg.type}`);
        }
    };

    const disconnect = () => {
        if (ws.current) {
            ws.current.close();
            ws.current = null;
        }
        setConnectionState("DISCONNECTED");
    };

    const sendAnswer = (answer: string) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(
                JSON.stringify({
                    type: MockInterviewWSEvents.CLIENT.AUDIO_CHUNK,
                    data: { response: answer },
                }),
            );
            setInterviewState("AI_PROCESSING");
        } else {
            toast({
                title: "Connection Lost",
                description: "Cannot send answer, attempting to reconnect...",
                variant: "destructive",
            });
        }
    };

    const endInterview = () => {
        // Optional: The server usually triggers INTREVIEW_ENDED when target questions are hit.
        // But a manual trigger might be useful. Right now, there is no explicit manual end WS event mapped in the gateway, but we could add one.
    };

    return (
        <MockInterviewContext.Provider
            value={{
                connectionState,
                interviewState,
                currentQuestion,
                transcription,
                connect,
                disconnect,
                sendAnswer,
                endInterview,
                registerAudioHandler,
            }}
        >
            {children}
        </MockInterviewContext.Provider>
    );
}

export const useMockInterviewWS = () => {
    const context = useContext(MockInterviewContext);
    if (!context) {
        throw new Error(
            "useMockInterviewWS must be used within a MockInterviewProvider",
        );
    }
    return context;
};
