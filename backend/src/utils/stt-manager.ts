// src/utils/stt-manager.ts

import { SpeechClient, protos } from '@google-cloud/speech';
import { logger } from './logger';
import { InternalError } from './errors';
import * as fs from 'fs';
import * as path from 'path';
import * as stream from 'stream';

// =====================================================
// TYPES
// =====================================================

type IRecognitionConfig = protos.google.cloud.speech.v1.IRecognitionConfig;
type IStreamingRecognitionResult =
  protos.google.cloud.speech.v1.IStreamingRecognitionResult;

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

const DEFAULT_CONFIG: Required<
  Omit<STTConfig, 'alternativeLanguageCodes'>
> = {
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

export class STTManager {
  private client: SpeechClient | null = null;
  private isInitialized = false;
  private isDestroyed = false;
  private initializationError: Error | null = null;
  private activeStreams: Set<stream.Readable> = new Set();

  constructor() {
    try {
      this.initializeClient();
    } catch (error) {
      this.initializationError =
        error instanceof Error ? error : new Error(String(error));
      logger.error('[STTManager] Initialization failed', {
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
  async transcribe(
    audioBuffer: Buffer,
    config: STTConfig = {}
  ): Promise<string> {
    this.ensureActive();

    const mergedConfig = { ...DEFAULT_CONFIG, ...config };

    try {
      const recognitionConfig: IRecognitionConfig = {
        encoding: mergedConfig.encoding,
        sampleRateHertz: mergedConfig.sampleRateHertz,
        languageCode: mergedConfig.languageCode,
        model: mergedConfig.model,
        enableAutomaticPunctuation: mergedConfig.enableAutomaticPunctuation,
        enableWordTimeOffsets: mergedConfig.enableWordTimeOffsets,
        alternativeLanguageCodes: config.alternativeLanguageCodes,
      };

      const [response] = await this.client!.recognize({
        config: recognitionConfig,
        audio: { content: audioBuffer.toString('base64') },
      });

      const transcription = response.results
        ?.map((result) => result.alternatives?.[0]?.transcript)
        .filter(Boolean)
        .join(' ')
        .trim();

      logger.debug('[STTManager] Transcription complete', {
        length: transcription?.length ?? 0,
        resultsCount: response.results?.length ?? 0,
      });

      return transcription || '';
    } catch (error) {
      logger.error('[STTManager] Transcription failed', {
        error: error instanceof Error ? error.message : String(error),
        audioSize: audioBuffer.length,
      });
      throw new InternalError('Transcription failed');
    }
  }

  /**
   * Transcribe with detailed results including word timing
   */
  async transcribeDetailed(
    audioBuffer: Buffer,
    config: STTConfig = {}
  ): Promise<TranscriptionResult> {
    this.ensureActive();

    const mergedConfig = {
      ...DEFAULT_CONFIG,
      ...config,
      enableWordTimeOffsets: true,
    };

    try {
      const recognitionConfig: IRecognitionConfig = {
        encoding: mergedConfig.encoding,
        sampleRateHertz: mergedConfig.sampleRateHertz,
        languageCode: mergedConfig.languageCode,
        model: mergedConfig.model,
        enableAutomaticPunctuation: mergedConfig.enableAutomaticPunctuation,
        enableWordTimeOffsets: true,
      };

      const [response] = await this.client!.recognize({
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
    } catch (error) {
      logger.error('[STTManager] Detailed transcription failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalError('Transcription failed');
    }
  }

  /**
   * Transcribe audio stream with real-time results
   */
  async *transcribeStream(
    audioStream: stream.Readable,
    config: STTConfig = {}
  ): AsyncGenerator<string, void, unknown> {
    this.ensureActive();

    const mergedConfig = { ...DEFAULT_CONFIG, ...config };

    const recognitionConfig: IRecognitionConfig = {
      encoding: mergedConfig.encoding,
      sampleRateHertz: mergedConfig.sampleRateHertz,
      languageCode: mergedConfig.languageCode,
      enableAutomaticPunctuation: mergedConfig.enableAutomaticPunctuation,
    };

    const recognizeStream: stream.Duplex = this.client!.streamingRecognize({
      config: recognitionConfig,
      interimResults: true,
    });

    this.activeStreams.add(audioStream);
    audioStream.pipe(recognizeStream);

    try {
      for await (const data of recognizeStream) {
        const streamingData = data as {
          results?: IStreamingRecognitionResult[];
        };
        const result = streamingData.results?.[0];

        if (result?.alternatives?.[0]?.transcript) {
          yield result.alternatives[0].transcript;
        }
      }
    } catch (error) {
      logger.error('[STTManager] Stream transcription failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new InternalError('Stream transcription failed');
    } finally {
      this.activeStreams.delete(audioStream);
      audioStream.destroy();
      recognizeStream.destroy();
    }
  }

  /**
   * Test connection to Speech-to-Text service
   */
  async testConnection(): Promise<boolean> {
    if (this.initializationError) {
      return false;
    }

    try {
      this.ensureActive();

      // Try minimal recognition - errors from empty audio are expected
      const testBuffer = Buffer.alloc(1000);

      await this.client!.recognize({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
        },
        audio: { content: testBuffer.toString('base64') },
      });

      logger.info('[STTManager] Connection test passed');
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Empty audio errors indicate connection works
      if (
        errorMessage.includes('audio') ||
        errorMessage.includes('empty') ||
        errorMessage.includes('no speech')
      ) {
        logger.info('[STTManager] Connection test passed (empty audio)');
        return true;
      }

      logger.error('[STTManager] Connection test failed', {
        error: errorMessage,
      });
      return false;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    for (const activeStream of this.activeStreams) {
      try {
        activeStream.destroy();
      } catch {
        // Ignore cleanup errors
      }
    }
    this.activeStreams.clear();

    this.client = null;

    logger.info('[STTManager] Destroyed');
  }

  // ===================================================
  // PRIVATE METHODS
  // ===================================================

  private initializeClient(): void {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (credentialsPath) {
      const absolutePath = path.resolve(credentialsPath);

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Credentials file not found: ${absolutePath}`);
      }

      const credentials = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

      this.client = new SpeechClient({
        credentials: {
          client_email: credentials.client_email,
          private_key: credentials.private_key,
        },
        projectId: credentials.project_id,
      });

      logger.info('[STTManager] Initialized with explicit credentials');
    } else {
      this.client = new SpeechClient();
      logger.info('[STTManager] Initialized with ADC');
    }

    this.isInitialized = true;
  }

  private ensureActive(): void {
    if (this.isDestroyed) {
      throw new InternalError('STTManager has been destroyed');
    }

    if (this.initializationError) {
      throw new InternalError(
        `STTManager initialization failed: ${this.initializationError.message}`
      );
    }

    if (!this.isInitialized || !this.client) {
      throw new InternalError('STTManager not initialized');
    }
  }

  private durationToSeconds(
    duration: protos.google.protobuf.IDuration | null | undefined
  ): number | undefined {
    if (!duration) return undefined;

    const seconds = Number(duration.seconds || 0);
    const nanos = Number(duration.nanos || 0);

    return seconds + nanos / 1e9;
  }
}

// =====================================================
// SINGLETON
// =====================================================

let sttManagerInstance: STTManager | null = null;

export const getSTTManager = (): STTManager => {
  if (!sttManagerInstance) {
    sttManagerInstance = new STTManager();
  }
  return sttManagerInstance;
};

export const destroySTTManager = (): void => {
  if (sttManagerInstance) {
    sttManagerInstance.destroy();
    sttManagerInstance = null;
  }
};