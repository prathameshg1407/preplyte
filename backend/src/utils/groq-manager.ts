// src/utils/groq-manager.ts

import Groq from 'groq-sdk';
import { CONSTANTS } from '../config/constants';
import { logger } from './logger';
import { InternalError } from './errors';
import { tokenTracker, TokenCallType } from './token-tracker';

// =====================================================
// TYPES
// =====================================================

export interface TokenTrackingContext {
  callType?: TokenCallType;
  sessionId?: string;
  userId?: string;
}

export interface CompleteOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  jsonMode?: boolean;
  tracking?: TokenTrackingContext;
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqChatOptions extends CompleteOptions { // Extend CompleteOptions
  messages: GroqMessage[];
  responseFormat?: 'json' | 'text'; // Add responseFormat here
}

type ChatCompletionMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// Define our own params type to avoid SDK version issues
interface ChatCompletionRequestParams {
  messages: ChatCompletionMessage[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' | 'text' };
}

// =====================================================
// MANAGER CLASS
// =====================================================

export class GroqApiManager {
  private groq!: Groq;
  private readonly apiKeys: string[];
  private currentKeyIndex = 0;
  private readonly maxRetries: number;
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly keyExhausted: Set<number> = new Set();
  private keyExhaustionResetTime = 0;

  constructor(
    apiKeys: string[] = [],
    maxRetries: number = CONSTANTS.MAX_RETRIES ?? 3
  ) {
    this.apiKeys = apiKeys.length > 0
      ? apiKeys.filter(Boolean)
      : GroqApiManager.getApiKeysFromEnv();
    this.maxRetries = maxRetries;

    if (this.apiKeys.length === 0) {
      throw new Error('No Groq API keys provided');
    }

    this.initializeClient();
  }

  /**
   * Collect all Groq API keys from environment variables
   * Checks GROQ_API_KEYS (comma separated), GROQ_API_KEY, and GROQ_API_KEY_1..4
   */
  static getApiKeysFromEnv(): string[] {
    const keys: string[] = [];

    // Comma separated list
    if (process.env.GROQ_API_KEYS) {
      keys.push(...process.env.GROQ_API_KEYS.split(',').filter(Boolean));
    }

    // Single key
    if (process.env.GROQ_API_KEY) {
      keys.push(process.env.GROQ_API_KEY);
    }

    // Numbered keys (as provided by user)
    for (let i = 1; i <= 10; i++) {
      const key = process.env[`GROQ_API_KEY_${i}`];
      if (key) keys.push(key);
    }

    // Unique keys only
    return Array.from(new Set(keys)).filter(Boolean);
  }

  // ===================================================
  // PUBLIC METHODS
  // ===================================================

  // Removed callApi as complete and chat are the primary entry points

  async chat(options: GroqChatOptions): Promise<Groq.Chat.ChatCompletion> {
    const {
      messages,
      temperature = CONSTANTS.GROQ_TEMPERATURE ?? 0.7,
      maxTokens = CONSTANTS.GROQ_MAX_TOKENS ?? 2048,
      model = CONSTANTS.GROQ_MODEL ?? 'llama-3.1-70b-versatile',
      responseFormat = 'text', // Default to text
      systemPrompt, // Take systemPrompt from options
      tracking,
    } = options;

    const preparedMessages = this.prepareMessages(messages, responseFormat, systemPrompt);

    if (Date.now() - this.keyExhaustionResetTime > 60000) {
      this.keyExhausted.clear();
      this.keyExhaustionResetTime = Date.now();
    }

    let lastError: Error | null = null;

    for (let keyAttempt = 0; keyAttempt < this.apiKeys.length; keyAttempt++) {
      let keyIndex = -1;
      for (let i = 0; i < this.apiKeys.length; i++) {
        const checkIndex = (this.currentKeyIndex + i) % this.apiKeys.length;
        if (!this.keyExhausted.has(checkIndex)) {
          keyIndex = checkIndex;
          break;
        }
      }

      if (keyIndex === -1) {
        logger.warn('[GroqManager] All keys exhausted, waiting...');
        await this.delay(5000);
        this.keyExhausted.clear();
        keyIndex = 0;
      }

      this.currentKeyIndex = keyIndex;
      this.initializeClient();

      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        try {
          await this.throttle();

          const callStart = Date.now();

          // Fixed: Use inline object instead of typed variable
          const response = await this.groq.chat.completions.create({
            messages: preparedMessages,
            model,
            temperature,
            max_tokens: maxTokens,
            ...(responseFormat === 'json' && {
              response_format: { type: 'json_object' as const },
            }),
          });

          const callDurationMs = Date.now() - callStart;
          this.requestCount++;
          this.lastRequestTime = Date.now();

          // ── Token Tracking ──────────────────────────────────
          const usage = response.usage;
          if (usage) {
            tokenTracker.record({
              timestamp: new Date().toISOString(),
              callType: tracking?.callType ?? 'other',
              model,
              promptTokens: usage.prompt_tokens ?? 0,
              completionTokens: usage.completion_tokens ?? 0,
              totalTokens: usage.total_tokens ?? (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0),
              durationMs: callDurationMs,
              sessionId: tracking?.sessionId,
              userId: tracking?.userId,
              keyIndex: this.currentKeyIndex,
              success: true,
            });
          }
          // ────────────────────────────────────────────────────

          logger.debug('[GroqManager] API call successful', {
            attempt: attempt + 1,
            keyIndex: this.currentKeyIndex,
            model,
            totalTokens: usage?.total_tokens,
          });

          return response;
        } catch (error) {
          lastError = error as Error;
          const errorMessage = this.getErrorMessage(error);

          logger.warn('[GroqManager] API call failed', {
            attempt: attempt + 1,
            keyIndex: this.currentKeyIndex,
            error: errorMessage,
          });

          if (this.isRateLimitError(error)) {
            this.keyExhausted.add(this.currentKeyIndex);
            logger.warn('[GroqManager] Rate limit, marking key exhausted', {
              keyIndex: this.currentKeyIndex,
            });
            break;
          }

          if (this.isRetryableError(error) && attempt < this.maxRetries - 1) {
            await this.delay(this.calculateBackoff(attempt));
            continue;
          }

          if (!this.isRetryableError(error)) {
            throw new InternalError(`Groq API error: ${errorMessage}`);
          }
        }
      }
    }

    throw new InternalError(
      `All API attempts exhausted. Last error: ${lastError?.message || 'Unknown'}`
    );
  }

  async complete(
    prompt: string,
    options: Omit<CompleteOptions, 'responseFormat'> = {}
  ): Promise<string> {
    const result = await this.chat({
      messages: [{ role: 'user', content: prompt }],
      ...options,
      responseFormat: 'text',
    });

    return result.choices[0]?.message?.content || '';
  }

  async generateJson<T>(
    prompt: string,
    options: Omit<CompleteOptions, 'responseFormat'> = {}
  ): Promise<T> {
    const result = await this.chat({
      messages: [{ role: 'user', content: prompt }],
      ...options,
      responseFormat: 'json',
    });

    const content = result.choices[0]?.message?.content || '{}';

    try {
      return JSON.parse(content) as T;
    } catch (error) {
      logger.error('[GroqManager] Failed to parse JSON response', {
        content: content.slice(0, 500),
        error: this.getErrorMessage(error),
      });

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]) as T;
        } catch {
          // Fall through to error
        }
      }

      throw new InternalError('Failed to parse AI response as JSON');
    }
  }

  // ===================================================
  // GETTERS
  // ===================================================

  get currentApiKeyIndex(): number {
    return this.currentKeyIndex;
  }

  get totalApiKeys(): number {
    return this.apiKeys.length;
  }

  get stats(): {
    requestCount: number;
    currentKey: number;
    totalKeys: number;
    exhaustedKeys: number;
  } {
    return {
      requestCount: this.requestCount,
      currentKey: this.currentKeyIndex,
      totalKeys: this.apiKeys.length,
      exhaustedKeys: this.keyExhausted.size,
    };
  }

  // ===================================================
  // PRIVATE: CLIENT MANAGEMENT
  // ===================================================

  private initializeClient(): void {
    const apiKey = this.apiKeys[this.currentKeyIndex];
    this.groq = new Groq({
      apiKey,
      timeout: CONSTANTS.API_TIMEOUT_MS ?? 30000,
    });
  }

  // ===================================================
  // PRIVATE: MESSAGE HANDLING
  // ===================================================

  private prepareMessages(
    messages: GroqMessage[],
    responseFormat: 'json' | 'text',
    systemPrompt?: string
  ): ChatCompletionMessage[] {
    const prepared: ChatCompletionMessage[] = [];
    
    if (systemPrompt) {
      prepared.push({ role: 'system', content: systemPrompt });
    }

    prepared.push(...messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })));

    if (responseFormat === 'json') {
      return this.ensureJsonInMessages(prepared);
    }

    return prepared;
  }

  private ensureJsonInMessages(
    messages: ChatCompletionMessage[]
  ): ChatCompletionMessage[] {
    const hasJson = messages.some((msg) =>
      msg.content.toLowerCase().includes('json')
    );

    if (hasJson) return messages;

    const systemIndex = messages.findIndex((msg) => msg.role === 'system');

    if (systemIndex >= 0) {
      const updated = [...messages];
      updated[systemIndex] = {
        ...updated[systemIndex],
        content: `${updated[systemIndex].content}\n\nRespond with valid JSON only.`,
      };
      return updated;
    }

    return [
      {
        role: 'system' as const,
        content: 'You are a helpful assistant. Respond with valid JSON only.',
      },
      ...messages,
    ];
  }

  // ===================================================
  // PRIVATE: ERROR HANDLING
  // ===================================================

  private isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      const errorWithStatus = error as Error & { status?: number };
      return (
        message.includes('rate_limit') ||
        message.includes('rate limit') ||
        message.includes('429') ||
        message.includes('too many requests') ||
        errorWithStatus.status === 429
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
        message.includes('econnrefused') ||
        message.includes('socket') ||
        message.includes('500') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('504') ||
        message.includes('service unavailable')
      );
    }
    return false;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }

  // ===================================================
  // PRIVATE: RATE LIMITING & BACKOFF
  // ===================================================

  private async throttle(): Promise<void> {
    const minInterval = CONSTANTS.MIN_REQUEST_INTERVAL_MS ?? 100;
    const elapsed = Date.now() - this.lastRequestTime;

    if (elapsed < minInterval) {
      await this.delay(minInterval - elapsed);
    }
  }

  private calculateBackoff(attempt: number): number {
    const baseDelay = CONSTANTS.RETRY_DELAY_MS ?? 1000;
    const maxDelay = 30000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

    const jitter = delay * 0.25 * (Math.random() * 2 - 1);
    return Math.round(delay + jitter);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}