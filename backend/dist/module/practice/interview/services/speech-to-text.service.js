"use strict";
// src/module/practice/interview/services/speech-to-text.service.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeechToTextService = exports.speechToTextService = exports.RealtimeTranscriber = void 0;
const sdk_1 = require("@deepgram/sdk");
const events_1 = require("events");
const logger_1 = require("../../../../utils/logger");
const errors_1 = require("../../../../utils/errors");
const interview_constants_1 = require("../interview.constants");
// =====================================================
// REALTIME TRANSCRIBER CLASS
// =====================================================
class RealtimeTranscriber extends events_1.EventEmitter {
    client;
    connection = null;
    isConnected = false;
    keepAliveInterval = null;
    handlers;
    constructor(handlers) {
        super();
        const apiKey = process.env.DEEPGRAM_API_KEY;
        if (!apiKey) {
            throw new Error('DEEPGRAM_API_KEY is not configured');
        }
        this.client = (0, sdk_1.createClient)(apiKey);
        this.handlers = handlers;
    }
    async start() {
        logger_1.logger.info('[STT] Starting real-time transcriber');
        try {
            this.connection = this.client.listen.live({
                model: interview_constants_1.DEEPGRAM_CONFIG.MODEL,
                language: interview_constants_1.DEEPGRAM_CONFIG.LANGUAGE,
                smart_format: interview_constants_1.DEEPGRAM_CONFIG.SMART_FORMAT,
                punctuate: interview_constants_1.DEEPGRAM_CONFIG.PUNCTUATE,
                interim_results: interview_constants_1.DEEPGRAM_CONFIG.INTERIM_RESULTS,
                utterance_end_ms: interview_constants_1.DEEPGRAM_CONFIG.UTTERANCE_END_MS,
                vad_events: interview_constants_1.DEEPGRAM_CONFIG.VAD_EVENTS,
                encoding: interview_constants_1.DEEPGRAM_CONFIG.ENCODING,
                sample_rate: interview_constants_1.DEEPGRAM_CONFIG.SAMPLE_RATE,
            });
            this.setupEventListeners();
            this.startKeepAlive();
            this.isConnected = true;
            logger_1.logger.info('[STT] Transcriber started successfully');
        }
        catch (error) {
            logger_1.logger.error('[STT] Failed to start transcriber', error);
            throw new errors_1.InternalError('Failed to initialize speech-to-text');
        }
    }
    sendAudio(audioChunk) {
        if (!this.isConnected || !this.connection) {
            logger_1.logger.warn('[STT] Attempted to send audio while disconnected');
            return;
        }
        try {
            this.connection.send(audioChunk);
        }
        catch (error) {
            logger_1.logger.error('[STT] Failed to send audio chunk', error);
            this.handlers.onError(error);
        }
    }
    async stop() {
        logger_1.logger.info('[STT] Stopping transcriber');
        this.stopKeepAlive();
        if (this.connection) {
            try {
                this.connection.finish();
            }
            catch (error) {
                logger_1.logger.warn('[STT] Error during connection finish', error);
            }
            this.connection = null;
        }
        this.isConnected = false;
        this.removeAllListeners();
    }
    getConnectionStatus() {
        return this.isConnected;
    }
    // ===================================================
    // PRIVATE: EVENT HANDLING
    // ===================================================
    setupEventListeners() {
        if (!this.connection)
            return;
        this.connection.on(sdk_1.LiveTranscriptionEvents.Open, () => {
            logger_1.logger.debug('[STT] Connection opened');
            this.emit('open');
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.Transcript, (data) => {
            this.handleTranscript(data);
            // src/module/practice/interview/services/speech-to-text.service.ts (continued)
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.Error, (error) => {
            logger_1.logger.error('[STT] Transcription error', error);
            this.handlers.onError(new Error(error.message || 'Transcription error'));
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.Close, () => {
            logger_1.logger.info('[STT] Connection closed');
            this.isConnected = false;
            this.handlers.onClose();
            this.emit('close');
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.Metadata, (data) => {
            logger_1.logger.debug('[STT] Metadata received', data);
        });
        this.connection.on(sdk_1.LiveTranscriptionEvents.UtteranceEnd, () => {
            logger_1.logger.debug('[STT] Utterance end detected');
            this.emit('utteranceEnd');
        });
    }
    handleTranscript(data) {
        try {
            const channel = data.channel;
            const alternatives = channel?.alternatives;
            if (!alternatives || alternatives.length === 0) {
                return;
            }
            const alternative = alternatives[0];
            const transcript = alternative.transcript;
            if (!transcript || transcript.trim().length === 0) {
                return;
            }
            const result = {
                text: transcript,
                isFinal: data.is_final || false,
                confidence: alternative.confidence || 0,
                words: alternative.words?.map((w) => ({
                    word: w.word,
                    start: w.start,
                    end: w.end,
                    confidence: w.confidence,
                })),
            };
            this.handlers.onTranscript(result);
            this.emit('transcript', result);
        }
        catch (error) {
            logger_1.logger.error('[STT] Error handling transcript', error);
        }
    }
    startKeepAlive() {
        this.keepAliveInterval = setInterval(() => {
            if (this.connection && this.isConnected) {
                try {
                    this.connection.keepAlive();
                }
                catch (error) {
                    logger_1.logger.warn('[STT] Keep-alive failed', error);
                }
            }
        }, 10000); // Every 10 seconds
    }
    stopKeepAlive() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
            this.keepAliveInterval = null;
        }
    }
}
exports.RealtimeTranscriber = RealtimeTranscriber;
// =====================================================
// BATCH TRANSCRIPTION SERVICE
// =====================================================
class SpeechToTextService {
    client;
    constructor() {
        const apiKey = process.env.DEEPGRAM_API_KEY;
        if (!apiKey) {
            throw new Error('DEEPGRAM_API_KEY is not configured');
        }
        this.client = (0, sdk_1.createClient)(apiKey);
    }
    /**
     * Transcribe audio buffer (batch mode)
     */
    async transcribeBuffer(audioBuffer) {
        logger_1.logger.info('[STT] Transcribing audio buffer', { size: audioBuffer.length });
        try {
            const response = await this.client.listen.prerecorded.transcribeFile(audioBuffer, {
                model: interview_constants_1.DEEPGRAM_CONFIG.MODEL,
                language: interview_constants_1.DEEPGRAM_CONFIG.LANGUAGE,
                smart_format: interview_constants_1.DEEPGRAM_CONFIG.SMART_FORMAT,
                punctuate: interview_constants_1.DEEPGRAM_CONFIG.PUNCTUATE,
            });
            const transcript = response.result?.results?.channels[0]?.alternatives[0];
            if (!transcript) {
                throw new errors_1.InternalError('No transcription result');
            }
            logger_1.logger.info('[STT] Transcription complete', {
                length: transcript.transcript.length,
                confidence: transcript.confidence,
            });
            return {
                text: transcript.transcript,
                isFinal: true,
                confidence: transcript.confidence,
                words: transcript.words?.map((w) => ({
                    word: w.word,
                    start: w.start,
                    end: w.end,
                    confidence: w.confidence,
                })),
            };
        }
        catch (error) {
            logger_1.logger.error('[STT] Transcription failed', error);
            throw new errors_1.InternalError('Failed to transcribe audio');
        }
    }
    /**
     * Transcribe audio from URL
     */
    async transcribeUrl(audioUrl) {
        logger_1.logger.info('[STT] Transcribing audio from URL', { url: audioUrl });
        try {
            const response = await this.client.listen.prerecorded.transcribeUrl({ url: audioUrl }, {
                model: interview_constants_1.DEEPGRAM_CONFIG.MODEL,
                language: interview_constants_1.DEEPGRAM_CONFIG.LANGUAGE,
                smart_format: interview_constants_1.DEEPGRAM_CONFIG.SMART_FORMAT,
                punctuate: interview_constants_1.DEEPGRAM_CONFIG.PUNCTUATE,
            });
            const transcript = response.result?.results?.channels[0]?.alternatives[0];
            if (!transcript) {
                throw new errors_1.InternalError('No transcription result');
            }
            return {
                text: transcript.transcript,
                isFinal: true,
                confidence: transcript.confidence,
            };
        }
        catch (error) {
            logger_1.logger.error('[STT] Transcription from URL failed', error);
            throw new errors_1.InternalError('Failed to transcribe audio from URL');
        }
    }
    /**
     * Create a new real-time transcriber instance
     */
    createRealtimeTranscriber(handlers) {
        return new RealtimeTranscriber(handlers);
    }
}
exports.SpeechToTextService = SpeechToTextService;
// =====================================================
// SINGLETON EXPORT
// =====================================================
exports.speechToTextService = new SpeechToTextService();
//# sourceMappingURL=speech-to-text.service.js.map