// src/utils/groq-manager.ts

import Groq from 'groq-sdk';
import { CONSTANTS } from '../config/constants';
import { logger } from './logger';
import { InternalError } from '../utils/errors';

// =====================================================
// TYPES
// =====================================================

export interface GroqApiOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  responseFormat?: 'json' | 'text';
  systemPrompt?: string;
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqChatOptions extends GroqApiOptions {
  messages: GroqMessage[];
}

type ChatCompletionMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

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

  constructor(apiKeys: string[], maxRetries: number = CONSTANTS.MAX_RETRIES) {
    this.apiKeys = apiKeys.filter(Boolean);
    this.maxRetries = maxRetries;

    if (this.apiKeys.length === 0) {
      throw new Error('No Groq API keys provided');
    }

    this.initializeClient();
  }

  // -------------------------------------------------
  // PUBLIC METHODS
  // -------------------------------------------------

  /**
   * Simple API call with a single prompt
   * Automatically handles JSON response format
   */
  async callApi(
    prompt: string,
    options: GroqApiOptions = {}
  ): Promise<Groq.Chat.Completions.ChatCompletion> {
    const messages: GroqMessage[] = [];

    // Add system prompt if provided
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }

    messages.push({ role: 'user', content: prompt });

    return this.chat({
      messages,
      ...options,
    });
  }

  /**
   * Full chat API with multiple messages
   * Supports system, user, and assistant messages
   */
  async chat(
    options: GroqChatOptions
  ): Promise<Groq.Chat.Completions.ChatCompletion> {
    const {
      messages,
      temperature = CONSTANTS.GROQ_TEMPERATURE,
      maxTokens = CONSTANTS.GROQ_MAX_TOKENS,
      model = CONSTANTS.GROQ_MODEL,
      responseFormat = 'json',
    } = options;

    // Validate and prepare messages
    const preparedMessages = this.prepareMessages(messages, responseFormat);

    let lastError: Error | null = null;
    const totalAttempts = this.apiKeys.length * this.maxRetries;

    for (let attempt = 0; attempt < totalAttempts; attempt++) {
      try {
        // Rate limiting
        await this.throttle();

        // Build request parameters
        const requestParams: {
          messages: ChatCompletionMessage[];
          model: string;
          temperature: number;
          max_tokens: number;
          response_format?: { type: 'json_object' };
        } = {
          messages: preparedMessages,
          model,
          temperature,
          max_tokens: maxTokens,
        };

        // Only add response_format for JSON mode
        if (responseFormat === 'json') {
          requestParams.response_format = { type: 'json_object' };
        }

        const result = await this.groq.chat.completions.create(requestParams);

        this.requestCount++;
        this.lastRequestTime = Date.now();

        logger.debug('[GroqManager] API call successful', {
          attempt: attempt + 1,
          keyIndex: this.currentKeyIndex,
          model,
        });

        return result;
      } catch (error) {
        lastError = error as Error;
        const errorMessage = this.getErrorMessage(error);

        logger.error('[GroqManager] API call failed', {
          attempt: attempt + 1,
          keyIndex: this.currentKeyIndex,
          error: errorMessage,
        });

        // Handle different error types
        if (this.isJsonFormatError(error)) {
          // Fix the prompt and retry immediately
          const fixedMessages = this.ensureJsonInMessages(preparedMessages);
          if (this.messagesAreDifferent(fixedMessages, preparedMessages)) {
            logger.warn('[GroqManager] Fixed missing JSON keyword in prompt');
            // Retry with fixed messages
            try {
              const result = await this.groq.chat.completions.create({
                messages: fixedMessages,
                model,
                temperature,
                max_tokens: maxTokens,
                response_format: { type: 'json_object' },
              });
              return result;
            } catch (retryError) {
              lastError = retryError as Error;
            }
          }
        }

        if (this.isRateLimitError(error)) {
          const rotated = this.rotateKey();
          if (!rotated) {
            await this.delay(this.calculateBackoff(attempt));
            this.currentKeyIndex = 0;
            this.initializeClient();
          }
        } else if (this.isRetryableError(error)) {
          await this.delay(this.calculateBackoff(attempt));
        } else {
          throw new InternalError(`Groq API error: ${errorMessage}`);
        }
      }
    }

    throw new InternalError(
      `All API attempts exhausted. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  /**
   * Generate a simple text completion (no JSON formatting)
   */
  async complete(
    prompt: string,
    options: Omit<GroqApiOptions, 'responseFormat'> = {}
  ): Promise<string> {
    const result = await this.callApi(prompt, {
      ...options,
      responseFormat: 'text',
    });

    return result.choices[0]?.message?.content || '';
  }

  /**
   * Generate and parse JSON response
   */
  async generateJson<T>(
    prompt: string,
    options: Omit<GroqApiOptions, 'responseFormat'> = {}
  ): Promise<T> {
    const result = await this.callApi(prompt, {
      ...options,
      responseFormat: 'json',
    });

    const content = result.choices[0]?.message?.content || '{}';

    try {
      return JSON.parse(content) as T;
    } catch (error) {
      logger.error('[GroqManager] Failed to parse JSON response', {
        content: content.slice(0, 200),
        error: this.getErrorMessage(error),
      });
      throw new InternalError('Failed to parse AI response as JSON');
    }
  }

  // -------------------------------------------------
  // PRIVATE: CLIENT MANAGEMENT
  // -------------------------------------------------

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

    // If we've cycled through all keys, return false
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

  // -------------------------------------------------
  // PRIVATE: MESSAGE HANDLING
  // -------------------------------------------------

  private prepareMessages(
    messages: GroqMessage[],
    responseFormat: 'json' | 'text'
  ): ChatCompletionMessage[] {
    const prepared: ChatCompletionMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // For JSON format, ensure at least one message contains "json"
    if (responseFormat === 'json') {
      return this.ensureJsonInMessages(prepared);
    }

    return prepared;
  }

  /**
   * Ensures that at least one message contains the word "json"
   * Required by Groq when using response_format: { type: 'json_object' }
   */
  private ensureJsonInMessages(
    messages: ChatCompletionMessage[]
  ): ChatCompletionMessage[] {
    // Check if any message already contains "json"
    const hasJson = messages.some((msg) => {
      return msg.content.toLowerCase().includes('json');
    });

    if (hasJson) {
      return messages;
    }

    // Add JSON instruction to system message or create one
    const systemIndex = messages.findIndex((msg) => msg.role === 'system');

    if (systemIndex >= 0) {
      // Append to existing system message
      const updatedMessages = [...messages];
      updatedMessages[systemIndex] = {
        ...updatedMessages[systemIndex],
        content: `${updatedMessages[systemIndex].content}\n\nYou must respond with valid JSON only.`,
      };
      return updatedMessages;
    }

    // Prepend a new system message
    return [
      {
        role: 'system' as const,
        content: 'You are a helpful assistant. You must respond with valid JSON only.',
      },
      ...messages,
    ];
  }

  private messagesAreDifferent(
    a: ChatCompletionMessage[],
    b: ChatCompletionMessage[]
  ): boolean {
    if (a.length !== b.length) return true;
    return a.some((msg, i) => msg.content !== b[i].content);
  }

  // -------------------------------------------------
  // PRIVATE: ERROR HANDLING
  // -------------------------------------------------

  private isRateLimitError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('rate_limit') ||
        message.includes('rate limit') ||
        message.includes('429') ||
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
        message.includes('econnrefused') ||
        message.includes('socket') ||
        message.includes('500') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('504')
      );
    }
    return false;
  }

  private isJsonFormatError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes("'messages' must contain the word 'json'") ||
        message.includes('response_format') ||
        (message.includes('json') && message.includes('400'))
      );
    }
    return false;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  // -------------------------------------------------
  // PRIVATE: RATE LIMITING & BACKOFF
  // -------------------------------------------------

  private async throttle(): Promise<void> {
    const minInterval = CONSTANTS.MIN_REQUEST_INTERVAL_MS || 100;
    const elapsed = Date.now() - this.lastRequestTime;

    if (elapsed < minInterval) {
      await this.delay(minInterval - elapsed);
    }
  }

  private calculateBackoff(attempt: number): number {
    const baseDelay = CONSTANTS.RETRY_DELAY_MS || 1000;
    const maxDelay = 30000; // 30 seconds max
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

    // Add jitter (±25%)
    const jitter = delay * 0.25 * (Math.random() * 2 - 1);
    return Math.round(delay + jitter);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // -------------------------------------------------
  // PUBLIC: GETTERS
  // -------------------------------------------------

  get currentApiKeyIndex(): number {
    return this.currentKeyIndex;
  }

  get totalApiKeys(): number {
    return this.apiKeys.length;
  }

  get stats(): { requestCount: number; currentKey: number; totalKeys: number } {
    return {
      requestCount: this.requestCount,
      currentKey: this.currentKeyIndex,
      totalKeys: this.apiKeys.length,
    };
  }
}