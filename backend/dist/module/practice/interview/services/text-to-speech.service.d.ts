import { TTSResult, TTSRequest } from '../interview.types';
type DeepgramVoice = 'aura-asteria-en' | 'aura-luna-en' | 'aura-stella-en' | 'aura-athena-en' | 'aura-hera-en' | 'aura-orion-en' | 'aura-arcas-en' | 'aura-perseus-en' | 'aura-angus-en' | 'aura-orpheus-en' | 'aura-helios-en' | 'aura-zeus-en';
export declare const DEEPGRAM_TTS_CONFIG: {
    DEFAULT_VOICE: DeepgramVoice;
    DEFAULT_ENCODING: "mp3";
    INTERVIEWER_VOICES: {
        female: DeepgramVoice[];
        male: DeepgramVoice[];
    };
};
declare class TextToSpeechService {
    private client;
    private useDeepgram;
    private kokoroUrl;
    constructor();
    /**
     * Synthesize speech from text
     */
    synthesize(request: TTSRequest): Promise<TTSResult>;
    /**
     * Stream speech synthesis (yields chunks)
     */
    streamSynthesize(text: string, voice?: string): AsyncGenerator<Buffer>;
    /**
     * Get available voices
     */
    getAvailableVoices(): Array<{
        id: string;
        name: string;
        gender: string;
        accent: string;
    }>;
    /**
     * Check TTS service health
     */
    healthCheck(): Promise<{
        available: boolean;
        provider: string;
    }>;
    private synthesizeWithDeepgram;
    private streamWithDeepgram;
    private synthesizeWithKokoro;
    private synthesizeWithEdgeTTS;
    private getEdgeTTS;
    private splitIntoSentences;
    private estimateDuration;
}
export declare const textToSpeechService: TextToSpeechService;
export { TextToSpeechService };
//# sourceMappingURL=text-to-speech.service.d.ts.map