export interface TTSConfig {
    languageCode?: string;
    ssmlGender?: 'NEUTRAL' | 'MALE' | 'FEMALE';
    audioEncoding?: 'MP3' | 'LINEAR16' | 'OGG_OPUS';
    speakingRate?: number;
    pitch?: number;
}
interface TTSManagerOptions {
    maxCacheSize?: number;
    cacheTtlMs?: number;
    cleanupIntervalMs?: number;
}
export declare class TTSManager {
    private client;
    private readonly audioCache;
    private readonly options;
    private cleanupInterval;
    private isInitialized;
    private isDestroyed;
    private initializationError;
    constructor(options?: TTSManagerOptions);
    /**
     * Generate audio from text
     */
    generateAudio(text: string, sessionId: string, config?: TTSConfig): Promise<string>;
    /**
     * Test connection to TTS service
     */
    testConnection(): Promise<boolean>;
    /**
     * Get available voices
     */
    listVoices(languageCode?: string): Promise<string[]>;
    /**
     * Clean up resources
     */
    destroy(): void;
    /**
     * Get current cache size
     */
    get cacheSize(): number;
    /**
     * Clear the audio cache
     */
    clearCache(): void;
    private initializeClient;
    private startCacheCleanup;
    private cleanupExpiredEntries;
    private evictOldestEntries;
    private generateCacheKey;
    private getCachedEntry;
    private generateWithRetry;
    private ensureActive;
    private delay;
}
export declare const getTTSManager: () => TTSManager;
export declare const destroyTTSManager: () => void;
export {};
//# sourceMappingURL=tts-manager.d.ts.map