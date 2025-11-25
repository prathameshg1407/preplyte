// src/utils/tts-manager.ts

import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import { uploadAudio } from './cloudinary';
import { logger } from './logger';
import { CONSTANTS } from '../config/constants';
import { InternalError } from '../lib/errors';
import * as fs from 'fs';
import * as path from 'path';

type ISynthesizeSpeechRequest = protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest;

interface CacheEntry {
  url: string;
  createdAt: number;
}

export class TTSManager {
  private ttsClient!: TextToSpeechClient;
  private readonly audioCache: Map<string, CacheEntry>;
  private readonly maxCacheSize: number;
  private readonly cacheTtlMs: number;
  private cleanupInterval?: NodeJS.Timeout;

  constructor(
    maxCacheSize: number = CONSTANTS.AUDIO_CACHE_MAX_SIZE,
    cacheTtlMs: number = CONSTANTS.AUDIO_CACHE_TTL_MS
  ) {
    this.audioCache = new Map();
    this.maxCacheSize = maxCacheSize;
    this.cacheTtlMs = cacheTtlMs;
    
    this.initializeClient();
    this.startCacheCleanup();
  }

  private initializeClient(): void {
    try {
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

      logger.info('[TTSManager] Initializing TTS client', {
        credentialsPath: credentialsPath || 'using ADC',
      });

      if (credentialsPath) {
        const absolutePath = path.resolve(credentialsPath);

        if (!fs.existsSync(absolutePath)) {
          throw new Error(`Credentials file not found at: ${absolutePath}`);
        }

        const credentialsJson = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));

        this.ttsClient = new TextToSpeechClient({
          credentials: {
            client_email: credentialsJson.client_email,
            private_key: credentialsJson.private_key,
          },
          projectId: credentialsJson.project_id,
        });
      } else {
        logger.warn('[TTSManager] No explicit credentials path, using ADC');
        this.ttsClient = new TextToSpeechClient();
      }

      logger.info('[TTSManager] TTS client initialized successfully');
    } catch (error) {
      logger.error('[TTSManager] Failed to initialize TTS client', error);
      throw new InternalError('TTS initialization failed');
    }
  }

  private startCacheCleanup(): void {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupCache();
    }, 5 * 60 * 1000);

    // Ensure cleanup doesn't prevent process exit
    this.cleanupInterval.unref();
  }

  private cleanupCache(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.audioCache.entries()) {
      if (now - entry.createdAt > this.cacheTtlMs) {
        this.audioCache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.debug(`[TTSManager] Cleaned up ${deletedCount} expired cache entries`);
    }
  }

  private evictOldestEntries(): void {
    if (this.audioCache.size < this.maxCacheSize) return;

    // Sort by creation time and remove oldest entries
    const entries = Array.from(this.audioCache.entries())
      .sort((a, b) => a[1].createdAt - b[1].createdAt);

    const toRemove = entries.slice(0, Math.ceil(this.maxCacheSize * 0.2)); // Remove 20%
    
    for (const [key] of toRemove) {
      this.audioCache.delete(key);
    }

    logger.debug(`[TTSManager] Evicted ${toRemove.length} cache entries`);
  }

  private generateCacheKey(text: string, sessionId: string): string {
    // Create a hash-like key from text content
    const textHash = text.substring(0, 100).replace(/\s+/g, '_');
    return `${sessionId}:${textHash}`;
  }

  async generateAudio(
    text: string,
    sessionId: string,
    retries: number = CONSTANTS.MAX_RETRIES
  ): Promise<string> {
    const cacheKey = this.generateCacheKey(text, sessionId);

    // Check cache
    const cached = this.audioCache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < this.cacheTtlMs) {
      logger.debug(`[TTSManager] Cache hit for session ${sessionId}`);
      return cached.url;
    }

    // Ensure cache doesn't exceed max size
    this.evictOldestEntries();

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        logger.info(`[TTSManager] Generating TTS`, {
          sessionId,
          attempt,
          textLength: text.length,
        });

        const request: ISynthesizeSpeechRequest = {
          input: { text },
          voice: {
            languageCode: CONSTANTS.TTS_LANGUAGE,
            ssmlGender: CONSTANTS.TTS_VOICE_GENDER,
          },
          audioConfig: {
            audioEncoding: CONSTANTS.TTS_AUDIO_ENCODING,
          },
        };

        const [response] = await this.ttsClient.synthesizeSpeech(request);

        if (!response.audioContent) {
          throw new Error('No audio content received from TTS service');
        }

        const audioBuffer = Buffer.from(response.audioContent as Uint8Array);
        const uploadResult = await uploadAudio(audioBuffer, sessionId);
        const url = uploadResult.secureUrl;

        // Cache the result
        this.audioCache.set(cacheKey, {
          url,
          createdAt: Date.now(),
        });

        logger.info(`[TTSManager] Audio generated and uploaded`, {
          sessionId,
          url,
        });

        return url;
      } catch (error) {
        lastError = error as Error;
        
        logger.error(`[TTSManager] TTS generation failed`, {
          sessionId,
          attempt,
          error: lastError.message,
        });

        if (attempt < retries) {
          await this.delay(CONSTANTS.RETRY_DELAY_MS * attempt);
        }
      }
    }

    throw new InternalError(
      `Audio generation failed after ${retries} attempts: ${lastError?.message}`
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      logger.info('[TTSManager] Testing TTS connection...');
      const [result] = await this.ttsClient.listVoices({});
      logger.info(`[TTSManager] TTS connected! Available voices: ${result.voices?.length || 0}`);
      return true;
    } catch (error) {
      logger.error('[TTSManager] TTS connection test failed', error);
      return false;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Cleanup method for graceful shutdown
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.audioCache.clear();
    logger.info('[TTSManager] Destroyed and cleaned up');
  }

  get cacheSize(): number {
    return this.audioCache.size;
  }
}

// Singleton instance with lazy initialization
let ttsManagerInstance: TTSManager | null = null;

export const getTTSManager = (): TTSManager => {
  if (!ttsManagerInstance) {
    ttsManagerInstance = new TTSManager();
  }
  return ttsManagerInstance;
};

// For backwards compatibility
export const ttsManager = new TTSManager();