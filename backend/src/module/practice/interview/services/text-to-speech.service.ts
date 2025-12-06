// src/module/practice/interview/services/text-to-speech.service.ts

import { createClient, DeepgramClient } from '@deepgram/sdk';
import { logger } from '../../../../utils/logger';
import { InternalError } from '../../../../utils/errors';
import { TTSResult, TTSRequest } from '../interview.types';
import { TTS_CONFIG } from '../interview.constants';

// =====================================================
// TYPES
// =====================================================

type DeepgramVoice = 
  | 'aura-asteria-en'   // Female, American
  | 'aura-luna-en'      // Female, American  
  | 'aura-stella-en'    // Female, American
  | 'aura-athena-en'    // Female, British
  | 'aura-hera-en'      // Female, American
  | 'aura-orion-en'     // Male, American
  | 'aura-arcas-en'     // Male, American
  | 'aura-perseus-en'   // Male, American
  | 'aura-angus-en'     // Male, Irish
  | 'aura-orpheus-en'   // Male, American
  | 'aura-helios-en'    // Male, British
  | 'aura-zeus-en';     // Male, American

interface DeepgramTTSOptions {
  model?: DeepgramVoice;
  encoding?: 'linear16' | 'mp3' | 'opus' | 'flac' | 'aac' | 'mulaw' | 'alaw';
  container?: 'none' | 'wav' | 'ogg';
  sampleRate?: number;
  bitRate?: number;
}

// =====================================================
// CONSTANTS - Add to interview.constants.ts
// =====================================================

export const DEEPGRAM_TTS_CONFIG = {
  DEFAULT_VOICE: 'aura-asteria-en' as DeepgramVoice,
  DEFAULT_ENCODING: 'mp3' as const,
  // Remove DEFAULT_SAMPLE_RATE - not needed for mp3
  INTERVIEWER_VOICES: {
    female: ['aura-asteria-en', 'aura-luna-en', 'aura-athena-en'] as DeepgramVoice[],
    male: ['aura-orion-en', 'aura-perseus-en', 'aura-helios-en'] as DeepgramVoice[],
  },
};

// =====================================================
// SERVICE CLASS
// =====================================================

class TextToSpeechService {
  private client!: DeepgramClient;
  private useDeepgram: boolean;
  private kokoroUrl: string;

  constructor() {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    
    if (apiKey) {
      this.client = createClient(apiKey);
      this.useDeepgram = true;
      logger.info('[TTS] Using Deepgram for text-to-speech');
    } else {
      this.useDeepgram = false;
      logger.warn('[TTS] DEEPGRAM_API_KEY not set, falling back to Kokoro/Edge TTS');
    }
    
    this.kokoroUrl = TTS_CONFIG.KOKORO_URL;
  }

  // ===================================================
  // PUBLIC METHODS
  // ===================================================

  /**
   * Synthesize speech from text
   */
  async synthesize(request: TTSRequest): Promise<TTSResult> {
    const { text, voice, speed } = request;

    logger.debug('[TTS] Synthesizing speech', {
      textLength: text.length,
      voice: voice || DEEPGRAM_TTS_CONFIG.DEFAULT_VOICE,
      provider: this.useDeepgram ? 'deepgram' : 'fallback',
    });

    if (this.useDeepgram) {
      return this.synthesizeWithDeepgram(text, voice as DeepgramVoice);
    }

    // Fallback chain: Kokoro -> Edge TTS
    try {
      return await this.synthesizeWithKokoro(text, voice, speed);
    } catch {
      return this.synthesizeWithEdgeTTS(text, voice, speed);
    }
  }

  /**
   * Stream speech synthesis (yields chunks)
   */
  async *streamSynthesize(
    text: string, 
    voice?: string
  ): AsyncGenerator<Buffer> {
    if (this.useDeepgram) {
      yield* this.streamWithDeepgram(text, voice as DeepgramVoice);
    } else {
      // For non-streaming fallbacks, split into sentences
      const sentences = this.splitIntoSentences(text);
      
      for (const sentence of sentences) {
        if (sentence.trim().length === 0) continue;
        
        try {
          const result = await this.synthesize({ text: sentence.trim(), voice });
          yield result.audioBuffer;
        } catch (error) {
          logger.error('[TTS] Error synthesizing sentence', error);
        }
      }
    }
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): Array<{ id: string; name: string; gender: string; accent: string }> {
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
  async healthCheck(): Promise<{ available: boolean; provider: string }> {
    if (this.useDeepgram) {
      try {
        // Quick synthesis test
        const testResult = await this.synthesizeWithDeepgram('test', 'aura-asteria-en');
        return { 
          available: testResult.audioBuffer.length > 0, 
          provider: 'deepgram' 
        };
      } catch {
        return { available: false, provider: 'deepgram' };
      }
    }
    
    return { available: true, provider: 'fallback' };
  }

  // ===================================================
  // PRIVATE: DEEPGRAM TTS
  // ===================================================

  private async synthesizeWithDeepgram(
    text: string,
    voice?: DeepgramVoice
  ): Promise<TTSResult> {
    try {
      const startTime = Date.now();
      const selectedVoice = voice || DEEPGRAM_TTS_CONFIG.DEFAULT_VOICE;

      const response = await this.client.speak.request(
        { text },
        {
          model: selectedVoice,
          encoding: DEEPGRAM_TTS_CONFIG.DEFAULT_ENCODING,
        }
      );

      const stream = await response.getStream();
      
      if (!stream) {
        throw new InternalError('No audio stream from Deepgram');
      }

      // Collect stream into buffer
      const chunks: Uint8Array[] = [];
      const reader = stream.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      const audioBuffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
      const duration = this.estimateDuration(text);

      logger.debug('[TTS] Deepgram synthesis complete', {
        latency: Date.now() - startTime,
        audioSize: audioBuffer.length,
        voice: selectedVoice,
      });

      return {
        audioBuffer,
        format: 'mp3',
        duration,
      };
    } catch (error) {
      logger.error('[TTS] Deepgram synthesis failed', error);
      throw new InternalError('Failed to synthesize speech with Deepgram');
    }
  }

  private async *streamWithDeepgram(
    text: string,
    voice?: DeepgramVoice
  ): AsyncGenerator<Buffer> {
    try {
      const selectedVoice = voice || DEEPGRAM_TTS_CONFIG.DEFAULT_VOICE;

      const response = await this.client.speak.request(
        { text },
        {
          model: selectedVoice,
          encoding: DEEPGRAM_TTS_CONFIG.DEFAULT_ENCODING,
        }
      );

      const stream = await response.getStream();
      
      if (!stream) {
        throw new InternalError('No audio stream from Deepgram');
      }

      const reader = stream.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield Buffer.from(value);
      }
    } catch (error) {
      logger.error('[TTS] Deepgram stream failed', error);
      throw new InternalError('Failed to stream speech from Deepgram');
    }
  }

  // ===================================================
  // PRIVATE: FALLBACK TTS (Keep existing implementations)
  // ===================================================

  private async synthesizeWithKokoro(
    text: string,
    voice?: string,
    speed?: number
  ): Promise<TTSResult> {
    // ... keep your existing Kokoro implementation
    try {
      const startTime = Date.now();

      const response = await fetch(`${this.kokoroUrl}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voice || TTS_CONFIG.DEFAULT_VOICE,
          speed: speed || TTS_CONFIG.DEFAULT_SPEED,
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
    } catch (error) {
      logger.error('[TTS] Kokoro synthesis failed', error);
      throw error;
    }
  }

  private async synthesizeWithEdgeTTS(
    text: string,
    voice?: string,
    speed?: number
  ): Promise<TTSResult> {
    // ... keep your existing Edge TTS implementation
    try {
      const EdgeTTS = await this.getEdgeTTS();
      const tts = new EdgeTTS();
      
      await tts.synthesize(text, voice || TTS_CONFIG.EDGE_TTS_VOICE, {
        rate: speed ? `${(speed - 1) * 100}%` : '+0%',
        pitch: '+0Hz',
      });

      const audioBuffer = await tts.toBuffer();

      return {
        audioBuffer,
        format: 'mp3',
        duration: this.estimateDuration(text),
      };
    } catch (error) {
      logger.error('[TTS] Edge TTS synthesis failed', error);
      throw new InternalError('Failed to synthesize speech');
    }
  }

  private async getEdgeTTS(): Promise<any> {
    try {
      const edgeTts = await import('edge-tts');
      return edgeTts.default || edgeTts;
    } catch {
      const edgeTtsNode = await import('edge-tts-node');
      return edgeTtsNode.EdgeTTS || edgeTtsNode.default;
    }
  }

  // ===================================================
  // PRIVATE: HELPERS
  // ===================================================

  private splitIntoSentences(text: string): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    return sentences.filter(s => s.trim().length > 0);
  }

  private estimateDuration(text: string): number {
    const words = text.split(/\s+/).length;
    return Math.ceil((words / 150) * 60);
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const textToSpeechService = new TextToSpeechService();
export { TextToSpeechService };