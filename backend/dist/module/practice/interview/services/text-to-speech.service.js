"use strict";
// src/module/practice/interview/services/text-to-speech.service.ts
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
exports.TextToSpeechService = exports.textToSpeechService = exports.DEEPGRAM_TTS_CONFIG = void 0;
const sdk_1 = require("@deepgram/sdk");
const logger_1 = require("../../../../utils/logger");
const errors_1 = require("../../../../utils/errors");
const interview_constants_1 = require("../interview.constants");
// =====================================================
// CONSTANTS - Add to interview.constants.ts
// =====================================================
exports.DEEPGRAM_TTS_CONFIG = {
    DEFAULT_VOICE: 'aura-asteria-en',
    DEFAULT_ENCODING: 'mp3',
    // Remove DEFAULT_SAMPLE_RATE - not needed for mp3
    INTERVIEWER_VOICES: {
        female: ['aura-asteria-en', 'aura-luna-en', 'aura-athena-en'],
        male: ['aura-orion-en', 'aura-perseus-en', 'aura-helios-en'],
    },
};
// =====================================================
// SERVICE CLASS
// =====================================================
class TextToSpeechService {
    client;
    useDeepgram;
    kokoroUrl;
    constructor() {
        const apiKey = process.env.DEEPGRAM_API_KEY;
        if (apiKey) {
            this.client = (0, sdk_1.createClient)(apiKey);
            this.useDeepgram = true;
            logger_1.logger.info('[TTS] Using Deepgram for text-to-speech');
        }
        else {
            this.useDeepgram = false;
            logger_1.logger.warn('[TTS] DEEPGRAM_API_KEY not set, falling back to Kokoro/Edge TTS');
        }
        this.kokoroUrl = interview_constants_1.TTS_CONFIG.KOKORO_URL;
    }
    // ===================================================
    // PUBLIC METHODS
    // ===================================================
    /**
     * Synthesize speech from text
     */
    async synthesize(request) {
        const { text, voice, speed } = request;
        logger_1.logger.debug('[TTS] Synthesizing speech', {
            textLength: text.length,
            voice: voice || exports.DEEPGRAM_TTS_CONFIG.DEFAULT_VOICE,
            provider: this.useDeepgram ? 'deepgram' : 'fallback',
        });
        if (this.useDeepgram) {
            return this.synthesizeWithDeepgram(text, voice);
        }
        // Fallback chain: Kokoro -> Edge TTS
        try {
            return await this.synthesizeWithKokoro(text, voice, speed);
        }
        catch {
            return this.synthesizeWithEdgeTTS(text, voice, speed);
        }
    }
    /**
     * Stream speech synthesis (yields chunks)
     */
    async *streamSynthesize(text, voice) {
        if (this.useDeepgram) {
            yield* this.streamWithDeepgram(text, voice);
        }
        else {
            // For non-streaming fallbacks, split into sentences
            const sentences = this.splitIntoSentences(text);
            for (const sentence of sentences) {
                if (sentence.trim().length === 0)
                    continue;
                try {
                    const result = await this.synthesize({ text: sentence.trim(), voice });
                    yield result.audioBuffer;
                }
                catch (error) {
                    logger_1.logger.error('[TTS] Error synthesizing sentence', error);
                }
            }
        }
    }
    /**
     * Get available voices
     */
    getAvailableVoices() {
        if (this.useDeepgram) {
            return [
                { id: 'aura-asteria-en', name: 'Asteria', gender: 'female', accent: 'American' },
                { id: 'aura-luna-en', name: 'Luna', gender: 'female', accent: 'American' },
                { id: 'aura-stella-en', name: 'Stella', gender: 'female', accent: 'American' },
                { id: 'aura-athena-en', name: 'Athena', gender: 'female', accent: 'British' },
                { id: 'aura-hera-en', name: 'Hera', gender: 'female', accent: 'American' },
                { id: 'aura-orion-en', name: 'Orion', gender: 'male', accent: 'American' },
                { id: 'aura-arcas-en', name: 'Arcas', gender: 'male', accent: 'American' },
                { id: 'aura-perseus-en', name: 'Perseus', gender: 'male', accent: 'American' },
                { id: 'aura-angus-en', name: 'Angus', gender: 'male', accent: 'Irish' },
                { id: 'aura-orpheus-en', name: 'Orpheus', gender: 'male', accent: 'American' },
                { id: 'aura-helios-en', name: 'Helios', gender: 'male', accent: 'British' },
                { id: 'aura-zeus-en', name: 'Zeus', gender: 'male', accent: 'American' },
            ];
        }
        return [
            { id: 'default', name: 'Default', gender: 'female', accent: 'American' },
        ];
    }
    /**
     * Check TTS service health
     */
    async healthCheck() {
        if (this.useDeepgram) {
            try {
                // Quick synthesis test
                const testResult = await this.synthesizeWithDeepgram('test', 'aura-asteria-en');
                return {
                    available: testResult.audioBuffer.length > 0,
                    provider: 'deepgram'
                };
            }
            catch {
                return { available: false, provider: 'deepgram' };
            }
        }
        return { available: true, provider: 'fallback' };
    }
    // ===================================================
    // PRIVATE: DEEPGRAM TTS
    // ===================================================
    async synthesizeWithDeepgram(text, voice) {
        try {
            const startTime = Date.now();
            const selectedVoice = voice || exports.DEEPGRAM_TTS_CONFIG.DEFAULT_VOICE;
            const response = await this.client.speak.request({ text }, {
                model: selectedVoice,
                encoding: exports.DEEPGRAM_TTS_CONFIG.DEFAULT_ENCODING,
            });
            const stream = await response.getStream();
            if (!stream) {
                throw new errors_1.InternalError('No audio stream from Deepgram');
            }
            // Collect stream into buffer
            const chunks = [];
            const reader = stream.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                chunks.push(value);
            }
            const audioBuffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
            const duration = this.estimateDuration(text);
            logger_1.logger.debug('[TTS] Deepgram synthesis complete', {
                latency: Date.now() - startTime,
                audioSize: audioBuffer.length,
                voice: selectedVoice,
            });
            return {
                audioBuffer,
                format: 'mp3',
                duration,
            };
        }
        catch (error) {
            logger_1.logger.error('[TTS] Deepgram synthesis failed', error);
            throw new errors_1.InternalError('Failed to synthesize speech with Deepgram');
        }
    }
    async *streamWithDeepgram(text, voice) {
        try {
            const selectedVoice = voice || exports.DEEPGRAM_TTS_CONFIG.DEFAULT_VOICE;
            const response = await this.client.speak.request({ text }, {
                model: selectedVoice,
                encoding: exports.DEEPGRAM_TTS_CONFIG.DEFAULT_ENCODING,
            });
            const stream = await response.getStream();
            if (!stream) {
                throw new errors_1.InternalError('No audio stream from Deepgram');
            }
            const reader = stream.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                yield Buffer.from(value);
            }
        }
        catch (error) {
            logger_1.logger.error('[TTS] Deepgram stream failed', error);
            throw new errors_1.InternalError('Failed to stream speech from Deepgram');
        }
    }
    // ===================================================
    // PRIVATE: FALLBACK TTS (Keep existing implementations)
    // ===================================================
    async synthesizeWithKokoro(text, voice, speed) {
        // ... keep your existing Kokoro implementation
        try {
            const startTime = Date.now();
            const response = await fetch(`${this.kokoroUrl}/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    voice: voice || interview_constants_1.TTS_CONFIG.DEFAULT_VOICE,
                    speed: speed || interview_constants_1.TTS_CONFIG.DEFAULT_SPEED,
                }),
                signal: AbortSignal.timeout(30000),
            });
            if (!response.ok) {
                throw new Error(`Kokoro TTS error: ${response.status}`);
            }
            const audioBuffer = Buffer.from(await response.arrayBuffer());
            return {
                audioBuffer,
                format: 'mp3',
                duration: this.estimateDuration(text),
            };
        }
        catch (error) {
            logger_1.logger.error('[TTS] Kokoro synthesis failed', error);
            throw error;
        }
    }
    async synthesizeWithEdgeTTS(text, voice, speed) {
        // ... keep your existing Edge TTS implementation
        try {
            const EdgeTTS = await this.getEdgeTTS();
            const tts = new EdgeTTS();
            await tts.synthesize(text, voice || interview_constants_1.TTS_CONFIG.EDGE_TTS_VOICE, {
                rate: speed ? `${(speed - 1) * 100}%` : '+0%',
                pitch: '+0Hz',
            });
            const audioBuffer = await tts.toBuffer();
            return {
                audioBuffer,
                format: 'mp3',
                duration: this.estimateDuration(text),
            };
        }
        catch (error) {
            logger_1.logger.error('[TTS] Edge TTS synthesis failed', error);
            throw new errors_1.InternalError('Failed to synthesize speech');
        }
    }
    async getEdgeTTS() {
        try {
            const edgeTts = await Promise.resolve().then(() => __importStar(require('edge-tts')));
            return edgeTts.default || edgeTts;
        }
        catch {
            const edgeTtsNode = await Promise.resolve().then(() => __importStar(require('edge-tts-node')));
            return edgeTtsNode.EdgeTTS || edgeTtsNode.default;
        }
    }
    // ===================================================
    // PRIVATE: HELPERS
    // ===================================================
    splitIntoSentences(text) {
        const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
        return sentences.filter(s => s.trim().length > 0);
    }
    estimateDuration(text) {
        const words = text.split(/\s+/).length;
        return Math.ceil((words / 150) * 60);
    }
}
exports.TextToSpeechService = TextToSpeechService;
// =====================================================
// SINGLETON EXPORT
// =====================================================
exports.textToSpeechService = new TextToSpeechService();
//# sourceMappingURL=text-to-speech.service.js.map