"use strict";
// src/utils/stt-manager.ts
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
exports.destroySTTManager = exports.getSTTManager = exports.STTManager = void 0;
const speech_1 = require("@google-cloud/speech");
const logger_1 = require("./logger");
const errors_1 = require("./errors");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DEFAULT_CONFIG = {
    languageCode: 'en-US',
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 48000,
    enableWordTimeOffsets: false,
    enableAutomaticPunctuation: true,
    model: 'latest_long',
};
// =====================================================
// STT MANAGER CLASS
// =====================================================
class STTManager {
    client = null;
    isInitialized = false;
    isDestroyed = false;
    initializationError = null;
    activeStreams = new Set();
    constructor() {
        try {
            this.initializeClient();
        }
        catch (error) {
            this.initializationError =
                error instanceof Error ? error : new Error(String(error));
            logger_1.logger.error('[STTManager] Initialization failed', {
                error: this.initializationError.message,
            });
        }
    }
    // ===================================================
    // PUBLIC METHODS
    // ===================================================
    /**
     * Transcribe audio buffer to text
     */
    async transcribe(audioBuffer, config = {}) {
        this.ensureActive();
        const mergedConfig = { ...DEFAULT_CONFIG, ...config };
        try {
            const recognitionConfig = {
                encoding: mergedConfig.encoding,
                sampleRateHertz: mergedConfig.sampleRateHertz,
                languageCode: mergedConfig.languageCode,
                model: mergedConfig.model,
                enableAutomaticPunctuation: mergedConfig.enableAutomaticPunctuation,
                enableWordTimeOffsets: mergedConfig.enableWordTimeOffsets,
                alternativeLanguageCodes: config.alternativeLanguageCodes,
            };
            const [response] = await this.client.recognize({
                config: recognitionConfig,
                audio: { content: audioBuffer.toString('base64') },
            });
            const transcription = response.results
                ?.map((result) => result.alternatives?.[0]?.transcript)
                .filter(Boolean)
                .join(' ')
                .trim();
            logger_1.logger.debug('[STTManager] Transcription complete', {
                length: transcription?.length ?? 0,
                resultsCount: response.results?.length ?? 0,
            });
            return transcription || '';
        }
        catch (error) {
            logger_1.logger.error('[STTManager] Transcription failed', {
                error: error instanceof Error ? error.message : String(error),
                audioSize: audioBuffer.length,
            });
            throw new errors_1.InternalError('Transcription failed');
        }
    }
    /**
     * Transcribe with detailed results including word timing
     */
    async transcribeDetailed(audioBuffer, config = {}) {
        this.ensureActive();
        const mergedConfig = {
            ...DEFAULT_CONFIG,
            ...config,
            enableWordTimeOffsets: true,
        };
        try {
            const recognitionConfig = {
                encoding: mergedConfig.encoding,
                sampleRateHertz: mergedConfig.sampleRateHertz,
                languageCode: mergedConfig.languageCode,
                model: mergedConfig.model,
                enableAutomaticPunctuation: mergedConfig.enableAutomaticPunctuation,
                enableWordTimeOffsets: true,
            };
            const [response] = await this.client.recognize({
                config: recognitionConfig,
                audio: { content: audioBuffer.toString('base64') },
            });
            const firstResult = response.results?.[0];
            const firstAlternative = firstResult?.alternatives?.[0];
            const words = firstAlternative?.words?.map((w) => ({
                word: w.word || '',
                startTime: this.durationToSeconds(w.startTime),
                endTime: this.durationToSeconds(w.endTime),
            }));
            const transcript = response.results
                ?.map((result) => result.alternatives?.[0]?.transcript)
                .filter(Boolean)
                .join(' ')
                .trim();
            return {
                transcript: transcript || '',
                confidence: firstAlternative?.confidence ?? undefined,
                words,
            };
        }
        catch (error) {
            logger_1.logger.error('[STTManager] Detailed transcription failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            throw new errors_1.InternalError('Transcription failed');
        }
    }
    /**
     * Transcribe audio stream with real-time results
     */
    async *transcribeStream(audioStream, config = {}) {
        this.ensureActive();
        const mergedConfig = { ...DEFAULT_CONFIG, ...config };
        const recognitionConfig = {
            encoding: mergedConfig.encoding,
            sampleRateHertz: mergedConfig.sampleRateHertz,
            languageCode: mergedConfig.languageCode,
            enableAutomaticPunctuation: mergedConfig.enableAutomaticPunctuation,
        };
        const recognizeStream = this.client.streamingRecognize({
            config: recognitionConfig,
            interimResults: true,
        });
        this.activeStreams.add(audioStream);
        audioStream.pipe(recognizeStream);
        try {
            for await (const data of recognizeStream) {
                const streamingData = data;
                const result = streamingData.results?.[0];
                if (result?.alternatives?.[0]?.transcript) {
                    yield result.alternatives[0].transcript;
                }
            }
        }
        catch (error) {
            logger_1.logger.error('[STTManager] Stream transcription failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            throw new errors_1.InternalError('Stream transcription failed');
        }
        finally {
            this.activeStreams.delete(audioStream);
            audioStream.destroy();
            recognizeStream.destroy();
        }
    }
    /**
     * Test connection to Speech-to-Text service
     */
    async testConnection() {
        if (this.initializationError) {
            return false;
        }
        try {
            this.ensureActive();
            // Try minimal recognition - errors from empty audio are expected
            const testBuffer = Buffer.alloc(1000);
            await this.client.recognize({
                config: {
                    encoding: 'LINEAR16',
                    sampleRateHertz: 16000,
                    languageCode: 'en-US',
                },
                audio: { content: testBuffer.toString('base64') },
            });
            logger_1.logger.info('[STTManager] Connection test passed');
            return true;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Empty audio errors indicate connection works
            if (errorMessage.includes('audio') ||
                errorMessage.includes('empty') ||
                errorMessage.includes('no speech')) {
                logger_1.logger.info('[STTManager] Connection test passed (empty audio)');
                return true;
            }
            logger_1.logger.error('[STTManager] Connection test failed', {
                error: errorMessage,
            });
            return false;
        }
    }
    /**
     * Clean up resources
     */
    destroy() {
        if (this.isDestroyed)
            return;
        this.isDestroyed = true;
        for (const activeStream of this.activeStreams) {
            try {
                activeStream.destroy();
            }
            catch {
                // Ignore cleanup errors
            }
        }
        this.activeStreams.clear();
        this.client = null;
        logger_1.logger.info('[STTManager] Destroyed');
    }
    // ===================================================
    // PRIVATE METHODS
    // ===================================================
    initializeClient() {
        const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (credentialsPath) {
            const absolutePath = path.resolve(credentialsPath);
            if (!fs.existsSync(absolutePath)) {
                throw new Error(`Credentials file not found: ${absolutePath}`);
            }
            const credentials = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
            this.client = new speech_1.SpeechClient({
                credentials: {
                    client_email: credentials.client_email,
                    private_key: credentials.private_key,
                },
                projectId: credentials.project_id,
            });
            logger_1.logger.info('[STTManager] Initialized with explicit credentials');
        }
        else {
            this.client = new speech_1.SpeechClient();
            logger_1.logger.info('[STTManager] Initialized with ADC');
        }
        this.isInitialized = true;
    }
    ensureActive() {
        if (this.isDestroyed) {
            throw new errors_1.InternalError('STTManager has been destroyed');
        }
        if (this.initializationError) {
            throw new errors_1.InternalError(`STTManager initialization failed: ${this.initializationError.message}`);
        }
        if (!this.isInitialized || !this.client) {
            throw new errors_1.InternalError('STTManager not initialized');
        }
    }
    durationToSeconds(duration) {
        if (!duration)
            return undefined;
        const seconds = Number(duration.seconds || 0);
        const nanos = Number(duration.nanos || 0);
        return seconds + nanos / 1e9;
    }
}
exports.STTManager = STTManager;
// =====================================================
// SINGLETON
// =====================================================
let sttManagerInstance = null;
const getSTTManager = () => {
    if (!sttManagerInstance) {
        sttManagerInstance = new STTManager();
    }
    return sttManagerInstance;
};
exports.getSTTManager = getSTTManager;
const destroySTTManager = () => {
    if (sttManagerInstance) {
        sttManagerInstance.destroy();
        sttManagerInstance = null;
    }
};
exports.destroySTTManager = destroySTTManager;
//# sourceMappingURL=stt-manager.js.map