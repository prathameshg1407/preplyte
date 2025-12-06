import * as stream from 'stream';
export interface TranscriptionResult {
    transcript: string;
    confidence?: number;
    words?: Array<{
        word: string;
        startTime?: number;
        endTime?: number;
    }>;
}
export interface STTConfig {
    languageCode?: string;
    encoding?: 'WEBM_OPUS' | 'LINEAR16' | 'FLAC' | 'MP3' | 'OGG_OPUS';
    sampleRateHertz?: number;
    enableWordTimeOffsets?: boolean;
    enableAutomaticPunctuation?: boolean;
    model?: string;
    alternativeLanguageCodes?: string[];
}
export declare class STTManager {
    private client;
    private isInitialized;
    private isDestroyed;
    private initializationError;
    private activeStreams;
    constructor();
    /**
     * Transcribe audio buffer to text
     */
    transcribe(audioBuffer: Buffer, config?: STTConfig): Promise<string>;
    /**
     * Transcribe with detailed results including word timing
     */
    transcribeDetailed(audioBuffer: Buffer, config?: STTConfig): Promise<TranscriptionResult>;
    /**
     * Transcribe audio stream with real-time results
     */
    transcribeStream(audioStream: stream.Readable, config?: STTConfig): AsyncGenerator<string, void, unknown>;
    /**
     * Test connection to Speech-to-Text service
     */
    testConnection(): Promise<boolean>;
    /**
     * Clean up resources
     */
    destroy(): void;
    private initializeClient;
    private ensureActive;
    private durationToSeconds;
}
export declare const getSTTManager: () => STTManager;
export declare const destroySTTManager: () => void;
//# sourceMappingURL=stt-manager.d.ts.map