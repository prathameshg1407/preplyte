// src/module/practice/interview/services/text-to-speech.service.ts

import { logger } from '../../../../utils/logger';
import { InternalError } from '../../../../utils/errors';
import { TTSResult, TTSRequest } from '../interview.types';
import { TTS_CONFIG, AUDIO_CONFIG } from '../interview.constants';

// =====================================================
// SERVICE CLASS
// =====================================================

class TextToSpeechService {
  private kokoroUrl: string;
  private useKokoro: boolean;

  constructor() {
    this.kokoroUrl = TTS_CONFIG.KOKORO_URL;
    this.useKokoro = TTS_CONFIG.USE_KOKORO;
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
      voice: voice || TTS_CONFIG.DEFAULT_VOICE,
    });

    if (this.useKokoro) {
      return this.synthesizeWithKokoro(text, voice, speed);
    }

    return this.synthesizeWithEdgeTTS(text, voice, speed);
  }

  /**
   * Stream speech synthesis (yields chunks)
   */
  async *streamSynthesize(text: string, voice?: string): AsyncGenerator<Buffer> {
    // Split into sentences for faster first-byte
    const sentences = this.splitIntoSentences(text);

    for (const sentence of sentences) {
      if (sentence.trim().length === 0) continue;

      try {
        const result = await this.synthesize({
          text: sentence.trim(),
          voice,
        });
        yield result.audioBuffer;
      } catch (error) {
        logger.error('[TTS] Error synthesizing sentence', error);
        // Continue with next sentence
      }
    }
  }

  /**
   * Check TTS service health
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (this.useKokoro) {
        const response = await fetch(`${this.kokoroUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        return response.ok;
      }
      return true; // Edge TTS is always "available"
    } catch (error) {
      logger.warn('[TTS] Health check failed', error);
      return false;
    }
  }

  // ===================================================
  // PRIVATE: KOKORO TTS
  // ===================================================

  private async synthesizeWithKokoro(
    text: string,
    voice?: string,
    speed?: number
  ): Promise<TTSResult> {
    try {
      const startTime = Date.now();

      const response = await fetch(`${this.kokoroUrl}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: voice || TTS_CONFIG.DEFAULT_VOICE,
          speed: speed || TTS_CONFIG.DEFAULT_SPEED,
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`Kokoro TTS error: ${response.status}`);
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      const duration = this.estimateDuration(text);

      logger.debug('[TTS] Kokoro synthesis complete', {
        duration: Date.now() - startTime,
        audioSize: audioBuffer.length,
      });

      return {
        audioBuffer,
        format: 'mp3',
        duration,
      };
    } catch (error) {
      logger.error('[TTS] Kokoro synthesis failed, falling back to Edge TTS', error);
      return this.synthesizeWithEdgeTTS(text, voice, speed);
    }
  }

  // ===================================================
  // PRIVATE: EDGE TTS (FALLBACK)
  // ===================================================

  private async synthesizeWithEdgeTTS(
    text: string,
    voice?: string,
    speed?: number
  ): Promise<TTSResult> {
    try {
      // Dynamic import for edge-tts
      const EdgeTTS = await this.getEdgeTTS();

      const tts = new EdgeTTS();
      const selectedVoice = voice || TTS_CONFIG.EDGE_TTS_VOICE;
      const rate = speed ? `${(speed - 1) * 100}%` : '+0%';

      await tts.synthesize(text, selectedVoice, {
        rate,
        pitch: '+0Hz',
      });

      const audioBuffer = await tts.toBuffer();
      const duration = this.estimateDuration(text);

      logger.debug('[TTS] Edge TTS synthesis complete', {
        audioSize: audioBuffer.length,
      });

      return {
        audioBuffer,
        format: 'mp3',
        duration,
      };
    } catch (error) {
      logger.error('[TTS] Edge TTS synthesis failed', error);
      throw new InternalError('Failed to synthesize speech');
    }
  }

  private async getEdgeTTS(): Promise<any> {
    try {
      // Try different edge-tts packages
      const edgeTts = await import('edge-tts');
      return edgeTts.default || edgeTts;
    } catch {
      try {
        const edgeTtsNode = await import('edge-tts-node');
        return edgeTtsNode.EdgeTTS || edgeTtsNode.default;
      } catch {
        throw new Error('No Edge TTS package available');
      }
    }
  }

  // ===================================================
  // PRIVATE: HELPERS
  // ===================================================

  private splitIntoSentences(text: string): string[] {
    // Split on sentence boundaries
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    return sentences.filter((s) => s.trim().length > 0);
  }

  private estimateDuration(text: string): number {
    // Average speaking rate: ~150 words per minute
    const words = text.split(/\s+/).length;
    return Math.ceil((words / 150) * 60);
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const textToSpeechService = new TextToSpeechService();
export { TextToSpeechService };