// src/utils/groq-manager.ts

import Groq from 'groq-sdk';
import { CONSTANTS } from '../config/constants';
import { logger } from './logger';
import { InternalError } from '../lib/errors';

export interface GroqApiOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export class GroqApiManager {
  private groq!: Groq;
  private readonly apiKeys: string[];
  private currentKeyIndex = 0;
  private readonly maxRetries: number;

  constructor(apiKeys: string[], maxRetries: number = CONSTANTS.MAX_RETRIES) {
    this.apiKeys = apiKeys.filter(Boolean);
    this.maxRetries = maxRetries;

    if (this.apiKeys.length === 0) {
      throw new Error('No Groq API keys provided');
    }

    this.initializeClient();
  }

  private initializeClient(): void {
    const apiKey = this.apiKeys[this.currentKeyIndex];
    this.groq = new Groq({
      apiKey,
      timeout: CONSTANTS.API_TIMEOUT_MS,
    });
    logger.info('[GroqManager] Initialized with API key index', {
      index: this.currentKeyIndex,
    });
  }

  private rotateKey(): boolean {
    const nextIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;

    if (nextIndex === 0 && this.currentKeyIndex !== 0) {
      return false;
    }

    this.currentKeyIndex = nextIndex;
    this.initializeClient();
    logger.warn('[GroqManager] Rotated to API key index', {
      index: this.currentKeyIndex,
    });
    return true;
  }

  async callApi(
    prompt: string,
    options: GroqApiOptions = {}
  ): Promise<Groq.Chat.Completions.ChatCompletion> {
    const {
      temperature = CONSTANTS.GROQ_TEMPERATURE,
      maxTokens = CONSTANTS.GROQ_MAX_TOKENS,
      model = CONSTANTS.GROQ_MODEL,
    } = options;

    let lastError: Error | null = null;
    const totalAttempts = this.apiKeys.length * this.maxRetries;

    for (let attempt = 0; attempt < totalAttempts; attempt++) {
      try {
        const result = await this.groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model,
          temperature,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
        });

        logger.debug('[GroqManager] API call successful', {
          attempt: attempt + 1,
          keyIndex: this.currentKeyIndex,
          model,
        });

        return result;
      } catch (error) {
        lastError = error as Error;

        logger.error('[GroqManager] API call failed', {
          attempt: attempt + 1,
          keyIndex: this.currentKeyIndex,
          error: lastError.message,
        });

        if (this.isRateLimitError(error)) {
          const rotated = this.rotateKey();
          if (!rotated) {
            await this.delay(CONSTANTS.RETRY_DELAY_MS * (attempt + 1));
            this.currentKeyIndex = 0;
            this.initializeClient();
          }
        } else if (this.isRetryableError(error)) {
          await this.delay(CONSTANTS.RETRY_DELAY_MS * (attempt + 1));
        } else {
          throw new InternalError(`Groq API error: ${lastError.message}`);
        }
      }
    }

    throw new InternalError(
      `All API attempts exhausted. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  private isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.message.includes('rate_limit') ||
        error.message.includes('429') ||
        (error as any).status === 429
      );
    }
    return false;
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('econnreset') ||
        message.includes('500') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('504')
      );
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  get currentApiKeyIndex(): number {
    return this.currentKeyIndex;
  }

  get totalApiKeys(): number {
    return this.apiKeys.length;
  }
}