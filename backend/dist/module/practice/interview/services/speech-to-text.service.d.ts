import { EventEmitter } from 'events';
import { TranscriptionResult } from '../interview.types';
interface TranscriptionEventHandlers {
    onTranscript: (result: TranscriptionResult) => void;
    onError: (error: Error) => void;
    onClose: () => void;
}
export declare class RealtimeTranscriber extends EventEmitter {
    private client;
    private connection;
    private isConnected;
    private keepAliveInterval;
    private handlers;
    constructor(handlers: TranscriptionEventHandlers);
    start(): Promise<void>;
    sendAudio(audioChunk: Buffer): void;
    stop(): Promise<void>;
    getConnectionStatus(): boolean;
    private setupEventListeners;
    private handleTranscript;
    private startKeepAlive;
    private stopKeepAlive;
}
declare class SpeechToTextService {
    private client;
    constructor();
    /**
     * Transcribe audio buffer (batch mode)
     */
    transcribeBuffer(audioBuffer: Buffer): Promise<TranscriptionResult>;
    /**
     * Transcribe audio from URL
     */
    transcribeUrl(audioUrl: string): Promise<TranscriptionResult>;
    /**
     * Create a new real-time transcriber instance
     */
    createRealtimeTranscriber(handlers: TranscriptionEventHandlers): RealtimeTranscriber;
}
export declare const speechToTextService: SpeechToTextService;
export { SpeechToTextService };
//# sourceMappingURL=speech-to-text.service.d.ts.map