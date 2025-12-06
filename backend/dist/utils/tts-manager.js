"use strict";
// src/utils/tts-manager.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroyTTSManager = exports.getTTSManager = exports.TTSManager = void 0;
const text_to_speech_1 = require("@google-cloud/text-to-speech");
const cloudinary_1 = require("./cloudinary");
const logger_1 = require("./logger");
const constants_1 = require("../config/constants");
const errors_1 = require("./errors");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const DEFAULT_OPTIONS = {
    maxCacheSize: constants_1.CONSTANTS.AUDIO_CACHE_MAX_SIZE ?? 100,
    cacheTtlMs: constants_1.CONSTANTS.AUDIO_CACHE_TTL_MS ?? 30 * 60 * 1000,
    cleanupIntervalMs: 5 * 60 * 1000,
};
// =====================================================
// TTS MANAGER CLASS
// =====================================================
class TTSManager {
    client = null;
    audioCache;
    options;
    cleanupInterval = null;
    isInitialized = false;
    isDestroyed = false;
    initializationError = null;
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.audioCache = new Map();
        try {
            this.initializeClient();
            this.startCacheCleanup();
        }
        catch (error) {
            this.initializationError =
                error instanceof Error ? error : new Error(String(error));
            logger_1.logger.error('[TTSManager] Initialization failed', {
                error: this.initializationError.message,
            });
        }
    }
    // ===================================================
    // PUBLIC METHODS
    // ===================================================
    /**
     * Generate audio from text
     */
    async generateAudio(text, sessionId, config = {}) {
        this.ensureActive();
        // Generate unique cache key using content hash
        const cacheKey = this.generateCacheKey(text, config);
        // Check cache
        const cached = this.getCachedEntry(cacheKey);
        if (cached) {
            logger_1.logger.debug('[TTSManager] Cache hit', { sessionId });
            return cached;
        }
        // Ensure cache doesn't exceed max size
        this.evictOldestEntries();
        return this.generateWithRetry(text, sessionId, cacheKey, config);
    }
    /**
     * Test connection to TTS service
     */
    async testConnection() {
        if (this.initializationError) {
            return false;
        }
        try {
            this.ensureActive();
            const [result] = await this.client.listVoices({});
            const voiceCount = result.voices?.length ?? 0;
            logger_1.logger.info('[TTSManager] Connection test passed', { voiceCount });
            return true;
        }
        catch (error) {
            logger_1.logger.error('[TTSManager] Connection test failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }
    /**
     * Get available voices
     */
    async listVoices(languageCode) {
        this.ensureActive();
        try {
            const [result] = await this.client.listVoices({ languageCode });
            return (result.voices?.map((v) => v.name).filter((n) => !!n) ?? []);
        }
        catch (error) {
            logger_1.logger.error('[TTSManager] Failed to list voices', {
                error: error instanceof Error ? error.message : String(error),
            });
            return [];
        }
    }
    /**
     * Clean up resources
     */
    destroy() {
        if (this.isDestroyed)
            return;
        this.isDestroyed = true;
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.audioCache.clear();
        this.client = null;
        logger_1.logger.info('[TTSManager] Destroyed');
    }
    /**
     * Get current cache size
     */
    get cacheSize() {
        return this.audioCache.size;
    }
    /**
     * Clear the audio cache
     */
    clearCache() {
        this.audioCache.clear();
        logger_1.logger.debug('[TTSManager] Cache cleared');
    }
    // ===================================================
    // PRIVATE METHODS
    // ===================================================
    initializeClient() {
        const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        logger_1.logger.info('[TTSManager] Initializing', {
            credentialsPath: credentialsPath ? 'provided' : 'using ADC',
        });
        if (credentialsPath) {
            const absolutePath = path.resolve(credentialsPath);
            if (!fs.existsSync(absolutePath)) {
                throw new Error(`Credentials file not found: ${absolutePath}`);
            }
            const credentials = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
            this.client = new text_to_speech_1.TextToSpeechClient({
                credentials: {
                    client_email: credentials.client_email,
                    private_key: credentials.private_key,
                },
                projectId: credentials.project_id,
            });
        }
        else {
            this.client = new text_to_speech_1.TextToSpeechClient();
        }
        this.isInitialized = true;
        logger_1.logger.info('[TTSManager] Initialized successfully');
    }
    startCacheCleanup() {
        this.cleanupInterval = setInterval(() => this.cleanupExpiredEntries(), this.options.cleanupIntervalMs);
        this.cleanupInterval.unref?.();
    }
    cleanupExpiredEntries() {
        const now = Date.now();
        let deletedCount = 0;
        for (const [key, entry] of this.audioCache.entries()) {
            if (now - entry.createdAt > this.options.cacheTtlMs) {
                this.audioCache.delete(key);
                deletedCount++;
            }
        }
        if (deletedCount > 0) {
            logger_1.logger.debug('[TTSManager] Cleaned expired entries', {
                count: deletedCount,
            });
        }
    }
    evictOldestEntries() {
        while (this.audioCache.size >= this.options.maxCacheSize) {
            const oldestKey = this.audioCache.keys().next().value;
            if (oldestKey) {
                this.audioCache.delete(oldestKey);
            }
            else {
                break;
            }
        }
    }
    generateCacheKey(text, config) {
        const configStr = JSON.stringify({
            lang: config.languageCode,
            gender: config.ssmlGender,
            rate: config.speakingRate,
            pitch: config.pitch,
        });
        const hash = crypto
            .createHash('sha256')
            .update(text + configStr)
            .digest('hex')
            .slice(0, 16);
        return hash;
    }
    getCachedEntry(cacheKey) {
        const cached = this.audioCache.get(cacheKey);
        if (!cached)
            return null;
        const age = Date.now() - cached.createdAt;
        if (age > this.options.cacheTtlMs) {
            this.audioCache.delete(cacheKey);
            return null;
        }
        return cached.url;
    }
    async generateWithRetry(text, sessionId, cacheKey, config, maxRetries = constants_1.CONSTANTS.MAX_RETRIES ?? 3) {
        let lastError = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger_1.logger.debug('[TTSManager] Generating audio', {
                    sessionId,
                    attempt,
                    textLength: text.length,
                });
                const request = {
                    input: { text },
                    voice: {
                        languageCode: config.languageCode ?? constants_1.CONSTANTS.TTS_LANGUAGE ?? 'en-US',
                        ssmlGender: config.ssmlGender ?? constants_1.CONSTANTS.TTS_VOICE_GENDER ?? 'NEUTRAL',
                    },
                    audioConfig: {
                        audioEncoding: config.audioEncoding ?? constants_1.CONSTANTS.TTS_AUDIO_ENCODING ?? 'MP3',
                        speakingRate: config.speakingRate,
                        pitch: config.pitch,
                    },
                };
                const [response] = await this.client.synthesizeSpeech(request);
                if (!response.audioContent) {
                    throw new Error('No audio content received');
                }
                const audioBuffer = Buffer.from(response.audioContent);
                const uploadResult = await (0, cloudinary_1.uploadAudio)(audioBuffer, sessionId);
                const url = uploadResult.secureUrl;
                // Cache result
                this.audioCache.set(cacheKey, {
                    url,
                    createdAt: Date.now(),
                });
                logger_1.logger.info('[TTSManager] Audio generated', { sessionId, url });
                return url;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                logger_1.logger.warn('[TTSManager] Generation attempt failed', {
                    sessionId,
                    attempt,
                    error: lastError.message,
                });
                if (attempt < maxRetries) {
                    const delay = (constants_1.CONSTANTS.RETRY_DELAY_MS ?? 1000) * attempt;
                    await this.delay(delay);
                }
            }
        }
        throw new errors_1.InternalError(`Audio generation failed after ${maxRetries} attempts: ${lastError?.message}`);
    }
    ensureActive() {
        if (this.isDestroyed) {
            throw new errors_1.InternalError('TTSManager has been destroyed');
        }
        if (this.initializationError) {
            throw new errors_1.InternalError(`TTSManager initialization failed: ${this.initializationError.message}`);
        }
        if (!this.isInitialized || !this.client) {
            throw new errors_1.InternalError('TTSManager not initialized');
        }
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.TTSManager = TTSManager;
// =====================================================
// SINGLETON
// =====================================================
let ttsManagerInstance = null;
const getTTSManager = () => {
    if (!ttsManagerInstance) {
        ttsManagerInstance = new TTSManager();
    }
    return ttsManagerInstance;
};
exports.getTTSManager = getTTSManager;
const destroyTTSManager = () => {
    if (ttsManagerInstance) {
        ttsManagerInstance.destroy();
        ttsManagerInstance = null;
    }
};
exports.destroyTTSManager = destroyTTSManager;
//# sourceMappingURL=tts-manager.js.map