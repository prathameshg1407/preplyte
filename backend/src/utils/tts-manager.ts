// src/utils/tts-manager.ts

import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import { uploadAudio } from './cloudinary';
import { logger } from './logger';
import { CONSTANTS } from '../config/constants';
import { InternalError } from './errors';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// =====================================================
// TYPES
// =====================================================

type ISynthesizeSpeechRequest =
  protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;

interface CacheEntry {
  url: string;
  createdAt: number;
}

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

const DEFAULT_OPTIONS: Required<TTSManagerOptions> = {
  maxCacheSize: CONSTANTS.AUDIO_CACHE_MAX_SIZE ?? 100,
  cacheTtlMs: CONSTANTS.AUDIO_CACHE_TTL_MS ?? 30 * 60 * 1000,
  cleanupIntervalMs: 5 * 60 * 1000,
};

// =====================================================
// TTS MANAGER CLASS
// =====================================================

export class TTSManager {
  private client: TextToSpeechClient | null = null;
  private readonly audioCache: Map<string, CacheEntry>;
  private readonly options: Required<TTSManagerOptions>;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private isDestroyed = false;
  private initializationError: Error | null = null;

  constructor(options: TTSManagerOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.audioCache = new Map();

    try {
      this.initializeClient();
      this.startCacheCleanup();
    } catch (error) {
      this.initializationError =
        error instanceof Error ? error : new Error(String(error));
      logger.error('[TTSManager] Initialization failed', {
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
  async generateAudio(
    text: string,
    sessionId: string,
    config: TTSConfig = {}
  ): Promise<string> {
    this.ensureActive();

    // Generate unique cache key using content hash
    const cacheKey = this.generateCacheKey(text, config);

    // Check cache
    const cached = this.getCachedEntry(cacheKey);
    if (cached) {
      logger.debug('[TTSManager] Cache hit', { sessionId });
      return cached;
    }

    // Ensure cache doesn't exceed max size
    this.evictOldestEntries();

    return this.generateWithRetry(text, sessionId, cacheKey, config);
  }

  /**
   * Test connection to TTS service
   */
  async testConnection(): Promise<boolean> {
    if (this.initializationError) {
      return false;
    }

    try {
      this.ensureActive();
      const [result] = await this.client!.listVoices({});
      const voiceCount = result.voices?.length ?? 0;

      logger.info('[TTSManager] Connection test passed', { voiceCount });
      return true;
    } catch (error) {
      logger.error('[TTSManager] Connection test failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Get available voices
   */
  async listVoices(languageCode?: string): Promise<string[]> {
    this.ensureActive();

    try {
      const [result] = await this.client!.listVoices({ languageCode });
      return (
        result.voices?.map((v) => v.name).filter((n): n is string => !!n) ?? []
      );
    } catch (error) {
      logger.error('[TTSManager] Failed to list voices', {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.audioCache.clear();
    this.client = null;

    logger.info('[TTSManager] Destroyed');
  }

  /**
   * Get current cache size
   */
  get cacheSize(): number {
    return this.audioCache.size;
  }

  /**
   * Clear the audio cache
   */
  clearCache(): void {
    this.audioCache.clear();
    logger.debug('[TTSManager] Cache cleared');
  }

  // ===================================================
  // PRIVATE METHODS
  // ===================================================

  private initializeClient(): void {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    logger.info('[TTSManager] Initializing', {
      credentialsPath: credentialsPath ? 'provided' : 'using ADC',
    });

    if (credentialsPath) {
      const absolutePath = path.resolve(credentialsPath);

      if (!fs.existsSync(absolutePath)) {
        throw new Error(`Credentials file not found: ${absolutePath}`);
      }

      const credentials = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

      this.client = new TextToSpeechClient({
        credentials: {
          client_email: credentials.client_email,
          private_key: credentials.private_key,
        },
        projectId: credentials.project_id,
      });
    } else {
      this.client = new TextToSpeechClient();
    }

    this.isInitialized = true;
    logger.info('[TTSManager] Initialized successfully');
  }

  private startCacheCleanup(): void {
    this.cleanupInterval = setInterval(
      () => this.cleanupExpiredEntries(),
      this.options.cleanupIntervalMs
    );
    this.cleanupInterval.unref?.();
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.audioCache.entries()) {
      if (now - entry.createdAt > this.options.cacheTtlMs) {
        this.audioCache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.debug('[TTSManager] Cleaned expired entries', {
        count: deletedCount,
      });
    }
  }

  private evictOldestEntries(): void {
    while (this.audioCache.size >= this.options.maxCacheSize) {
      const oldestKey = this.audioCache.keys().next().value;
      if (oldestKey) {
        this.audioCache.delete(oldestKey);
      } else {
        break;
      }
    }
  }

  private generateCacheKey(text: string, config: TTSConfig): string {
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

  private getCachedEntry(cacheKey: string): string | null {
    const cached = this.audioCache.get(cacheKey);

    if (!cached) return null;

    const age = Date.now() - cached.createdAt;
    if (age > this.options.cacheTtlMs) {
      this.audioCache.delete(cacheKey);
      return null;
    }

    return cached.url;
  }

  private async generateWithRetry(
    text: string,
    sessionId: string,
    cacheKey: string,
    config: TTSConfig,
    maxRetries: number = CONSTANTS.MAX_RETRIES ?? 3
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug('[TTSManager] Generating audio', {
          sessionId,
          attempt,
          textLength: text.length,
        });

        const request: ISynthesizeSpeechRequest = {
          input: { text },
          voice: {
            languageCode:
              config.languageCode ?? CONSTANTS.TTS_LANGUAGE ?? 'en-US',
            ssmlGender:
              config.ssmlGender ?? CONSTANTS.TTS_VOICE_GENDER ?? 'NEUTRAL',
          },
          audioConfig: {
            audioEncoding:
              config.audioEncoding ?? CONSTANTS.TTS_AUDIO_ENCODING ?? 'MP3',
            speakingRate: config.speakingRate,
            pitch: config.pitch,
          },
        };

        const [response] = await this.client!.synthesizeSpeech(request);

        if (!response.audioContent) {
          throw new Error('No audio content received');
        }

        const audioBuffer = Buffer.from(response.audioContent as Uint8Array);
        const uploadResult = await uploadAudio(audioBuffer, sessionId);
        const url = uploadResult.secureUrl;

        // Cache result
        this.audioCache.set(cacheKey, {
          url,
          createdAt: Date.now(),
        });

        logger.info('[TTSManager] Audio generated', { sessionId, url });

        return url;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        logger.warn('[TTSManager] Generation attempt failed', {
          sessionId,
          attempt,
          error: lastError.message,
        });

        if (attempt < maxRetries) {
          const delay = (CONSTANTS.RETRY_DELAY_MS ?? 1000) * attempt;
          await this.delay(delay);
        }
      }
    }

    throw new InternalError(
      `Audio generation failed after ${maxRetries} attempts: ${lastError?.message}`
    );
  }

  private ensureActive(): void {
    if (this.isDestroyed) {
      throw new InternalError('TTSManager has been destroyed');
    }

    if (this.initializationError) {
      throw new InternalError(
        `TTSManager initialization failed: ${this.initializationError.message}`
      );
    }

    if (!this.isInitialized || !this.client) {
      throw new InternalError('TTSManager not initialized');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =====================================================
// SINGLETON
// =====================================================

let ttsManagerInstance: TTSManager | null = null;

export const getTTSManager = (): TTSManager => {
  if (!ttsManagerInstance) {
    ttsManagerInstance = new TTSManager();
  }
  return ttsManagerInstance;
};

export const destroyTTSManager = (): void => {
  if (ttsManagerInstance) {
    ttsManagerInstance.destroy();
    ttsManagerInstance = null;
  }
};