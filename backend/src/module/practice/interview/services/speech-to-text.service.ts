// src/module/practice/interview/services/speech-to-text.service.ts

import { createClient, LiveTranscriptionEvents, DeepgramClient } from '@deepgram/sdk';
import { EventEmitter } from 'events';
import { logger } from '../../../../utils/logger';
import { InternalError } from '../../../../utils/errors';
import { TranscriptionResult, TranscribedWord } from '../interview.types';
import { DEEPGRAM_CONFIG } from '../interview.constants';

// =====================================================
// TYPES
// =====================================================

interface TranscriptionEventHandlers {
  onTranscript: (result: TranscriptionResult) => void;
  onError: (error: Error) => void;
  onClose: () => void;
}

// =====================================================
// REALTIME TRANSCRIBER CLASS
// =====================================================

export class RealtimeTranscriber extends EventEmitter {
  private client: DeepgramClient;
  private connection: any | null = null;
  private isConnected = false;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private handlers: TranscriptionEventHandlers;

  constructor(handlers: TranscriptionEventHandlers) {
    super();
    
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPGRAM_API_KEY is not configured');
    }

    this.client = createClient(apiKey);
    this.handlers = handlers;
  }

  async start(): Promise<void> {
    logger.info('[STT] Starting real-time transcriber');

    try {
      this.connection = this.client.listen.live({
        model: DEEPGRAM_CONFIG.MODEL,
        language: DEEPGRAM_CONFIG.LANGUAGE,
        smart_format: DEEPGRAM_CONFIG.SMART_FORMAT,
        punctuate: DEEPGRAM_CONFIG.PUNCTUATE,
        interim_results: DEEPGRAM_CONFIG.INTERIM_RESULTS,
        utterance_end_ms: DEEPGRAM_CONFIG.UTTERANCE_END_MS,
        vad_events: DEEPGRAM_CONFIG.VAD_EVENTS,
        encoding: DEEPGRAM_CONFIG.ENCODING,
        sample_rate: DEEPGRAM_CONFIG.SAMPLE_RATE,
      });

      this.setupEventListeners();
      this.startKeepAlive();
      this.isConnected = true;

      logger.info('[STT] Transcriber started successfully');
    } catch (error) {
      logger.error('[STT] Failed to start transcriber', error);
      throw new InternalError('Failed to initialize speech-to-text');
    }
  }

  sendAudio(audioChunk: Buffer): void {
    if (!this.isConnected || !this.connection) {
      logger.warn('[STT] Attempted to send audio while disconnected');
      return;
    }

    try {
      this.connection.send(audioChunk);
    } catch (error) {
      logger.error('[STT] Failed to send audio chunk', error);
      this.handlers.onError(error as Error);
    }
  }

  async stop(): Promise<void> {
    logger.info('[STT] Stopping transcriber');

    this.stopKeepAlive();

    if (this.connection) {
      try {
        this.connection.finish();
      } catch (error) {
        logger.warn('[STT] Error during connection finish', error);
      }
      this.connection = null;
    }

    this.isConnected = false;
    this.removeAllListeners();
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // ===================================================
  // PRIVATE: EVENT HANDLING
  // ===================================================

  private setupEventListeners(): void {
    if (!this.connection) return;

    this.connection.on(LiveTranscriptionEvents.Open, () => {
      logger.debug('[STT] Connection opened');
      this.emit('open');
    });

    this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      this.handleTranscript(data);
    // src/module/practice/interview/services/speech-to-text.service.ts (continued)

    });

    this.connection.on(LiveTranscriptionEvents.Error, (error: any) => {
      logger.error('[STT] Transcription error', error);
      this.handlers.onError(new Error(error.message || 'Transcription error'));
    });

    this.connection.on(LiveTranscriptionEvents.Close, () => {
      logger.info('[STT] Connection closed');
      this.isConnected = false;
      this.handlers.onClose();
      this.emit('close');
    });

    this.connection.on(LiveTranscriptionEvents.Metadata, (data: any) => {
      logger.debug('[STT] Metadata received', data);
    });

    this.connection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
      logger.debug('[STT] Utterance end detected');
      this.emit('utteranceEnd');
    });
  }

  private handleTranscript(data: any): void {
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

      const result: TranscriptionResult = {
        text: transcript,
        isFinal: data.is_final || false,
        confidence: alternative.confidence || 0,
        words: alternative.words?.map((w: any) => ({
          word: w.word,
          start: w.start,
          end: w.end,
          confidence: w.confidence,
        })) as TranscribedWord[],
      };

      this.handlers.onTranscript(result);
      this.emit('transcript', result);
    } catch (error) {
      logger.error('[STT] Error handling transcript', error);
    }
  }

  private startKeepAlive(): void {
    this.keepAliveInterval = setInterval(() => {
      if (this.connection && this.isConnected) {
        try {
          this.connection.keepAlive();
        } catch (error) {
          logger.warn('[STT] Keep-alive failed', error);
        }
      }
    }, 10000); // Every 10 seconds
  }

  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }
}

// =====================================================
// BATCH TRANSCRIPTION SERVICE
// =====================================================

class SpeechToTextService {
  private client: DeepgramClient;

  constructor() {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPGRAM_API_KEY is not configured');
    }
    this.client = createClient(apiKey);
  }

  /**
   * Transcribe audio buffer (batch mode)
   */
  async transcribeBuffer(audioBuffer: Buffer): Promise<TranscriptionResult> {
    logger.info('[STT] Transcribing audio buffer', { size: audioBuffer.length });

    try {
      const response = await this.client.listen.prerecorded.transcribeFile(
        audioBuffer,
        {
          model: DEEPGRAM_CONFIG.MODEL,
          language: DEEPGRAM_CONFIG.LANGUAGE,
          smart_format: DEEPGRAM_CONFIG.SMART_FORMAT,
          punctuate: DEEPGRAM_CONFIG.PUNCTUATE,
        }
      );

      const transcript = response.result?.results?.channels[0]?.alternatives[0];

      if (!transcript) {
        throw new InternalError('No transcription result');
      }

      logger.info('[STT] Transcription complete', {
        length: transcript.transcript.length,
        confidence: transcript.confidence,
      });

      return {
        text: transcript.transcript,
        isFinal: true,
        confidence: transcript.confidence,
        words: transcript.words?.map((w: any) => ({
          word: w.word,
          start: w.start,
          end: w.end,
          confidence: w.confidence,
        })),
      };
    } catch (error) {
      logger.error('[STT] Transcription failed', error);
      throw new InternalError('Failed to transcribe audio');
    }
  }

  /**
   * Transcribe audio from URL
   */
  async transcribeUrl(audioUrl: string): Promise<TranscriptionResult> {
    logger.info('[STT] Transcribing audio from URL', { url: audioUrl });

    try {
      const response = await this.client.listen.prerecorded.transcribeUrl(
        { url: audioUrl },
        {
          model: DEEPGRAM_CONFIG.MODEL,
          language: DEEPGRAM_CONFIG.LANGUAGE,
          smart_format: DEEPGRAM_CONFIG.SMART_FORMAT,
          punctuate: DEEPGRAM_CONFIG.PUNCTUATE,
        }
      );

      const transcript = response.result?.results?.channels[0]?.alternatives[0];

      if (!transcript) {
        throw new InternalError('No transcription result');
      }

      return {
        text: transcript.transcript,
        isFinal: true,
        confidence: transcript.confidence,
      };
    } catch (error) {
      logger.error('[STT] Transcription from URL failed', error);
      throw new InternalError('Failed to transcribe audio from URL');
    }
  }

  /**
   * Create a new real-time transcriber instance
   */
  createRealtimeTranscriber(handlers: TranscriptionEventHandlers): RealtimeTranscriber {
    return new RealtimeTranscriber(handlers);
  }
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const speechToTextService = new SpeechToTextService();
export { SpeechToTextService };